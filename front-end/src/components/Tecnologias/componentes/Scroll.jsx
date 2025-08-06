import React, { useState, useRef } from 'react';
import './Scroll.css';
import RegisterButton from '../../layouts/buttons/RegisterButton';

// Importa los formularios reales
import DatosTecnologia from './DatosTecnologia';
import Cotitularidad from './Cotitularidad';
import AcuerdoDistribucion from './AcuerdoDistribucion';

const Scroll = () => {
  const [step, setStep] = useState(0); // 0-1-2
  const [showWarning, setShowWarning] = useState(false);

  const datosRef = useRef();
  const handleNext = () => {
    if (step === 0 && !datosRef.current?.validate()) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    setStep((p) => Math.min(p + 1, 2));
  };
  const handlePrev = () => setStep((p) => Math.max(p - 1, 0));

  return (
    <section className="step-scroll">
      {/* -------- barra de pasos -------- */}
      <nav className="stepper">
        {[0, 1, 2].map((idx) => {
          const state =
            idx < step ? 'completed'
            : idx === step ? 'active'
            : 'pending';
          return <div key={idx} className={`step ${state}`} />;
        })}
      </nav>

      {/* -------- contenido por paso -------- */}
      <div className="step-content">
        {step === 0 && <DatosTecnologia ref={datosRef} />}
        {step === 1 && <Cotitularidad />}
        {step === 2 && <AcuerdoDistribucion />}
      </div>

      {/* -------- botones -------- */}
      <div className="step-actions">
        {/* botón Anterior o placeholder */}
        {step > 0 ? (
          <div className="left">
            <RegisterButton text="Anterior" onClick={handlePrev} />
          </div>
        ) : (
          <span />
        )}

        {/* botón Siguiente o placeholder */}
        {step < 2 ? (
          <div className="right">
            <RegisterButton text="Siguiente" onClick={handleNext} />
          </div>
          
        ) : (
          <span />
        )}
      </div>
      {/* -------- mensaje de error -------- */}
      {showWarning && (
        <div className="warning-msg">Debe llenar todos los campos.</div>
      )}
    </section>
  );
};

export default Scroll;
