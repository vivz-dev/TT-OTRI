import React from "react";

const Cesion = ({ datos, setDatos, errores }) => {
  return (
    <div className="form-card">
      <h2 className="form-card-header">Detalles de Cesión</h2>

      <div className="input-row">
        <label className="input-group">
          Fecha Límite de Cesión
          {/* 🔒 No editable: se sincroniza desde "Fecha de fin" en DatosTransferencia */}
          <input
            type="date"
            value={datos?.fechaLimite || ""}
            onChange={(e) =>
              setDatos({ ...(datos || {}), fechaLimite: e.target.value })
            }
            className={errores.fechaLimite ? "error" : ""}
            readOnly
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
            title="Se establece automáticamente según la Fecha de fin"
          />
        </label>
      </div>
    </div>
  );
};

export default Cesion;
