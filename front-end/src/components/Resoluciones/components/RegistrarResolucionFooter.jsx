/**
 * Footer (Adjuntar archivo + botones Guardar / Finalizar)
 * -------------------------------------------------------
 * Ahora AdjuntarArchivo llama al servicio por sí mismo.
 * - entityId: id de la resolución (cuando exista).
 */
import React from 'react';
import AdjuntarArchivo from '../../layouts/components/AdjuntarArchivo';
import './RegistrarResolucionFooter.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const RegistrarResolucionFooter = ({
  resolutionId,  // <-- NUEVO: id de la resolución (puede ser null hasta que se cree)
  onSave,
  onFinish,
  formError,
  shakeError,
}) => (
  <footer className="registrar-resolucion-footer">
    <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
      <AdjuntarArchivo
        entityId={resolutionId}
        descripcion="La resolución firmada y aprobada."
        onUploaded={(res) => {
          console.log('[Footer] Archivo registrado OK:', res);
        }}
        onError={(err) => {
          console.error('[Footer] Error al registrar archivo:', err);
        }}
      />
    </div>

    <div className="footer-buttons">
      <Buttons.SaveButton   onClick={onSave}   />
      <Buttons.FinishButton onClick={onFinish} />
    </div>
  </footer>
);

export default RegistrarResolucionFooter;
