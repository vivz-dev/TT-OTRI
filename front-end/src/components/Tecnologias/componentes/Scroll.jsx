import React, { useState } from 'react';
import './Scroll.css';
import RegisterButton from '../../layouts/buttons/RegisterButton'; // ajusta la ruta si cambia

const Scroll = () => {
  const [step, setStep] = useState(0);      // 0-1-2

  const next = () => setStep((p) => Math.min(p + 1, 2));
  const prev = () => setStep((p) => Math.max(p - 1, 0));

  const labels = [
    'Datos de la tecnología/know-how',
    'Cotitularidad',
    'Acuerdo de distribución',
  ];

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
        {step === 0 && <p>Formulario paso 1 (vacío)</p>}
        {step === 1 && <p>Formulario paso 2 (vacío)</p>}
        {step === 2 && <p>Formulario paso 3 (vacío)</p>}
      </div>

      {/* -------- botones -------- */}
      <div className="step-actions">
        {/* botón Anterior o placeholder */}
        {step > 0 ? (
          <div className="left">
            <RegisterButton text="Anterior" onClick={prev} />
          </div>
        ) : (
          <span />
        )}

        {/* botón Siguiente o placeholder */}
        {step < 2 ? (
          <div className="right">
            <RegisterButton text="Siguiente" onClick={next} />
          </div>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
};

export default Scroll;
