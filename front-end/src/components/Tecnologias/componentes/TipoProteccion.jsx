import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import * as Components from '../../layouts/components/index';
import './TipoProteccion.css';

const ID_NO_APLICA = 8;

function extractFilesFromInput(inputLike) {
  // Aceptar: Event, FileList, File[], File, null
  if (!inputLike) return [];
  if (inputLike?.target?.files) return Array.from(inputLike.target.files); // <input type="file">
  if (typeof FileList !== 'undefined' && inputLike instanceof FileList) return Array.from(inputLike);
  if (Array.isArray(inputLike)) return inputLike.filter((x) => typeof File !== 'undefined' && x instanceof File);
  if (typeof File !== 'undefined' && inputLike instanceof File) return [inputLike];
  // Algunos wrappers devuelven { file: File }
  if (inputLike?.file && (typeof File === 'undefined' || inputLike.file instanceof File)) return [inputLike.file];
  return [];
}

const TipoProteccion = ({
  label,
  index,
  checked,
  disabled,
  onChange,
  onArchivoChange,
  onFechaChange,
  fechaConcesion: fechaProp, // viene del padre
}) => {
  const [archivos, setArchivos] = useState([]);
  const [fechaConcesion, setFechaConcesion] = useState('');

  // rehidratar fecha
  useEffect(() => {
    if (fechaProp && fechaProp !== fechaConcesion) {
      setFechaConcesion(fechaProp);
      if (archivos.length > 0) {
        const updated = archivos.map(a => ({ ...a, fecha: fechaProp }));
        setArchivos(updated);
        onArchivoChange?.(updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaProp]);

  // al (des)marcar tipo
  useEffect(() => {
    if (!checked) {
      if (archivos.length > 0 || fechaConcesion) {
        setArchivos([]);
        setFechaConcesion('');
        onArchivoChange?.([]);
        onFechaChange?.('');
      }
      return;
    }
    if (checked && index !== ID_NO_APLICA && archivos.length === 0) {
      const inicial = [{ file: null, fecha: '' }];
      setArchivos(inicial);
      setFechaConcesion('');
      onArchivoChange?.(inicial);
      onFechaChange?.('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const syncAndNotify = (nuevoArchivos, nuevaFecha = fechaConcesion) => {
    const conFecha = (nuevoArchivos || []).map(a => {
      if (a instanceof File) return { file: a, fecha: nuevaFecha || '' };
      if (a?.file && (typeof File === 'undefined' || a.file instanceof File)) return { file: a.file, fecha: nuevaFecha || '' };
      return { ...a, fecha: nuevaFecha || '' };
    });
    setArchivos(conFecha);
    onArchivoChange?.(conFecha);
  };

  const setFileAtIndex = (idx, fileLike) => {
    const files = extractFilesFromInput(fileLike);
    const first = files[0] ?? null;

    const updated = archivos.map((item, i) =>
      i === idx ? { ...(item || {}), file: first } : item
    );
    syncAndNotify(updated);

    console.log(`[Tipo ${index}] File set =>`, {
      idx,
      hasFile: !!first,
      name: first?.name ?? null,
      totalSlots: updated.length,
    });
  };

  const handleChangeBridge = (value, idx) => setFileAtIndex(idx, value);

  const handleFechaUnicaChange = (fecha) => {
    setFechaConcesion(fecha);
    const updated = archivos.map(item => ({ ...item, fecha }));
    setArchivos(updated);
    onArchivoChange?.(updated);
    onFechaChange?.(fecha);
    console.log(`[Tipo ${index}] Fecha set =>`, fecha);
  };

  const handleAddArchivo = () => {
    const updated = [...archivos, { file: null, fecha: fechaConcesion || '' }];
    syncAndNotify(updated);
    console.log(`[Tipo ${index}] Añadir slot archivo. Total: ${updated.length}`);
  };

  const handleRemoveArchivo = (idx) => {
    const updated = archivos.filter((_, i) => i !== idx);
    syncAndNotify(updated);
    console.log(`[Tipo ${index}] Quitar slot archivo idx=${idx}. Total: ${updated.length}`);
  };

  return (
    <div className="tipo-proteccion-wrapper">
      <label className="tipo-proteccion-checkbox">
        <input
          type="checkbox"
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>

      {checked && index !== ID_NO_APLICA && (
        <div className="form-card proteccion-container">
          <label className="fecha-label" style={{ marginBottom: '0.75rem' }}>
            <div className="date-input-wrapper">
              <span className="date-label">FECHA DE SOLICITUD O CONCESIÓN</span>
              <input
                type="date"
                value={fechaConcesion || ''}
                onChange={(e) => handleFechaUnicaChange(e.target.value)}
              />
            </div>
          </label>

          <div className="archivos-container">
            {archivos.map((item, idx) => (
              <div key={idx} className="archivo-item">
                <Components.AdjuntarArchivo
                  descripcion="Documento correspondiente a este tipo de protección."
                  file={item.file}
                  // Cualquier variante del child dispare este bridge:
                  onChange={(v) => handleChangeBridge(v, idx)}
                  onFileChange={(v) => handleChangeBridge(v, idx)}
                  onSelectedChange={(v) => handleChangeBridge(v, idx)}
                />
                <button
                  type="button"
                  className="btn-remove-archivo"
                  onClick={() => handleRemoveArchivo(idx)}
                  title="Eliminar archivo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button type="button" className="btn-add-archivo" onClick={handleAddArchivo}>
              <PlusCircle size={18} style={{ marginRight: '6px' }} />
              Añadir archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipoProteccion;
