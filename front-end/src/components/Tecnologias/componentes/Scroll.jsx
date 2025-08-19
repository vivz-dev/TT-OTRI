// src/pages/Resoluciones/componentes/Scroll.jsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './Scroll.css';
import DatosTecnologia from './DatosTecnologia';
import Cotitularidad from './Cotitularidad';
import AcuerdoDistribucion from './AcuerdoDistribucion';
import {
  useSaveTechnologyStepMutation,
  useFinalizeTechnologyWithProtectionsMutation,
} from '../../../services/technologyOrchestratorApi';

const Scroll = forwardRef((_, ref) => {
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('Debe llenar todos los campos.');
  const [mostrarPasoCotitularidad, setMostrarPasoCotitularidad] = useState(true);
  const [technologyId, setTechnologyId] = useState(null);

  const datosRef = useRef();
  const cotiRef = useRef();
  const distRef = useRef();

  const [saveTechStep] = useSaveTechnologyStepMutation();
  const [finalizeTech] = useFinalizeTechnologyWithProtectionsMutation();

  const showWarn = (text, gotoStep) => {
    setWarningText(text);
    setShowWarning(true);
    if (typeof gotoStep === 'number') setStep(gotoStep);
  };

  /* ------------------------- Guardar (borrador) ------------------------- */
  const saveDraft = async () => {
    try {
      const draft = datosRef.current?.getDraftPayload?.() || {};
      const res = await saveTechStep({ currentId: technologyId, data: draft }).unwrap();
      if (res?.id && !technologyId) setTechnologyId(res.id);
      setShowWarning(false);
      return { ok: true, id: res?.id ?? technologyId };
    } catch (err) {
      console.error('Error guardando borrador:', err);
      const msg =
        (typeof err?.data === 'string' && err.data) ||
        err?.data?.message ||
        err?.error ||
        'No se pudo guardar el borrador.';
      showWarn(msg);
      return { ok: false, message: msg };
    }
  };

  /* --------------------------- Siguiente paso --------------------------- */
  const handleNext = async () => {
    if (step === 0) {
      const isValid = datosRef.current?.validate();
      if (!isValid) {
        showWarn('Completa: nombre, descripción, tipo(s), archivo(s), fecha(s) (si aplica) y cotitularidad.', 0);
        return;
      }
      const hayCotitularidad = datosRef.current?.getCotitularidad();
      const payload = datosRef.current?.getPayload?.();
      try {
        // Guardamos incompleto (completed:false) hasta terminar todo el flujo
        const res = await saveTechStep({
          currentId: technologyId,
          data: { ...payload, completed: false },
        }).unwrap();

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

  /* ---------------------------- Finalizar ------------------------------- */
  useImperativeHandle(ref, () => ({
    saveDraft,
    finalize: async () => {
      const okDatos = datosRef.current?.validate();
      if (!okDatos) {
        showWarn('Datos de tecnología incompletos. Revisa campos del paso 0.', 0);
        return { ok: false, message: 'Datos incompletos' };
      }

      const hayCot = datosRef.current?.getCotitularidad();
      if (hayCot) {
        const okCot = cotiRef.current?.validate();
        if (!okCot) {
          showWarn('Cotitularidad incompleta. Asegura que el total sume 100%.', 1);
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

        // 🔎 Log detallado para depurar antes de mandar
        console.log('[UI] Finalize payload =>', {
          titulo: techPayload?.titulo,
          descripcion: techPayload?.descripcion,
          estado: techPayload?.estado,
          cotitularidad: techPayload?.cotitularidad,
          tiposSeleccionados: techPayload?.tiposSeleccionados,
          fechasConcesion: techPayload?.fechasConcesion,
        });

        const res = await finalizeTech({
          currentId: technologyId,
          data: techPayload,
        }).unwrap();

        const idTec = res?.id ?? technologyId;
        if (!idTec) throw new Error('No se obtuvo id de tecnología al finalizar.');
        setTechnologyId(idTec);

        setShowWarning(false);
        return { ok: true, id: idTec };
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
          <Cotitularidad ref={cotiRef} technologyId={technologyId} />
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <AcuerdoDistribucion ref={distRef} technologyId={technologyId} />
        </div>
      </div>

      {/* Navegación entre pasos */}
      <div className="step-actions">
        {step > 0 ? (
          <div className="left">
            <button type="button" className="btn-secondary" onClick={handlePrev}>
              Anterior
            </button>
          </div>
        ) : (
          <span />
        )}

        {step < 2 ? (
          <div className="right">
            <button type="button" className="btn-primary" onClick={handleNext}>
              Siguiente
            </button>
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
