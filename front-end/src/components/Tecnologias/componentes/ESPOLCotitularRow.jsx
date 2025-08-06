// src/pages/Resoluciones/components/ESPOLCotitularRow.jsx
import React from 'react';
import CorreoESPOLInput from './CorreoESPOLInput';

const ESPOLCotitularRow = ({ fila, index, onSelectUsuario, onPorcentajeChange }) => (
  <tr>
    <td>ESPOL</td>
    <td>0967486931</td>
    <td>espol@espol.edu.ec</td>

    <td>{fila.representante.nombre}</td>

    <td>
      <div className="correo-institucional-wrapper">
        <CorreoESPOLInput onSelectUsuario={u => onSelectUsuario(u, index)} />
        <span className="correo-dominio">@espol.edu.ec</span>
      </div>
    </td>

    <td>{fila.representante.telefono}</td>

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

    {/* celda vacía para alinear con el botón de otras filas */}
    <td />
  </tr>
);

export default ESPOLCotitularRow;
