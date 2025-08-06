// src/components/RegistrarResolucionFooter.jsx
import React from 'react';
import { AdjuntarArchivo }  from '../../layouts/components/index';
import './RegistrarResolucionFooter.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const RegistrarResolucionFooter = ({ file, onFileChange, onSave, onFinish, formError, shakeError }) => (
  <footer className="registrar-resolucion-footer">
    <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
       <AdjuntarArchivo
      descripcion="Documento(s) con especificaciones técnicas y funcionales de la resolución, con firma electrónica de responsabilidad."
      file={file}
      onChange={onFileChange}
    />
    </div>
    <div className="footer-buttons">
    <Buttons.SaveButton onClick={() => console.log('Guardar...')} />
    <Buttons.FinishButton onClick={onFinish} />
    </div>
  </footer>
);

export default RegistrarResolucionFooter;
