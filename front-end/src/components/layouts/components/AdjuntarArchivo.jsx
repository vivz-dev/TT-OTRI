// src/components/AdjuntarArchivo.jsx
import React, { useMemo, useState } from 'react';
import './AdjuntarArchivo.css';

import {
  useCreateArchivoMutation,
  buildArchivoPayload,
  sanitizeFileName,
} from '../../../services/archivosApi';

const MAX_BYTES = 6 * 1024 * 1024;

const isValidPdf = (file) =>
  file instanceof File &&
  (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) &&
  file.size <= MAX_BYTES;

const AdjuntarArchivo = ({
  entityId,           // <-- idTEntidad (ej: id resolución). Requerido para habilitar "Registrar".
  descripcion = 'Adjuntar documento en PDF.',
  onUploaded,         // callback(respuestaBackend)
  onBeforeUpload,     // callback() opcional (para spinners externos)
  onError,            // callback(error) opcional
  buttonLabel = 'Registrar archivo',
}) => {
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState('');
  const [createArchivo, { isLoading }] = useCreateArchivoMutation();

  const validMsg = useMemo(() => {
    if (!file) return 'Selecciona un archivo PDF (máx 6 MB).';
    if (!isValidPdf(file)) {
      return 'Archivo inválido: debe ser PDF y pesar ≤ 6 MB.';
    }
    if (entityId == null || entityId === '') {
      return 'Falta el id de la entidad. Guarda/crea primero para obtenerlo.';
    }
    return '';
  }, [file, entityId]);

  const disabled = useMemo(
    () => !file || !isValidPdf(file) || entityId == null || entityId === '' || isLoading,
    [file, entityId, isLoading]
  );

  const handleSelect = (e) => {
    setLocalError('');
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    try {
      setLocalError('');
      if (onBeforeUpload) onBeforeUpload();

      if (!file || !isValidPdf(file)) {
        setLocalError('Archivo inválido: debe ser PDF y pesar ≤ 6 MB.');
        return;
      }
      if (entityId == null || entityId === '') {
        setLocalError('No hay id de entidad (idTEntidad).');
        return;
      }

      const body = buildArchivoPayload({ file, idTEntidad: entityId });
      // Debug útil
      console.groupCollapsed('[AdjuntarArchivo] Enviando /api/archivos');
      console.log('entityId:', entityId);
      console.log('file:', { name: file.name, type: file.type, size: file.size });
      console.log('nombre sanitizado:', sanitizeFileName(file.name));
      console.log('payload:', body);
      console.groupEnd();

      const res = await createArchivo(body).unwrap();
      if (onUploaded) onUploaded(res);
    } catch (err) {
      console.error('[AdjuntarArchivo] Error al registrar archivo:', err);
      setLocalError('No se pudo registrar el archivo. Revisa consola.');
      if (onError) onError(err);
    }
  };

  return (
    <div className="adjuntar-container">
      <h4>Adjuntar documento</h4>

      <p className="descripcion">{descripcion}</p>

      <label className="archivo-input">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleSelect}
          hidden
        />
        <div className="file-wrapper">
          <span>Examinar…</span>
          <span className="file-name">
            {file ? file.name : 'Seleccionar archivo...'}
          </span>
        </div>
      </label>

      <div className="requisitos">
        <p><strong>Requerimientos para subir archivo</strong></p>
        <p>Límite de 6MB.<br />
           Tipos de archivos permitidos: <span className="pdf-tag">.pdf</span></p>
      </div>

      {!!validMsg && <p className="hint">{validMsg}</p>}
      {!!localError && <p className="monto-error">{localError}</p>}

      <button
        type="button"
        className="btn-primary"
        disabled={disabled}
        onClick={handleUpload}
      >
        {isLoading ? 'Registrando…' : buttonLabel}
      </button>
    </div>
  );
};

export default AdjuntarArchivo;
