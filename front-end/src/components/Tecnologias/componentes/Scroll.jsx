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
  const [mostrarPasoCotitularidad, setMostrarPasoCotitularidad] = useState(true);

  const datosRef = useRef();

  const handleNext = () => {
    if (step === 0) {
      const isValid = datosRef.current?.validate();
      if (!isValid) {
        setShowWarning(true);
        return;
      }

      const hayCotitularidad = datosRef.current?.getCotitularidad();
      setMostrarPasoCotitularidad(hayCotitularidad); // guarda la decisión
      setShowWarning(false);
      setStep(hayCotitularidad ? 1 : 2);
    } else {
      setShowWarning(false);
      setStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePrev = () => {
    if (step === 2 && !mostrarPasoCotitularidad) {
      setStep(0); // salta paso 1 si no se mostró antes
    } else {
      setStep((p) => Math.max(p - 1, 0));
    }
  };

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

      {/* Contenido de pasos - MONTADOS PERMANENTEMENTE */}
      <div className="step-content">
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <DatosTecnologia ref={datosRef} />
        </div>
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Cotitularidad />
        </div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <AcuerdoDistribucion />
        </div>
      </div>

      {/* Botones */}
      <div className="step-actions">
        {step > 0 ? (
          <div className="left">
            <RegisterButton text="Anterior" onClick={handlePrev} />
          </div>
        ) : <span />}

        {step < 2 ? (
          <div className="right">
            <RegisterButton text="Siguiente" onClick={handleNext} />
          </div>
        ) : <span />}
      </div>

      {/* Alerta */}
      {showWarning && (
        <div className="warning-msg">Debe llenar todos los campos.</div>
      )}
    </section>
  );
};

export default Scroll;
