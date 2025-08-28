// src/components/AdjuntarArchivo.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import './AdjuntarArchivo.css';

import { useUploadToDspaceMutation, useCreateArchivoMutation } from '../../../services/storage/archivosApi';
import { uploadAndSaveArchivo } from '../../../services/storage/archivosOrchestrator';

const MAX_BYTES = 6 * 1024 * 1024;

const isValidPdf = (file) =>
  file instanceof File &&
  (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) &&
  file.size <= MAX_BYTES;

/**
 * Props:
 *  - entityId, tipoEntidad, idColeccion, descripcion, overrides...
 *  - onUploaded(result.archivo)
 *  - onBeforeUpload()
 *  - onError(err)
 *
 *  - 🔥 NUEVO: callbacks de selección para integrarse con el padre:
 *    - onSelectedChange({ file, hasFile:boolean, fileName:string|null })
 *    - onChange(file)            // compat
 *    - onFileChange(file)        // compat
 *
 *  - buttonLabel (si agregas botón externo)
 */
const AdjuntarArchivo = forwardRef(({
  entityId: entityIdProp = null,
  tipoEntidad = 'R', // por defecto 'R' (resoluciones)
  idColeccion = 155,
  descripcion = 'Adjuntar documento en PDF.',
  onUploaded,
  onBeforeUpload,
  onError,
  buttonLabel = 'Registrar archivo',

  // overrides opcionales
  overrideTitulo,
  overrideNombresAutor,
  overrideIdentificacion,

  // 🔥 NUEVOS callbacks para reflejar selección hacia arriba
  onSelectedChange,
  onChange,
  onFileChange,
}, ref) => {
  const [file, setFile] = useState(null);
  const [entityIdState, setEntityIdState] = useState(entityIdProp);
  const entityId = entityIdState ?? entityIdProp;

  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [uploadToDspace] = useUploadToDspaceMutation();
  const [createArchivo]  = useCreateArchivoMutation();

  const validMsg = useMemo(() => {
    if (!file) return 'Selecciona un archivo PDF (máx 6 MB).';
    if (!isValidPdf(file)) return 'Archivo inválido: debe ser PDF y pesar menos de 6 MB.';
    return '';
  }, [file, entityId]);

  const emitSelection = (f) => {
    const payload = { file: f ?? null, hasFile: !!f, fileName: f?.name ?? null };
    // Callback nuevo primero
    if (typeof onSelectedChange === 'function') {
      try { onSelectedChange(payload); } catch {}
    }
    // Alias de compatibilidad (TipoProteccion puede usar estos)
    if (typeof onChange === 'function') {
      try { onChange(f ?? null); } catch {}
    }
    if (typeof onFileChange === 'function') {
      try { onFileChange(f ?? null); } catch {}
    }
  };

  const handleSelect = (e) => {
    setLocalError('');
    setSuccessMsg('');
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    emitSelection(f); // 🔥 notifica hacia arriba
  };

  const doUpload = async (eid) => {
    if (!file || !isValidPdf(file)) throw new Error('Archivo inválido: debe ser PDF y pesar menos de 6 MB.');
    if (eid == null || eid === '') throw new Error('No hay id de entidad (idTEntidad).');

    if (onBeforeUpload) onBeforeUpload();
    setLoading(true);
    try {
      console.groupCollapsed('[AdjuntarArchivo] Preparando orquestación');
      console.log('entityId:', eid);
      console.log('tipoEntidad:', tipoEntidad);
      console.log('overrides:', {
        overrideTitulo,
        overrideNombresAutor,
        overrideIdentificacion,
      });
      console.groupEnd();

      const result = await uploadAndSaveArchivo({
        file,
        meta: {
          idTEntidad: eid,
          tipoEntidad,
          idColeccion,
          titulo: overrideTitulo,
          nombresAutor: overrideNombresAutor,
          identificacion: overrideIdentificacion,
        },
        uploadToDspace,
        createArchivo,
      });

      if (onUploaded) onUploaded(result.archivo);
      setSuccessMsg('Archivo registrado correctamente.');
      return result;
    } catch (err) {
      console.error('[AdjuntarArchivo] Error al registrar archivo:', err);
      const msg = err?.message || 'No se pudo registrar el archivo.';
      setLocalError(msg);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Exponer métodos al padre
  useImperativeHandle(ref, () => ({
    setEntityId(id) {
      setEntityIdState(id);
    },
    hasFile() {
      return !!file;
    },
    getSelectedFileName() {
      return file?.name ?? null;
    },
    /** Sube si hay archivo y (entityId || entityId argument). Si no hay archivo, no hace nada. */
    async uploadIfReady({ entityId: eidArg, silent = false } = {}) {
      const eid = eidArg ?? entityId;
      if (!file) {
        if (!silent) console.info('[AdjuntarArchivo] No hay archivo seleccionado. Subida omitida.');
        return null;
      }
      if (eid == null || eid === '') {
        if (!silent) console.info('[AdjuntarArchivo] No hay id de entidad. Subida omitida.');
        return null;
      }
      return await doUpload(eid);
    },
  }));

  const handleUploadClick = async () => {
    try {
      await (ref?.current?.uploadIfReady ? ref.current.uploadIfReady({}) : doUpload(entityId));
    } catch { /* el error ya fue logueado arriba */ }
  };

  return (
    <div className="adjuntar-container">
      <h4>Adjuntar documento</h4>

      <p className="descripcion">{descripcion}</p>

      <label className="archivo-input">
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleSelect}
          hidden
          disabled={loading}
        />
        <div className="file-wrapper">
          <span>{loading ? 'Procesando…' : 'Examinar…'}</span>
          <span className="file-name">
            {file ? file.name : 'Seleccionar archivo...'}
          </span>
        </div>
      </label>

      <div className="requisitos">
        <p><strong>Requerimientos para subir archivo</strong></p>
        <p>
          Límite de 6MB.<br />
          Tipos de archivos permitidos: <span className="pdf-tag">.pdf</span>
        </p>
        {validMsg && file && <p className="error-msg">{validMsg}</p>}
        {localError && <p className="error-msg">{localError}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}
      </div>

      {/* Si quieres un botón para subir inmediatamente desde aquí, descomenta:
      <button type="button" onClick={handleUploadClick} disabled={loading || !!validMsg}>
        {buttonLabel}
      </button>
      */}
    </div>
  );
});

export default AdjuntarArchivo;
