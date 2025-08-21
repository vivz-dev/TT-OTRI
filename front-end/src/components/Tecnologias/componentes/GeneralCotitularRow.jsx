// src/pages/Resoluciones/components/GeneralCotitularRow.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import * as Components from '../../layouts/components';

const GeneralCotitularRow = ({
  fila,
  index,
  onChange,
  onPorcentajeChange,
  onDelete,
}) => (
  <tr>
    <td>
      <Components.GrowTextArea
        id={`inst-${index}`}
        name="Institución"
        placeholder="Institución"
        value={fila.institucion}
        onChange={e => onChange('institucion', e.target.value)}
        maxLength={50}
        rows={1}
        kind="text"
        required
      />
    </td>

    <td>
      {/* RUC: string pero solo dígitos, validación de RUC EC */}
      <Components.GrowTextArea
        id={`ruc-${index}`}
        name="RUC"
        placeholder="RUC"
        value={fila.ruc}
        onChange={e => onChange('ruc', e.target.value)}
        maxLength={13}
        rows={1}
        kind="ruc"
        required
      />
    </td>

    <td>
      {/* Correo: formato email */}
      <Components.GrowTextArea
        id={`correo-${index}`}
        name="Correo"
        placeholder="correo@dominio.com"
        value={fila.correo}
        onChange={e => onChange('correo', e.target.value)}
        maxLength={100}
        rows={1}
        kind="email"
        required
      />
    </td>

    <td>
      <Components.GrowTextArea
        id={`rep-nombre-${index}`}
        name="Representante"
        placeholder="Representante"
        value={fila.representante.nombre}
        onChange={e => onChange('representante.nombre', e.target.value)}
        maxLength={50}
        rows={1}
        kind="text"
        required
      />
    </td>

    <td>
      <Components.GrowTextArea
        id={`rep-correo-${index}`}
        name="RepresentanteCorreo"
        placeholder="correo@dominio.com"
        value={fila.representante.correo}
        onChange={e => onChange('representante.correo', e.target.value)}
        maxLength={100}
        rows={1}
        kind="email"
      />
    </td>

    {/* <td>

      <Components.GrowTextArea
        id={`rep-tel-${index}`}
        name="RepresentanteTelefono"
        placeholder="Teléfono"
        value={fila.representante.telefono}
        onChange={e => onChange('representante.telefono', e.target.value)}
        maxLength={10}
        rows={1}
        kind="phone"
      />
    </td> */}

    <td>
      <input
        type="number"
        min={0}
        max={100}
        step="1"
        inputMode="numeric"
        value={fila.representante.porcentaje}
        onChange={(e) => {
          const v = e.target.value;
          // permite vacío para que el usuario escriba cómodo
          if (v === '' || (/^\d{1,3}$/.test(v) && Number(v) <= 100)) {
            onPorcentajeChange(index, v);
          }
        }}
        placeholder="Ej: 50"
        className="input-porcentaje"
        aria-label="Porcentaje del representante"
      />
    </td>

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
