import { useRef, useState } from 'react';
import RegistrarResolucionHeader  from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll  from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter  from './components/RegistrarResolucionFooter';
import './RegistrarResolucionPage.css';

import { getIdPersonaFromAppJwt } from '../../services/api';
import { useCreateResolucionCompletaMutation } from '../../services/resolucionOrchestratorApi';
import {
  useCreateResolutionMutation,
  usePatchResolutionMutation,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} from '../../services/resolutionsApi';

/* ---------------- helpers genéricos ---------------- */
const removeNullish = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== null && v !== undefined));

const hasKeys = (obj) => obj && Object.keys(obj).length > 0;

const toIsoOrNull = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0)).toISOString();
};
const normFrac = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n > 1 ? n / 100 : n;
};
const numOrUndef = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/* ---------------- payloads ---------------- */
// FINAL (completo, usado solo en "Finalizar")
const buildResolutionPayload = (resData, isFinal) => {
  const numero       = (resData?.Numero ?? resData?.numero ?? '—').toString().trim();
  const titulo       = (resData?.Titulo ?? resData?.titulo ?? numero).toString().trim();
  const descripcion  = (resData?.Descripcion ?? resData?.descripcion ?? '—').toString().trim();
  const fechaResol   = resData?.FechaResolucion ?? resData?.fechaResolucion ?? null;
  const fechaVig     = resData?.FechaVigencia   ?? resData?.fechaVigencia   ?? null;
  const idUsuario    = getIdPersonaFromAppJwt() ?? 0;

  return {
    IdUsuario: idUsuario,
    Codigo: numero,
    Titulo: titulo,
    Descripcion: descripcion,
    FechaResolucion: toIsoOrNull(fechaResol),
    FechaVigencia:   toIsoOrNull(fechaVig),
    Completed: !!isFinal,
  };
};

// BORRADOR (parcial, usado en "Guardar" -> PATCH con lo disponible)
const buildResolutionDraftPatch = (resData) => {
  const rawNumero = resData?.Numero ?? resData?.numero;
  const rawTitulo = resData?.Titulo ?? resData?.titulo;
  const rawDesc   = resData?.Descripcion ?? resData?.descripcion;
  const fechaResol = resData?.FechaResolucion ?? resData?.fechaResolucion;
  const fechaVig   = resData?.FechaVigencia   ?? resData?.fechaVigencia;

  const IdUsuario = getIdPersonaFromAppJwt() ?? undefined; // incluye si tu backend lo requiere

  return removeNullish({
    Codigo:        rawNumero?.toString().trim(),
    Titulo:        rawTitulo?.toString().trim(),
    Descripcion:   rawDesc?.toString().trim(),
    FechaResolucion: toIsoOrNull(fechaResol),
    FechaVigencia:   toIsoOrNull(fechaVig),
    Completed: false,
    IdUsuario,
  });
};

/* normalizador distribuciones (para finalizar) */
const normalizeDistribuciones = (rawDistribs) => {
  const arr = Array.isArray(rawDistribs) ? rawDistribs : [];
  return arr.map((d) => {
    const rawAutores =
      d?.PorcSubtotalAutores ?? d?.porcSubtotalAutores ?? 0;
    const rawInstit =
      d?.PorcSubtotalInstituciones ?? d?.porcSubtotalInstituciones ??
      d?.PorcSubtotalInstitut ?? d?.porcSubtotalInstitut ?? 0;

    const MontoMinimo = numOrUndef(d?.MontoMinimo) ?? 0;
    const MontoMaximo = numOrUndef(d?.MontoMaximo) ?? 0;

    const PorcSubtotalAutores  = normFrac(rawAutores) ?? 0;
    const PorcSubtotalInstitut = normFrac(rawInstit) ?? 0;

    const beneficiariosSrc = Array.isArray(d?.BeneficiariosInstitucionales)
      ? d.BeneficiariosInstitucionales
      : [];

    const beneficiarios = beneficiariosSrc
      .map((b) => ({
        IdBenefInstitucion: Number(b?.IdBenefInstitucion ?? 0),
        Porcentaje: normFrac(b?.Porcentaje ?? (b?.PorcentajePct ?? 0)) ?? 0,
      }))
      .filter((x) => Number.isFinite(x.IdBenefInstitucion) && x.IdBenefInstitucion > 0);

    return {
      MontoMinimo,
      MontoMaximo,
      PorcSubtotalAutores,
      PorcSubtotalInstitut,
      beneficiarios,
    };
  });
};

/* draft PATCH para distribución (solo lo presente) */
const getDistribId = (d) =>
  d?.Id ?? d?.id ?? d?.IdDistribucion ?? d?.idDistribucion ?? d?.IdDistribucionResolucion ?? null;

const buildDistributionDraftPatch = (d) => {
  const body = {
    MontoMinimo: numOrUndef(d?.MontoMinimo),
    MontoMaximo: numOrUndef(d?.MontoMaximo),
  };

  // Solo incluir % cuando vienen definidos:
  if (d?.PorcSubtotalAutores !== undefined) {
    const v = normFrac(d?.PorcSubtotalAutores);
    if (v !== undefined) body.PorcSubtotalAutores = v;
  }
  if (d?.PorcSubtotalInstituciones !== undefined || d?.PorcSubtotalInstitut !== undefined) {
    const v = normFrac(d?.PorcSubtotalInstituciones ?? d?.PorcSubtotalInstitut);
    if (v !== undefined) body.PorcSubtotalInstitut = v;
  }

  return removeNullish(body);
};

const RegistrarResolucionPage = ({ onBack, onSuccess }) => {
  const [formError, setErr]         = useState(false);
  const [shake, setShake]           = useState({ form: false });
  const [submitting, setSubmitting] = useState(false);
  const [resolutionId, setResolutionId] = useState(null);

  // FINALIZAR (orquestador)
  const [createResolucionCompleta] = useCreateResolucionCompletaMutation();

  // BORRADOR / PARCIALES
  const [createResolution]     = useCreateResolutionMutation();
  const [patchResolution]      = usePatchResolutionMutation();
  const [createDistribution]   = useCreateDistributionMutation();
  const [patchDistribution]    = usePatchDistributionMutation();

  const formRef   = useRef();
  const scrollRef = useRef();

  /* ---------------- Guardar (BORRADOR / INCOMPLETO) ---------------- */
  const handleSave = async () => {
    try {
      setSubmitting(true);

      const rawForm =
        (formRef.current.getPayload && formRef.current.getPayload()) ||
        (formRef.current.getRaw && formRef.current.getRaw()) ||
        {};
      const distribucionesRaw = scrollRef.current?.getDistribuciones?.() ?? [];

      // 1) Resolución: POST (si no existe) o PATCH parcial con lo disponible
      const draftPatch = buildResolutionDraftPatch(rawForm);

      if (!resolutionId) {
        if (hasKeys(draftPatch)) {
          const { id } = await createResolution(draftPatch).unwrap();
          if (id) setResolutionId(id);
        }
      } else {
        if (hasKeys(draftPatch)) {
          await patchResolution({ id: resolutionId, body: draftPatch }).unwrap();
        }
      }

      // 2) Distribuciones: por cada ítem, PATCH si trae id; si no trae id y hay campos -> POST
      const IdUsuarioCrea = getIdPersonaFromAppJwt() ?? 0;

      for (const d of Array.isArray(distribucionesRaw) ? distribucionesRaw : []) {
        const distId = getDistribId(d);
        const bodyPartial = buildDistributionDraftPatch(d);

        if (!hasKeys(bodyPartial)) continue; // nada que persistir

        if (distId) {
          // PATCH parcial
          await patchDistribution({ id: distId, body: bodyPartial }).unwrap();
        } else if (resolutionId) {
          // Sembrar distribución borrador (POST con lo disponible)
          await createDistribution({
            resolutionId,
            body: removeNullish({
              IdResolucion: resolutionId,
              ...bodyPartial,
              IdUsuarioCrea, // requerido por DB en tu proyecto
            }),
          }).unwrap();
        }
      }

      console.groupCollapsed('[BORRADOR] Guardado parcial');
      console.log('form(parcial):', draftPatch);
      console.log('distribuciones(parcial):', distribucionesRaw);
      console.groupEnd();

      alert('Borrador guardado (solo campos disponibles).');

    } catch (err) {
      console.groupCollapsed('[BORRADOR – ERROR]');
      console.error(err);
      console.groupEnd();
      alert(`Ocurrió un error al guardar el borrador.\n${String(err?.message || err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Finalizar (completo + validaciones) ---------------- */
  const handleFinish = async () => {
    setSubmitting(true);
    setErr(false);
    setShake({ form: false });

    try {
      const { valido, payloadResolucion } = formRef.current.validate();
      const distribsOk = scrollRef.current.validate();
      if (!(valido && distribsOk)) {
        setErr(true);
        setShake({ form: !(valido && distribsOk) });
        console.warn('[VALIDACIÓN] Finalizar bloqueado:', { formValido: valido, distribucionesValidas: distribsOk });
        return;
      }

      const resolutionPayload = buildResolutionPayload(payloadResolucion, true);
      const distribucionesRaw = scrollRef.current.getDistribuciones();
      const distribuciones = normalizeDistribuciones(distribucionesRaw);

      const payload = { resolucion: resolutionPayload, distribuciones };
      const result = await createResolucionCompleta(payload).unwrap();

      const newResolutionId = result?.resolutionId ?? null;
      if (!newResolutionId) throw new Error('Orquestador no devolvió resolutionId');
      setResolutionId(newResolutionId);

      alert('¡Resolución registrada con éxito!');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      console.groupCollapsed('[FINALIZAR – ERROR]');
      console.error(err);
      console.groupEnd();
      alert(`Ocurrió un error al registrar. Revisa la consola.\n${String(err?.message || err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      <RegistrarResolucionHeader onBack={onBack} />

      <div className="registrar-resolucion-page">
        <RegistrarResolucionScroll
          ref={scrollRef}
          shakeFormulario={formError && shake.form}
          formularioRef={formRef}
        />

        <RegistrarResolucionFooter
          resolutionId={resolutionId}
          onSave={submitting ? () => {} : handleSave}
          onFinish={submitting ? () => {} : handleFinish}
          formError={formError}
          shakeError={formError && shake.form}
        />

        {submitting && <div className="warning-msg">Guardando… no cierres esta ventana.</div>}
        {formError && (
          <div className="warning-msg">
            Debe llenar correctamente el formulario y las distribuciones.
          </div>
        )}
      </div>
    </main>
  );
};

export default RegistrarResolucionPage;
