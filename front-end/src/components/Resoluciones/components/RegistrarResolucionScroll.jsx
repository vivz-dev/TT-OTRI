// src/components/RegistrarResolucionScroll.jsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './RegistrarResolucionScroll.css';
import * as Buttons from '../../layouts/buttons/buttons_index';
import Distribucion from './Distribucion';

const RegistrarResolucionScroll = forwardRef(({ formulario }, ref) => {
  const [distribuciones, setDistribuciones] = useState([]);
  const distribRefs = useRef([]);

  const handleAddDistribucion = () => {
    setDistribuciones((prev) => [...prev, {}]);
    distribRefs.current.push(React.createRef());
  };

  /* ---------- validar todas las distribuciones ---------- */
  useImperativeHandle(ref, () => ({
    validate() {
      if (distribRefs.current.length === 0) return true;
      return distribRefs.current.every((r) => r?.current?.validate());
    },
  }));

  return (
    <section className="registrar-resolucion-scroll">
      <div className="formulario-section">{formulario}</div>

      <div className="distribuciones-section">
        {distribuciones.map((_, idx) => (
          <Distribucion key={idx} ref={distribRefs.current[idx]} />
        ))}
      </div>

      <div className="boton-section">
        <Buttons.RegisterButton onClick={handleAddDistribucion} text="Añadir distribución" />
      </div>
    </section>
  );
});


export default RegistrarResolucionScroll;
