import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import * as Components from '../../layouts/components/index';
import './TipoProteccion.css';

const TipoProteccion = ({
  label,
  index,
  checked,
  disabled,
  onChange,
  onArchivoChange
}) => {
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
  if (!checked) {
      setArchivos([]);
      onArchivoChange?.([]);
    } else if (checked && archivos.length === 0 && index !== 7) {
      const inicial = [{ file: null, fecha: '' }];
      setArchivos(inicial);
      onArchivoChange?.(inicial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, index, archivos.length, onArchivoChange]);

  const handleFileChange = (file, idx) => {
    const updated = archivos.map((item, i) =>
      i === idx ? { ...item, file } : item
    );
    setArchivos(updated);
    onArchivoChange?.(updated);
  };

  const handleFechaChange = (fecha, idx) => {
    const updated = archivos.map((item, i) =>
      i === idx ? { ...item, fecha } : item
    );
    setArchivos(updated);
    onArchivoChange?.(updated);
  };

  const handleAddArchivo = () => {
    const updated = [...archivos, { file: null, fecha: '' }];
    setArchivos(updated);
    onArchivoChange?.(updated);
  };

  const handleRemoveArchivo = (idx) => {
    const updated = archivos.filter((_, i) => i !== idx);
    setArchivos(updated);
    onArchivoChange?.(updated);
  };

  return (
    <div className="tipo-proteccion-wrapper">
      <label className="tipo-proteccion-checkbox">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>

      {checked && label !== '8. No aplica' && (
        <div className="form-card proteccion-container">
          <div className="archivos-container">
            {archivos.map((item, idx) => (
              <div key={idx} className="archivos-container">
                <label className="fecha-label">
                  Fecha de concesión
                  <input
                    type="date"
                    value={item.fecha || ''}
                    onChange={(e) => handleFechaChange(e.target.value, idx)}
                  />
                </label>
                <div className='archivo-item'>
                  <Components.AdjuntarArchivo
                    descripcion="Adjuntar la ficha tecnológica correspondiente a este tipo de protección."
                    file={item.file}
                    onChange={(e) => handleFileChange(e.target.files[0], idx)}
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
              </div>
            ))}

            <button
              type="button"
              className="btn-add-archivo"
              onClick={handleAddArchivo}
            >
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