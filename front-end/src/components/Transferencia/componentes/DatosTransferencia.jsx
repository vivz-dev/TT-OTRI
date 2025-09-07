import React, { useEffect } from "react";
import { useGetTiposTransferenciaQuery } from "../../../services/tipoTransferenciaApi";
import Licencia from "./Licencia";
import Cesion from "./Cesion";
import * as Components from "../../layouts/components";

const DatosTransferencia = ({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  tipo, // number | ""
  setTipo,
  nombre,
  setNombre,
  monto,
  setMonto,
  pago,
  setPago,
  datosAdicionales,
  setDatosAdicionales,
  errores,
  shakeError,
  plazoDias,
  setPlazoDias,
}) => {
  const { data: tiposData, error, isLoading } = useGetTiposTransferenciaQuery();

  // Si NO es pagada, fuerza monto=0 y deshabilita el input
  useEffect(() => {
    if (pago === false) setMonto("0");
  }, [pago, setMonto]);

  const [tiposOptions, setTiposOptions] = React.useState([]);

  // Filtrar solo los tipos con ID 1 (Licencia) y 2 (Cesión)
  useEffect(() => {
    if (Array.isArray(tiposData) && tiposData.length > 0) {
      const filteredTipos = tiposData.filter(
        (tipoItem) => tipoItem.id === 1 || tipoItem.id === 2
      );
      setTiposOptions(filteredTipos);
    }
  }, [tiposData]);

  // Calcular fecha fin cuando cambie fecha inicio o plazo
  useEffect(() => {
    if (fechaInicio && plazoDias) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaInicioObj);
      fechaFinObj.setDate(fechaInicioObj.getDate() + parseInt(plazoDias, 10));
      const fechaFinFormateada = fechaFinObj.toISOString().split("T")[0];
      setFechaFin(fechaFinFormateada);
    }
  }, [fechaInicio, plazoDias, setFechaFin]);

  // Sincroniza fecha límite de cesión con fecha de fin cuando tipo = Cesión
  useEffect(() => {
    if (tipo === 2) {
      setDatosAdicionales((prev) => {
        const prevFecha = prev?.fechaLimite || "";
        const nueva = fechaFin || "";
        if (prevFecha === nueva) return prev || {};
        return { ...(prev || {}), fechaLimite: nueva };
      });
    }
  }, [fechaFin, tipo, setDatosAdicionales]);

  // Sincroniza fecha límite de licenciamiento con fecha de fin cuando tipo = Licencia
  useEffect(() => {
    if (tipo === 1) {
      setDatosAdicionales((prev) => {
        const prevFecha = prev?.fechaLimite || "";
        const nueva = fechaFin || "";
        if (prevFecha === nueva) return prev || {};
        return { ...(prev || {}), fechaLimite: nueva };
      });
    }
  }, [fechaFin, tipo, setDatosAdicionales]);

  const renderComponenteAdicional = () => {
    if (tipo === 1) {
      return (
        <Licencia
          datos={datosAdicionales}
          setDatos={setDatosAdicionales}
          errores={errores}
        />
      );
    } else if (tipo === 2) {
      return (
        <Cesion
          datos={datosAdicionales}
          setDatos={setDatosAdicionales}
          errores={errores}
        />
      );
    }
    return null;
  };

  return (
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">
          Datos de la transferencia tecnológica
        </h1>
        <p className="subtitulo-form">Complete la información sobre la TT.</p>
      </div>

      <div className="form-fieldsets">
        <div
          className={`form-card ${
            shakeError ? "error shake" : ""
          } separate-card`}
        >
          <div className="input-row">
            <label className="input-group">
              Fecha de inicio
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={errores.fechaInicio ? "error" : ""}
              />
            </label>

            <label className="input-group">
              Fecha de fin
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={errores.fechaFin ? "error" : ""}
                readOnly
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Plazo
              <div
                className="plazo-input-container"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "center",
                  alignContent: "center",
                }}
              >
                <input
                  type="number"
                  value={plazoDias}
                  onChange={(e) => setPlazoDias(e.target.value)}
                  min="1"
                  placeholder="#"
                  className="plazo-input"
                />
                <span className="plazo-suffix">días</span>
              </div>
            </label>

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
                disabled={pago === false}
                style={
                  pago === false
                    ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
                    : undefined
                }
                aria-disabled={pago === false}
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Nombre / Título Referencial
              <Components.GrowTextArea
                placeholder="Nombre o Título Referencial"
                value={nombre}
                maxLength={100}
                onChange={(e) => setNombre(e.target.value)}
                className={errores.nombre ? "error" : ""}
              />
            </label>
          </div>

          {/* Selector rounded para pago (true/false) */}
          <div
            className="input-row"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            <div className="input-group" style={{ width: "100%" }}>
              <h2 className="form-card-header">¿La transferencia es pagada?</h2>
              <div className="checkbox-container">
                <label className="checkbox-rounded">
                  <input
                    type="radio"
                    name="pago"
                    value="si"
                    checked={pago === true}
                    onChange={() => setPago(true)}
                  />
                  Sí (Pagada)
                </label>
                <label className="checkbox-rounded">
                  <input
                    type="radio"
                    name="pago"
                    value="no"
                    checked={pago === false}
                    onChange={() => setPago(false)}
                  />
                  No (Gratuita)
                </label>
              </div>
            </div>
          </div>

          <div className="input-row">
            <label className="input-group">
              Modalidad
              <select
                value={String(tipo ?? "")} // controlado como string, guardado como number
                onChange={(e) => {
                  const v = e.target.value;
                  const n = Number(v);
                  setTipo(Number.isFinite(n) ? n : "");
                }}
                className={errores.tipo ? "error" : ""}
                style={{
                  borderRadius: "20px",
                  height: "50px",
                  padding: "10px",
                }}
              >
                <option value="">Seleccione un tipo</option>
                {isLoading && <option value="">Cargando tipos...</option>}
                {error && <option value="">Error al cargar tipos</option>}
                {tiposOptions.map((tipoItem) => (
                  <option key={tipoItem.id} value={tipoItem.id}>
                    {tipoItem.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Mostrar componente específico según el ID del tipo seleccionado */}
        {renderComponenteAdicional()}
      </div>
    </div>
  );
};

export default DatosTransferencia;
