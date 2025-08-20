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

const AdjuntarArchivo = forwardRef(({
  entityId: entityIdProp = null,
  idColeccion = 155,
  descripcion = 'Adjuntar documento en PDF.',
  onUploaded,
  onBeforeUpload,
  onError,
  buttonLabel = 'Registrar archivo',
  // overrides opcionales:
  overrideTitulo,
  overrideNombresAutor,
  overrideIdentificacion,
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
    if (!isValidPdf(file)) return 'Archivo inválido: debe ser PDF y pesar ≤ 6 MB.';
    if (entityId == null || entityId === '') return 'Falta el id de la entidad. Guarda/crea primero para obtenerlo.';
    return '';
  }, [file, entityId]);

  const handleSelect = (e) => {
    setLocalError('');
    setSuccessMsg('');
    setFile(e.target.files?.[0] ?? null);
  };

  const doUpload = async (eid) => {
    if (!file || !isValidPdf(file)) throw new Error('Archivo inválido: debe ser PDF y pesar ≤ 6 MB.');
    if (eid == null || eid === '') throw new Error('No hay id de entidad (idTEntidad).');

    if (onBeforeUpload) onBeforeUpload();
    setLoading(true);
    try {
      console.groupCollapsed('[AdjuntarArchivo] Preparando orquestación');
      console.log('entityId:', eid);
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
          idColeccion,
          titulo: overrideTitulo,
          nombresAutor: overrideNombresAutor,
          identificacion: overrideIdentificacion,
        },
        uploadToDspace,
        createArchivo,
      });

      if (onUploaded) onUploaded(result.archivo);
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
      // Si falta entityId, omitimos también (caso guardado sin id)
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
          accept=".pdf"
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
      </div>
      
    </div>
  );
});

export default AdjuntarArchivo;
