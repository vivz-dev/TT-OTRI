import React from 'react';
import CorreoESPOLInput from './CorreoESPOLInput';
import './Cotitularidad.css';
const ESPOLCotitularRow = ({ fila, index, onSelectUsuario, onPorcentajeChange }) => (
  <tr>
    {/* 1: Nombre institución */}
    <td>ESPOL</td>

    {/* 2: RUC */}
    <td>0967486931</td>

    {/* 3: Correo institucional */}
    <td>espol@espol.edu.ec</td>

    {/* 4: Nombre del representante */}
    <td>{fila?.representante?.nombre || ''}</td>

    {/* 5: Username (input) + dominio fijo */}
    <td className="cell-correo">
  <div className="correo-institucional-wrapper">
    <CorreoESPOLInput
      onSelectUsuario={(u) => onSelectUsuario(u, index)}
      className="correo-user-input"
      menuClassName="correo-menu"
    />
    <span className="correo-dominio">@espol.edu.ec</span>
  </div>
</td>

    {/* 6: % titularidad */}
    <td>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={fila?.representante?.porcentaje ?? ''}
        onChange={(e) => onPorcentajeChange(index, e.target.value)}
        placeholder="Ej: 50"
        className="input-porcentaje"
      />
    </td>

    {/* 7: acciones (vacío para alinear con filas generales que sí tienen botón) */}
    <td />
  </tr>
);

export default ESPOLCotitularRow;
