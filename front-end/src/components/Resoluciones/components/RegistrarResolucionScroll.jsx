// src/components/RegistrarResolucionScroll.jsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './RegistrarResolucionScroll.css';
import * as Buttons from '../../layouts/buttons/buttons_index';
import Distribucion from './Distribucion';
import Formulario from './Formulario';

const RegistrarResolucionScroll = forwardRef(({ formularioRef, shakeFormulario }, ref) => {
  const [distribuciones, setDistribuciones] = useState([]);
  const distribRefs = useRef([]);

  const handleAddDistribucion = () => {
    const newIndex = distribuciones.length;
    setDistribuciones((prev) => [...prev, {}]);
    distribRefs.current[newIndex] = React.createRef(); // asegura que el ref exista en el mismo índice
  };

  const handleRemoveDistribucion = (idx) => {
    setDistribuciones((prev) => prev.filter((_, i) => i !== idx));
    distribRefs.current.splice(idx, 1); // eliminar el ref correspondiente
  };

  useImperativeHandle(ref, () => ({
    validate() {
      if (distribRefs.current.length === 0) return true;
      return distribRefs.current.every((r) => r?.current?.validate());
    },
  }));

  return (
   <section className="registrar-resolucion-scroll">
      <div className="formulario-section">
        <Formulario ref={formularioRef} shakeError={shakeFormulario} />
      </div>

      <div className="distribuciones-section">
        {distribuciones.map((_, idx) => (
          <Distribucion
            key={idx}
            ref={distribRefs.current[idx]}
            onDelete={() => handleRemoveDistribucion(idx)}
          />
        ))}
      </div>

      <div className="boton-section">
        <Buttons.RegisterButton onClick={handleAddDistribucion} text="Añadir distribución" />
      </div>
    </section>
  );
});

export default RegistrarResolucionScroll;
