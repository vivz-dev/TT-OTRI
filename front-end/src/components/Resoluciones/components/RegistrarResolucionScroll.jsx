/**
 * Scroll que agrupa Formulario + n distribuciones.
 * ------------------------------------------------
 * • Devuelve validate()  -> bool
 * • Devuelve getDistribuciones() -> array de objetos listos para API
 */
import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './RegistrarResolucionScroll.css';
import * as Buttons from '../../layouts/buttons/buttons_index';
import Distribucion from './Distribucion';
import Formulario from './Formulario';

const RegistrarResolucionScroll = forwardRef(({ formularioRef, shakeFormulario }, ref) => {
  const [distribuciones, setDistribuciones] = useState([]);
  const distribRefs = useRef([]);

  const addDistribucion = () => {
    const index = distribuciones.length;
    setDistribuciones((p) => [...p, {}]);
    distribRefs.current[index] = React.createRef();
  };
  const removeDistribucion = (idx) => {
    setDistribuciones((p) => p.filter((_, i) => i !== idx));
    distribRefs.current.splice(idx, 1);
  };

  useImperativeHandle(ref, () => ({
    validate() {
      if (distribRefs.current.length === 0) return true;
      return distribRefs.current.every((r) => r?.current?.validate());
    },

    getDistribuciones() {
      return distribRefs.current
        .map((r) => r?.current?.getData())
        .filter(Boolean); // descarta refs eliminados
    },
  }));

  /* ---------------- UI --------------- */
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
            onDelete={() => removeDistribucion(idx)}
          />
        ))}
      </div>

      <div className="boton-section">
        <Buttons.RegisterButton onClick={addDistribucion} text="Añadir distribución" />
      </div>
    </section>
  );
});

export default RegistrarResolucionScroll;
