import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './Scroll.css';
import DatosTecnologia from './DatosTecnologia';
import Cotitularidad from './Cotitularidad';
import AcuerdoDistribucion from './AcuerdoDistribucion';
import * as Buttons from '../../layouts/buttons/buttons_index';

const Scroll = forwardRef((_, ref) => {
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('Debe llenar todos los campos.');
  const [mostrarPasoCotitularidad, setMostrarPasoCotitularidad] = useState(true);
  const [technologyId, setTechnologyId] = useState(null);

  const datosRef = useRef();
  const cotiRef = useRef();
  const distRef = useRef();

  const showWarn = (text, gotoStep) => {
    setWarningText(text);
    setShowWarning(true);
    if (typeof gotoStep === 'number') setStep(gotoStep);
  };

  /** ───────────── Guardar borrador (solo log) ───────────── */
  const saveDraft = async () => {
    try {
      const base = datosRef.current?.getDraftPayload?.() || { tecnologia:{}, protecciones:[] };

      const withCoti =
        !!datosRef.current?.getCotitularidad()
          ? { ...base, cotitularidad: cotiRef.current?.getPayload?.() || { cotitulares: [], archivoCotitularidad: null } }
          : base;

      const acuerdo = distRef.current?.getPayload?.() || { acuerdoDistribAutores: { autores: [], archivo: null } };

      const draft = { ...withCoti, ...acuerdo };

      console.log('[UI] Payload guardado como borrador =>', draft);
      return { ok: true, payload: draft };
    } catch (err) {
      console.error('Error guardando borrador (solo log):', err);
      return { ok: false, message: 'Error en borrador' };
    }
  };

  /** ───────────── Avanzar paso ───────────── */
  const handleNext = async () => {
    if (step === 0) {
      const isValid = datosRef.current?.validate();
      if (!isValid) {
        showWarn('Completa todos los campos requeridos.', 0);
        return;
      }
      const draftUnified = datosRef.current?.getDraftPayload?.();
      console.log('[UI] Payload al presionar Siguiente (step0) =>', draftUnified);

      setTechnologyId(123); // mock UI local
      setMostrarPasoCotitularidad(!!datosRef.current?.getCotitularidad());
      setShowWarning(false);
      setStep(!!datosRef.current?.getCotitularidad() ? 1 : 2);
      return;
    }

    if (step === 1) {
      const okCot = cotiRef.current?.validate();
      if (!okCot) {
        showWarn('Cotitularidad incompleta.', 1);
        return;
      }
      const payload = cotiRef.current?.getPayload?.();
      console.log('[UI] Payload al presionar Siguiente (step1) =>', payload);
    }

    setShowWarning(false);
    setStep((p) => Math.min(p + 1, 2));
  };

  const handlePrev = () => {
    if (step === 2 && !mostrarPasoCotitularidad) setStep(0);
    else setStep((p) => Math.max(p - 1, 0));
  };

  useImperativeHandle(ref, () => ({
    saveDraft,
    finalize: async () => {
      // Paso 0: tecnología
      const ok0 = datosRef.current?.validate?.();
      if (!ok0) {
        showWarn('Completa todos los campos en Datos de la tecnología.', 0);
        return { ok: false, message: 'Validación fallida en tecnología.' };
      }

      // Paso 1: cotitularidad (si aplica)
      const requiereCoti = !!datosRef.current?.getCotitularidad?.();
      let coti = null;
      if (requiereCoti) {
        const ok1 = cotiRef.current?.validate?.();
        if (!ok1) {
          showWarn('Cotitularidad incompleta.', 1);
          return { ok: false, message: 'Validación fallida en cotitularidad.' };
        }
        coti = cotiRef.current?.getPayload?.();
      }

      // Paso 2: acuerdo de distribución (siempre)
      const ok2 = distRef.current?.validate?.();
      if (!ok2) {
        showWarn('Acuerdo de distribución incompleto (revisa totales y archivo).', 2);
        return { ok: false, message: 'Validación fallida en acuerdo de distribución.' };
      }
      const acuerdo = distRef.current?.getPayload?.(); // { acuerdoDistribAutores: { autores[], archivo } }

      // Payload gigante unificado
      const base = datosRef.current.getPayload();
      const giant = requiereCoti ? { ...base, cotitularidad: coti, ...acuerdo } : { ...base, ...acuerdo };

      console.log('[UI] ✅ Payload FINAL UNIFICADO =>', giant);
      return { ok: true, payload: giant };
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
