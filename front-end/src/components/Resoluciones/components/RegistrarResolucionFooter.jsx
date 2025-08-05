// src/components/RegistrarResolucionFooter.jsx
import React from 'react';
import { AdjuntarArchivo }  from '../../layouts/components/index';
import './RegistrarResolucionFooter.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const RegistrarResolucionFooter = ({ file, onFileChange, onSave, onFinish, formError }) => (
  <footer className="registrar-resolucion-footer">
    <AdjuntarArchivo
      descripcion="Documento(s) con especificaciones técnicas y funcionales de la resolución, con firma electrónica de responsabilidad."
      file={file}
      onChange={onFileChange}
    />

    <div className="footer-buttons">
    <Buttons.SaveButton onClick={() => console.log('Guardar...')} />
    <Buttons.FinishButton onClick={onFinish} />
    {formError && <p className="form-error-msg">Debe completar todos los campos.</p>}

  </div>
  </footer>
);

export default RegistrarResolucionFooter;
