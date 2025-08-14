import React, { useState, useEffect } from 'react';
import { FiCalendar } from "react-icons/fi";
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
  const [fechaConcesion, setFechaConcesion] = useState(''); // ✅ única fecha por tipo

  // Solo reaccionamos a cambios en "checked".
  useEffect(() => {
    if (!checked) {
      // Si se desmarca: limpiar estado y notificar una sola vez
      if (archivos.length > 0 || fechaConcesion) {
        setArchivos([]);
        setFechaConcesion('');
        onArchivoChange?.([]);
      }
      return;
    }

    // Si se marca (y no es "No aplica"): inicializar una sola vez
    if (checked && index !== 7 && archivos.length === 0) {
      const inicial = [{ file: null, fecha: '' }];
      setArchivos(inicial);
      setFechaConcesion('');
      onArchivoChange?.(inicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]); // 👈 sólo checked

  // Sin cambiar la “forma” que envías al padre: cada item conserva {file, fecha},
  // pero la fecha se centraliza y se propaga a todos.
  const syncAndNotify = (nuevoArchivos, nuevaFecha = fechaConcesion) => {
    const conFecha = nuevoArchivos.map(a => ({ ...a, fecha: nuevaFecha || '' }));
    setArchivos(conFecha);
    onArchivoChange?.(conFecha);
  };

  const handleFileChange = (file, idx) => {
    const updated = archivos.map((item, i) =>
      i === idx ? { ...item, file } : item
    );
    syncAndNotify(updated);
  };

  const handleFechaUnicaChange = (fecha) => {
    setFechaConcesion(fecha);
    // Propaga la misma fecha a todos los archivos
    const updated = archivos.map(item => ({ ...item, fecha }));
    setArchivos(updated);
    onArchivoChange?.(updated);
  };

  const handleAddArchivo = () => {
    const updated = [...archivos, { file: null, fecha: fechaConcesion || '' }];
    syncAndNotify(updated);
  };

  const handleRemoveArchivo = (idx) => {
    const updated = archivos.filter((_, i) => i !== idx);
    syncAndNotify(updated);
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

      {checked && index !== 7 && (
        <div className="form-card proteccion-container">
          {/* ✅ Única fecha por tipo de protección */}
          <label className="fecha-label" style={{ marginBottom: '0.75rem' }}>
            {/* Fecha de solicitud o concesión */}
            <div className="date-input-wrapper">
              <span className="date-label">FECHA DE SOLICITUD O CONCESIÓN</span>
              <input
                type="date"
                value={fechaConcesion || ''}
                onChange={(e) => handleFechaUnicaChange(e.target.value)}
              />
            </div>
          </label>

          {/* Archivos múltiples, sin fecha individual */}
          <div className="archivos-container">
            {archivos.map((item, idx) => (
              <div key={idx} className="archivo-item">
                <Components.AdjuntarArchivo
                  descripcion="Documento(s) correspondiente a este tipo de protección."
                  file={item.file}
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null, idx)
                  }
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
        </div>
      )}
    </div>
  );
};

export default TipoProteccion;
