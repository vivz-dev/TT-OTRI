import React, { forwardRef } from 'react';
import TTForm from './TTForm';
import * as Buttons from '../../layouts/buttons/buttons_index';

const Scroll = forwardRef((props, ref) => {
  return (
    <section className="registrar-resolucion-scroll">
      <div className="formulario-section">
        <TTForm ref={ref} {...props} />
      </div>
    </section>
  );
});

export default Scroll;