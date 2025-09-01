// src/pages/Resoluciones/components/GeneralCotitularRow.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import * as Components from "../../layouts/components";

const GeneralCotitularRow = ({
  fila,
  index,
  onChange,
  onPorcentajeChange,
  onDelete,
}) => (
  <tr className="autor-name">
    <td className="cotitular-box max-width-td">
      <Components.GrowTextArea
        id={`inst-${index}`}
        name="Institución"
        placeholder="Institución"
        value={fila.institucion}
        onChange={(e) => onChange("institucion", e.target.value)}
        maxLength={50}
        rows={1}
        kind="text"
        className="cotitularidad-input-height"
        required
      />
    </td>

    <td className="cotitular-box max-width-td">
      {/* RUC: string pero solo dígitos, validación de RUC EC */}
      <Components.GrowTextArea
        id={`ruc-${index}`}
        name="RUC"
        placeholder="RUC"
        value={fila.ruc}
        onChange={(e) => onChange("ruc", e.target.value)}
        maxLength={13}
        rows={1}
        kind="ruc"
        className="cotitularidad-input-height"
        required
      />
    </td>

    <td className="cotitular-box right-border max-width-td">
      {/* Correo: formato email */}
      <Components.GrowTextArea
        id={`correo-${index}`}
        name="Correo"
        placeholder="correo@dominio.com"
        value={fila.correo}
        onChange={(e) => onChange("correo", e.target.value)}
        maxLength={100}
        rows={1}
        kind="email"
        className="cotitularidad-input-height"
        required
      />
    </td>

    <td className="cotitular-box max-width-td">
      <Components.GrowTextArea
        id={`rep-nombre-${index}`}
        name="Representante"
        placeholder="Representante"
        value={fila.representante.nombre}
        onChange={(e) => onChange("representante.nombre", e.target.value)}
        maxLength={50}
        rows={1}
        kind="text"
        className="cotitularidad-input-height"
        required
      />
    </td>

    <td className="cotitular-box max-width-td">
      <Components.GrowTextArea
        id={`rep-correo-${index}`}
        name="RepresentanteCorreo"
        placeholder="correo@dominio.com"
        value={fila.representante.correo}
        onChange={(e) => onChange("representante.correo", e.target.value)}
        maxLength={100}
        rows={1}
        kind="email"
        className="cotitularidad-input-height"
      />
    </td>

    <td className="cotitular-box max-width-td">
      <Components.GrowTextArea
        id={`rep-tel-${index}`}
        name="RepresentanteTelefono"
        placeholder="Teléfono"
        value={fila.representante.telefono}
        onChange={(e) => onChange("representante.telefono", e.target.value)}
        maxLength={10}
        rows={1}
        kind="phone"
        className="cotitularidad-input-height"
      />
    </td>

    <td className="cotitular-box">
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
          if (v === "" || (/^\d{1,3}$/.test(v) && Number(v) <= 100)) {
            onPorcentajeChange(index, v);
          }
        }}
        placeholder="Ej: 50"
        className="cotitularidad-input-height cotitular-textarea porcentaje-cotitular"
        aria-label="Porcentaje del representante"
      />
    </td>

    <td>
      <button
        className="delete-row-btn"
        title="Eliminar cotitular"
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </td>
  </tr>
);

export default GeneralCotitularRow;
