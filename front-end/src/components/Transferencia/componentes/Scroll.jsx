import React from 'react';
import TTForm from './TTForm';
import * as Buttons from '../../layouts/buttons/buttons_index';

const Scroll = () => {
  return (
    <section className="registrar-resolucion-scroll">
      <div className="formulario-section">
        <TTForm/>
      </div>

      <div className="distribuciones-section">
        {/* {distribuciones.map((_, idx) => (
          <Distribucion
            key={idx}
            ref={distribRefs.current[idx]}
            onDelete={() => removeDistribucion(idx)}
          />
        ))} */}
      </div>
    </section>
  );
};

export default Scroll;