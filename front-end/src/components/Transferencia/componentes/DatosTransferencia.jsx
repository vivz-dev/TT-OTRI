import React from "react";

const DatosTransferencia = ({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  tipo,
  setTipo,
  nombre,
  setNombre,
  monto,
  setMonto,
  pago,
  setPago,
  errores,
  shakeError,
}) => {
  return (
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">
          Datos de la transferencia tecnológica
        </h1>
        <p className="subtitulo-form">Complete la información sobre la TT.</p>
      </div>

      <div className="form-fieldsets">
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Información básica</h2>

          <div className="input-row">
            <label className="input-group">
              Fecha de inicio de Transferencia Tecnológica
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={errores.fechaInicio ? "error" : ""}
              />
            </label>

            <label className="input-group">
              Fecha de fin de Transferencia Tecnológica
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={errores.fechaFin ? "error" : ""}
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Tipo
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={errores.tipo ? "error" : ""}
                placeholder="Tipo de TT (p. ej. Licencia, Spin-off, Know-how)…"
              />
            </label>

            <label className="input-group">
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={errores.nombre ? "error" : ""}
                placeholder="Nombre o referencia comercial…"
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Monto
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={errores.monto ? "error" : ""}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            <label className="input-group checkbox-group">
              <input
                type="checkbox"
                checked={pago}
                onChange={(e) => setPago(e.target.checked)}
              />
              <span>¿Lleva Pago?</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosTransferencia;