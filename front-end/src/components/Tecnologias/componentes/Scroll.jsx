// src/pages/Resoluciones/componentes/Scroll.jsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './Scroll.css';
import RegisterButton from '../../layouts/buttons/RegisterButton';

// Formularios
import DatosTecnologia from './DatosTecnologia';
import Cotitularidad from './Cotitularidad';
import AcuerdoDistribucion from './AcuerdoDistribucion';

// Hooks de API (RTK Query)
import { useCreateTechnologyMutation, /* opcional */ useUpdateTechnologyMutation } from '../../../services/technologiesApi';
import { useCreateForTechnologyMutation } from '../../../services/cotitularidadesApi';
import { useCreateUnderCotitularidadMutation } from '../../../services/cotitularesApi';
import { useResolveInstitMutation } from '../../../services/cotitularInstitApi';

const Scroll = forwardRef((_, ref) => {
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('Debe llenar todos los campos.');
  const [mostrarPasoCotitularidad, setMostrarPasoCotitularidad] = useState(true);

  const [technologyId, setTechnologyId] = useState(null);

  const datosRef = useRef();
  const cotiRef = useRef();
  const distRef = useRef();

  const [createTech] = useCreateTechnologyMutation();
  // Si aún no tienes este hook, lo puedes crear (abajo dejo ejemplo).
  const [updateTech] = (useUpdateTechnologyMutation?.() ?? [null]);

  const [createCotitularidad] = useCreateForTechnologyMutation();
  const [createCotitular] = useCreateUnderCotitularidadMutation();
  const [resolveInstit] = useResolveInstitMutation();

  const showWarn = (text, gotoStep) => {
    setWarningText(text);
    setShowWarning(true);
    if (typeof gotoStep === 'number') setStep(gotoStep);
  };

  /* ---------------------------------------------
   * NUEVO: Guardar como borrador (incompleto)
   * --------------------------------------------- */
  const saveDraft = async () => {
    try {
      // Pide al paso 0 lo que tenga hasta ahora (parcial).
      // Implementa getDraftPayload() en DatosTecnologia (ver sección 3).
      let draft = datosRef.current?.getDraftPayload?.();

      // Si no existe, tratamos de construir algo mínimo:
      if (!draft) {
        const maybe = datosRef.current?.getPayload?.() || {};
        draft = {
          nombre: maybe.nombre || '',
          descripcion: maybe.descripcion || '',
          tiposProteccion: maybe.tiposProteccion || [],
          archivos: maybe.archivos || [],
          fechasPorTipo: maybe.fechasPorTipo || {},
        };
      }

      // Fuerza incompleto
      const draftPayload = { ...draft, completed: false };

      // Create si aún no hay id, si hay id intenta update (si existe hook); sino reintenta create idempotente
      if (!technologyId) {
        const resp = await createTech(draftPayload).unwrap();
        const id = resp?.id ?? resp?.idTecnologia ?? resp?.technologyId;
        if (id) setTechnologyId(id);
      } else if (updateTech) {
        await updateTech({ id: technologyId, body: draftPayload }).unwrap();
      } else {
        // Fallback si no tienes update todavía: intenta recrear (si tu backend es idempotente por hash/campo)
        await createTech({ id: technologyId, ...draftPayload }).unwrap();
      }

      setShowWarning(false);
      alert('Borrador guardado.');
    } catch (err) {
      console.error('Error guardando borrador:', err);
      const msg =
        (typeof err?.data === 'string' && err.data) ||
        err?.data?.message ||
        err?.error ||
        'No se pudo guardar el borrador.';
      showWarn(msg);
    }
  };

  // ▶️ Siguiente (igual que ya tenías) ...
  const handleNext = async () => {
    if (step === 0) {
      const isValid = datosRef.current?.validate();
      if (!isValid) {
        showWarn(
          'Completa: nombre, descripción, selecciona al menos un tipo de protección, adjunta archivo(s) y fecha(s) si aplica, y elige si existe cotitularidad.',
          0
        );
        return;
      }

      const hayCotitularidad = datosRef.current?.getCotitularidad();
      const payload = datosRef.current?.getPayload?.();

      try {
        let id = technologyId;
        if (!id) {
          const techResp = await createTech({ ...payload, completed: false }).unwrap(); // aún no finalizamos
          id = techResp?.id ?? techResp?.idTecnologia ?? techResp?.technologyId;
          if (!id) throw new Error('La API no devolvió el ID de la tecnología creada.');
          setTechnologyId(id);
        }
        setMostrarPasoCotitularidad(hayCotitularidad);
        setShowWarning(false);
        setStep(hayCotitularidad ? 1 : 2);
        return;
      } catch (err) {
        console.error('Error creando tecnología:', err);
        showWarn(
          (typeof err?.data === 'string' && err.data) ||
            err?.data?.message ||
            err?.error ||
            'No se pudo crear la tecnología. Revisa los datos o el servidor.',
          0
        );
        return;
      }
    }

    if (step === 1) {
      const okCot = cotiRef.current?.validate();
      if (!okCot) {
        showWarn(
          'Cotitularidad incompleta. Verifica que todas las filas estén completas, el total sume 100% y hayas adjuntado al menos un documento.',
          1
        );
        return;
      }
    }

    setShowWarning(false);
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrev = () => {
    if (step === 2 && !mostrarPasoCotitularidad) setStep(0);
    else setStep((p) => Math.max(p - 1, 0));
  };

  // ✅ Exponemos finalize() y saveDraft() al padre
  useImperativeHandle(ref, () => ({
    saveDraft,
    finalize: async () => {
      // Validaciones completas…
      const okDatos = datosRef.current?.validate();
      if (!okDatos) {
        showWarn(
          'Datos de tecnología incompletos. Revisa: nombre, descripción, tipos de protección, archivos/fechas (si aplica) y cotitularidad.',
          0
        );
        return { ok: false, message: 'Datos de tecnología incompletos' };
      }

      const hayCot = datosRef.current?.getCotitularidad();
      if (hayCot) {
        const okCot = cotiRef.current?.validate();
        if (!okCot) {
          showWarn('Cotitularidad incompleta. Asegura que el total de porcentajes sume 100%.', 1);
          return { ok: false, message: 'Cotitularidad incompleta' };
        }
      }

      const okDist = distRef.current?.validate?.() ?? true;
      if (!okDist) {
        showWarn('Acuerdo de distribución incompleto.', 2);
        return { ok: false, message: 'Acuerdo de distribución incompleto' };
      }

      try {
        const techPayload = datosRef.current.getPayload();
        const cotPayload  = hayCot ? cotiRef.current.getPayload() : null;

        let idTec = technologyId;
        if (!idTec) {
          const techResp = await createTech({ ...techPayload, completed: false }).unwrap();
          idTec = techResp?.id ?? techResp?.idTecnologia ?? techResp?.technologyId;
          if (!idTec) throw new Error('La API no devolvió el ID de la tecnología creada.');
          setTechnologyId(idTec);
        }

        // (… aquí lo tuyo de crear cotitularidad / cotitulares …)

        // Finalmente marca como completado
        if (updateTech) {
          await updateTech({ id: idTec, body: { completed: true } }).unwrap();
        } else {
          // Fallback: si tu API permite, re-envía completo con completed:true
          await createTech({ id: idTec, ...techPayload, completed: true }).unwrap();
        }

        alert('Tecnología registrada con éxito.');
        setShowWarning(false);
        return { ok: true };
      } catch (err) {
        const serverMsg =
          (typeof err?.data === 'string' && err.data) ||
          err?.data?.message ||
          err?.error ||
          'Ocurrió un error al registrar. Intenta nuevamente.';

        console.error('Finalize error:', err);
        showWarn(serverMsg, step);
        return { ok: false, message: serverMsg };
      }
    },
  }));

  return (
    <section className="step-scroll">
      {/* Barra de pasos */}
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

      {/* Contenido */}
      <div className="step-content">
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <DatosTecnologia ref={datosRef} />
        </div>

        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          {/* ✅ Pasamos technologyId */}
          <Cotitularidad ref={cotiRef} technologyId={technologyId} />
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          {/* ✅ Pasamos technologyId */}
          <AcuerdoDistribucion ref={distRef} technologyId={technologyId} />
        </div>
      </div>

      {/* Botones navegación */}
      <div className="step-actions">
        {step > 0 ? (
          <div className="left">
            <RegisterButton text="Anterior" onClick={handlePrev} />
          </div>
        ) : (
          <span />
        )}

        {step < 2 ? (
          <div className="right">
            <RegisterButton text="Siguiente" onClick={handleNext} />
          </div>
        ) : (
          <span />
        )}
      </div>

      {/* Mensaje de validación */}
      {showWarning && <div className="warning-msg">{warningText}</div>}
    </section>
  );
});

export default Scroll;
