// src/components/Cesion.jsx
import React from "react";

const Cesion = ({ datos, setDatos, errores }) => {
  return (
    <div className="form-card">
      <h2 className="form-card-header">Detalles de Cesión</h2>
    
      <div className="input-row">
        <label className="input-group">
          Fecha Límite de Cesión
          <input
            type="date"
            value={datos.fechaLimite || ""}
            onChange={(e) => setDatos({ ...datos, fechaLimite: e.target.value })}
            className={errores.fechaLimite ? "error" : ""}
          />
        </label>
      </div>
    </div>
  );
};

export default Cesion;