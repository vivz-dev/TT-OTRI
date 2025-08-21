import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './Scroll.css';
import DatosTecnologia from './DatosTecnologia';
import Cotitularidad from './Cotitularidad';
import AcuerdoDistribucion from './AcuerdoDistribucion';

import {
  useUpsertTechnologyWithProtectionsMutation,
  useFinalizeTechnologyWithProtectionsMutation,
} from '../../../services/technologyOrchestratorApi';

import { useUploadToDspaceMutation, useCreateArchivoMutation } from '../../../services/storage/archivosApi';
import { uploadAndSaveArchivo } from '../../../services/storage/archivosOrchestrator';

import * as Buttons from '../../layouts/buttons/buttons_index';

const DEFAULT_ID_COLECCION = 155;
const TIPO_ENTIDAD_PROTECCION = 'PI';

const Scroll = forwardRef((_, ref) => {
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('Debe llenar todos los campos.');
  const [mostrarPasoCotitularidad, setMostrarPasoCotitularidad] = useState(true);
  const [technologyId, setTechnologyId] = useState(null);

  const datosRef = useRef();
  const cotiRef = useRef();
  const distRef = useRef();

  const [upsertTech] = useUpsertTechnologyWithProtectionsMutation();
  const [finalizeTech] = useFinalizeTechnologyWithProtectionsMutation();

  const [uploadToDspace] = useUploadToDspaceMutation();
  const [createArchivo]  = useCreateArchivoMutation();

  const showWarn = (text, gotoStep) => {
    setWarningText(text);
    setShowWarning(true);
    if (typeof gotoStep === 'number') setStep(gotoStep);
  };

  /** ─────────────────── Subida de archivos usando ids de protecciones ─────────────────── */
  const uploadFilesForProtections = async ({ unified, protecciones }) => {
    const files = Array.isArray(unified?.archivos) ? unified.archivos : [];
    if (!protecciones || protecciones.length === 0) {
      console.log('[UI] No hay protecciones para subir archivos (pudo ser "No aplica").');
      return { ok: true, uploaded: 0, failed: 0 };
    }

    // Mapear tipoId -> idProteccion
    const mapProt = new Map();
    for (const p of protecciones) {
      if (p?.tipoId != null && p?.id != null) mapProt.set(Number(p.tipoId), Number(p.id));
    }

    let uploaded = 0, failed = 0;

    for (let i = 0; i < files.length; i++) {
      const item = files[i] || {};
      const { idTipoProteccion, file } = item;
      if (!file) {
        console.log(`[UI] Archivo #${i} sin file. Omitido.`);
        continue;
      }
      const protId = mapProt.get(Number(idTipoProteccion));
      if (!protId) {
        console.warn(`[UI] No existe idProteccion para tipo=${idTipoProteccion}. Omitido.`);
        continue;
      }

      const titleFallback = `${unified?.tecnologia?.titulo ?? 'Tecnología'} - Tipo ${idTipoProteccion}`;

      // ⚠️ Importante: NO enviar identificacion ni nombresAutor desde aquí.
      // Deja que el orquestador los derive del JWT (string) para cumplir con DSpace.
      const meta = {
        idTEntidad: protId,
        tipoEntidad: TIPO_ENTIDAD_PROTECCION,
        idColeccion: item?.dspace?.idColeccion ?? DEFAULT_ID_COLECCION,
        titulo: item?.dspace?.titulo ?? titleFallback,
        // nombresAutor: (si alguna vez lo pasas, haz String(...))
        // identificacion: (si alguna vez lo pasas, haz String(...))
      };

      console.log('[UI] Upload archivo =>', {
        idx: i, protId, idTipoProteccion, fileName: file?.name ?? null, meta,
      });

      try {
        await uploadAndSaveArchivo({ file, meta, uploadToDspace, createArchivo });
        uploaded += 1;
      } catch (e) {
        console.error('[UI] Error subiendo archivo:', e);
        failed += 1;
      }
    }

    console.log(`[UI] Uploads finalizados => uploaded=${uploaded}, failed=${failed}`);
    return { ok: failed === 0, uploaded, failed };
  };

  /** ─────────────────── Guardar (envía TODO lo disponible) ─────────────────── */
  const saveDraft = async () => {
    try {
      const draftUnified = datosRef.current?.getDraftPayload?.() || { tecnologia:{}, protecciones:[], archivos:[] };
      console.log('[UI] saveDraft unified payload =>', {
        tecnologia: draftUnified.tecnologia,
        protecciones: draftUnified.protecciones,
        archivos: draftUnified.archivos?.map((a, i) => ({
          i, idTipoProteccion: a.idTipoProteccion, hasFile: !!a.file, fileName: a.file?.name ?? null, fecha: a.fecha, dspace: a.dspace
        })),
      });

      // 1) upsert tecnología + (posibles) protecciones (completed:false)
      const res = await upsertTech({ currentId: technologyId, data: draftUnified }).unwrap();
      console.log('[UI] saveDraft upsert response =>', res);

      const idTec = res?.id ?? technologyId;
      if (idTec) setTechnologyId(idTec);

      // 2) subir archivos si hay ids de protecciones
      const up = await uploadFilesForProtections({ unified: draftUnified, protecciones: res?.protecciones ?? [] });

      if (!up.ok) {
        const warn = `Guardado parcial: hubo errores subiendo ${up.failed} archivo(s).`;
        console.warn(warn);
        setShowWarning(true);
        setWarningText(warn);
      } else {
        setShowWarning(false);
      }

      return { ok: true, id: idTec, uploads: up };
    } catch (err) {
      console.error('Error guardando borrador:', err);
      const msg =
        (typeof err?.data === 'string' && err.data) ||
        err?.data?.message ||
        err?.error ||
        'No se pudo guardar.';
      showWarn(msg);
      return { ok: false, message: msg };
    }
  };

  /** ─────────────────── Navegación ─────────────────── */
  const handleNext = async () => {
    if (step === 0) {
      const isValid = datosRef.current?.validate();
      console.log('[UI] handleNext step=0 => canAdvance:', !!isValid);
      if (!isValid) {
        showWarn('Completa: nombre, descripción, tipo(s), archivo(s), fecha(s) (si aplica) y cotitularidad.', 0);
        return;
      }
      const hayCotitularidad = datosRef.current?.getCotitularidad();

      try {
        const draftUnified = datosRef.current?.getDraftPayload?.();
        console.log('[UI] handleNext step=0 draft unified =>', draftUnified);

        const res = await upsertTech({ currentId: technologyId, data: draftUnified }).unwrap();
        console.log('[UI] handleNext step=0 upsert response =>', res);

        const id = res?.id ?? technologyId;
        if (!id) throw new Error('La API no devolvió id de tecnología.');

        setTechnologyId(id);
        setMostrarPasoCotitularidad(!!hayCotitularidad);
        setShowWarning(false);
        setStep(hayCotitularidad ? 1 : 2);
      } catch (err) {
        const msg =
          (typeof err?.data === 'string' && err.data) ||
          err?.data?.message ||
          err?.error ||
          'No se pudo crear/guardar la tecnología.';
        console.error('Error creando tecnología:', err);
        showWarn(msg, 0);
      }
      return;
    }

    if (step === 1) {
      const okCot = cotiRef.current?.validate();
      console.log('[UI] handleNext step=1 => canAdvance:', !!okCot);
      if (!okCot) {
        showWarn('Cotitularidad incompleta. Verifica filas y que el total sume 100%.', 1);
        return;
      }
    }

    setShowWarning(false);
    setStep((p) => Math.min(p + 1, 2));
  };

  const handlePrev = () => {
    if (step === 2 && !mostrarPasoCotitularidad) setStep(0);
    else setStep((p) => Math.max(p - 1, 0));
  };

  /** ─────────────────── Finalizar ─────────────────── */
  useImperativeHandle(ref, () => ({
    saveDraft,
    finalize: async () => {
      const okDatos = datosRef.current?.validate();
      console.log('[UI] finalize => step0 valid:', !!okDatos);
      if (!okDatos) {
        showWarn('Datos de tecnología incompletos. Revisa campos del paso 0.', 0);
        return { ok: false, message: 'Datos incompletos' };
      }

      const hayCot = datosRef.current?.getCotitularidad();
      if (hayCot) {
        const okCot = cotiRef.current?.validate();
        console.log('[UI] finalize => step1 valid:', !!okCot);
        if (!okCot) {
          showWarn('Cotitularidad incompleta. Asegura que el total sume 100%.', 1);
          return { ok: false, message: 'Cotitularidad incompleta' };
        }
      }

      const okDist = distRef.current?.validate?.() ?? true;
      console.log('[UI] finalize => step2 valid:', !!okDist);
      if (!okDist) {
        showWarn('Acuerdo de distribución incompleto.', 2);
        return { ok: false, message: 'Acuerdo de distribución incompleto' };
      }

      try {
        const unified = datosRef.current.getPayload();
        console.log('[UI] Finalize unified payload =>', {
          tecnologia: unified?.tecnologia,
          protecciones: unified?.protecciones,
          archivos: unified?.archivos?.map((a, i) => ({
            i, idTipoProteccion: a.idTipoProteccion, hasFile: !!a.file, fileName: a.file?.name ?? null, fecha: a.fecha, dspace: a.dspace
          })),
        });

        // 1) tecnología (completed:true) + protecciones
        const res = await finalizeTech({ currentId: technologyId, data: unified }).unwrap();
        console.log('[UI] finalize response (tech+protecciones) =>', res);

        const idTec = res?.id ?? technologyId;
        if (!idTec) throw new Error('No se obtuvo id de tecnología al finalizar.');
        setTechnologyId(idTec);

        // 2) archivos
        const up = await uploadFilesForProtections({ unified, protecciones: res?.protecciones ?? [] });

        if (!up.ok) {
          const warn = `Se finalizaron datos, pero hubo errores subiendo ${up.failed} archivo(s).`;
          console.warn(warn);
          setShowWarning(true);
          setWarningText(warn);
        } else {
          setShowWarning(false);
        }

        return { ok: true, id: idTec, uploads: up };
      } catch (err) {
        const serverMsg =
          (typeof err?.data === 'string' && err.data) ||
          err?.data?.message ||
          err?.error ||
          'Error al finalizar.';
        console.error('Finalize error:', err);
        showWarn(serverMsg, step);
        return { ok: false, message: serverMsg };
      }
    },
  }));

  return (
    <section className="step-scroll">
      <nav className="stepper">
        {[0, 1, 2].map((idx) => {
          const state =
            idx < step || (step === 2 && idx === 1 && !mostrarPasoCotitularidad)
              ? 'completed'
              : idx === step
              ? 'active'
              : 'pending';
          return <div key={idx} className={`step ${state}`} />;
        })}
      </nav>

      <div className="step-content">
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <DatosTecnologia ref={datosRef} />
        </div>

        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Cotitularidad ref={cotiRef} technologyId={technologyId} />
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <AcuerdoDistribucion ref={distRef} technologyId={technologyId} />
        </div>
      </div>

      <div className="step-actions">
        {step > 0 ? (
          <div className="left">
            <Buttons.RegisterButton onClick={handlePrev} text={"Anterior"} />
          </div>
        ) : (
          <span />
        )}

        {step < 2 ? (
          <div className="right">
            <Buttons.RegisterButton onClick={handleNext} text={"Siguiente"} />
          </div>
        ) : (
          <span />
        )}
      </div>

      {showWarning && <div className="warning-msg">{warningText}</div>}
    </section>
  );
});

export default Scroll;
