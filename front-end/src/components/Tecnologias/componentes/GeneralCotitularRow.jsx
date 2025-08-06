// src/pages/Resoluciones/components/GeneralCotitularRow.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const GeneralCotitularRow = ({
  fila,
  index,
  onChange,
  onPorcentajeChange,
  onDelete,
}) => (
  <tr>
    <td>
      <input
        type="text"
        value={fila.institucion}
        onChange={e => onChange('institucion', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        value={fila.ruc}
        onChange={e => onChange('ruc', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        value={fila.correo}
        onChange={e => onChange('correo', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        value={fila.representante.nombre}
        onChange={e => onChange('representante.nombre', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        value={fila.representante.correo}
        onChange={e => onChange('representante.correo', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        value={fila.representante.telefono}
        onChange={e => onChange('representante.telefono', e.target.value)}
      />
    </td>

    <td>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={fila.representante.porcentaje}
        onChange={e => onPorcentajeChange(index, e.target.value)}
        placeholder="Ej: 50"
        className="input-porcentaje"
      />
    </td>

    {/* Icono eliminar */}
    <td>
      <button
        type="button"
        className="delete-btn"
        title="Eliminar cotitular"
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </td>
  </tr>
);

export default GeneralCotitularRow;
