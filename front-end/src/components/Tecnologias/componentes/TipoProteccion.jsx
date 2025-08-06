import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import * as Components from '../../layouts/components/index';
import './TipoProteccion.css';

const TipoProteccion = ({ label, checked, onChange }) => {
  const [archivos, setArchivos] = useState([]);

  // Resetear archivos si se desmarca el checkbox
  useEffect(() => {
    if (!checked) setArchivos([]);
    else if (checked && archivos.length === 0) setArchivos([{ file: null }]);
  }, [checked]);

  const handleAddArchivo = () => {
    setArchivos(prev => [...prev, { file: null }]);
  };

  const handleRemoveArchivo = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (file, idx) => {
    setArchivos(prev =>
      prev.map((item, i) => (i === idx ? { ...item, file } : item))
    );
  };

  return (
    <div className="tipo-proteccion-wrapper">
      <label className="tipo-proteccion-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>

      {checked && (
        <div className="archivos-container">
          {archivos.map((item, idx) => (
            <div key={idx} className="archivo-item">
              <Components.AdjuntarArchivo
                descripcion={"Adjuntar la ficha tecnológica correspondiente a este tipo de protección."}
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
      )}
    </div>
  );
};

export default TipoProteccion;
