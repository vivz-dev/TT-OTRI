import React from "react";
import CorreoESPOLInput from "./CorreoESPOLInput";
import "./Cotitularidad.css";
import * as Components from "../../layouts/components";

const ESPOLCotitularRow = ({
  fila,
  index,
  onSelectUsuario,
  onPorcentajeChange,
  onTelefonoChange,
}) => {
  const handlePctChange = (e) => {
    const raw = (e.target.value ?? "").replace(/[^\d]/g, "");
    const n = raw === "" ? "" : Math.min(100, Number(raw));
    onPorcentajeChange?.(index, n === "" ? "" : String(n));
  };

  return (
    <tr className="autor-name ">
      <td className="espol-fixed-td">Escuela Superior Politécnica del Litoral</td>
      <td className="fixed-td">0960002780001</td>
      <td className="right-border fixed-td">otri@espol.edu.ec</td>

      <td className="max-width-td">{fila?.representante?.nombre || ""}</td>

      <td className="cell-correo  cotitular-box ">
        <div className="correo-institucional-wrapper">
          <CorreoESPOLInput
            onSelectUsuario={(u) => onSelectUsuario?.(u, index)}
            className="correo-user-input"
            menuClassName="correo-menu"
          />
        </div>
      </td>

      <td className="cotitular-box max-width-td">
        <Components.GrowTextArea
          id={`rep-tel-${index}`}
          name="RepresentanteTelefono"
          placeholder="Teléfono"
          value={fila?.representante?.telefono ?? ""}
          onChange={(e) => onTelefonoChange?.(index, e.target.value)}
          maxLength={10}
          rows={1}
          kind="phone"
          className="cotitularidad-input-height"
        />
      </td>

      <td className="cotitular-box">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fila?.representante?.porcentaje ?? ""}
          onChange={handlePctChange}
          placeholder="Ej: 50"
          className="cotitularidad-input-height cotitular-textarea porcentaje-cotitular"
          aria-label="Porcentaje de titularidad"
        />
      </td>

      <td />
    </tr>
  );
};

export default ESPOLCotitularRow;
