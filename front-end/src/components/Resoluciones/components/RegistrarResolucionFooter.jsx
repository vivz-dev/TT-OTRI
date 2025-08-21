// src/pages/Resoluciones/components/RegistrarResolucionFooter.jsx
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import AdjuntarArchivo from '../../layouts/components/AdjuntarArchivo';
import './RegistrarResolucionFooter.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const RegistrarResolucionFooter = forwardRef(({
  resolutionId,
  onSave,
  onFinish,
  formError,
  shakeError,
}, ref) => {
  const adjRef = useRef(null);

  // Mantén sincronizado el id en el hijo (por si cambia después de crear)
  useEffect(() => {
    if (adjRef.current?.setEntityId && resolutionId != null) {
      adjRef.current.setEntityId(resolutionId);
    }
  }, [resolutionId]);

  useImperativeHandle(ref, () => ({
    /**
     * Dispara la subida si:
     *  - hay archivo seleccionado en AdjuntarArchivo
     *  - hay resolutionId (o se pasa por arg)
     */
    async triggerUploadIfReady(idFromCaller) {
      const id = idFromCaller ?? resolutionId;
      if (!adjRef.current) return null;
      return await adjRef.current.uploadIfReady({ entityId: id, silent: false });
    },
    hasPendingFile() {
      return !!adjRef.current?.hasFile?.();
    },
    getPendingFileName() {
      return adjRef.current?.getSelectedFileName?.() ?? null;
    },
  }));

  return (
    <footer className="registrar-resolucion-footer">
      <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
        <AdjuntarArchivo
          ref={adjRef}
          entityId={resolutionId}
          tipoEntidad="R" // Pasamos 'R' para resoluciones
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
});

export default RegistrarResolucionFooter;