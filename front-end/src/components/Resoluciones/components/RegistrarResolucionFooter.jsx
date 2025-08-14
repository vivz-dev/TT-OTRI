/**
 * Footer (Adjuntar archivo + botones Guardar / Finalizar)
 * -------------------------------------------------------
 * • Propaga onSave   -> botón Guardar
 * • Propaga onFinish -> botón Finalizar
 */
import React from 'react';
import { AdjuntarArchivo } from '../../layouts/components/index';
import './RegistrarResolucionFooter.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const RegistrarResolucionFooter = ({
  file,
  onFileChange,
  onSave,
  onFinish,
  formError,
  shakeError,
}) => (
  <footer className="registrar-resolucion-footer">
    <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
      <AdjuntarArchivo
        descripcion="La resolución firmada y aprobada."
        file={file}
        onChange={onFileChange}
      />
    </div>

    <div className="footer-buttons">
      <Buttons.SaveButton   onClick={onSave}   />
      <Buttons.FinishButton onClick={onFinish} />
    </div>
  </footer>
);

export default RegistrarResolucionFooter;
