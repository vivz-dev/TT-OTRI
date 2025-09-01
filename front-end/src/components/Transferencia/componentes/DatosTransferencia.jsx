import React, { useEffect, useState } from "react";
import { useGetTiposTransferenciaQuery } from "../../../services/tipoTransferenciaApi";
import Licencia from "./Licencia";
import Cesion from "./Cesion";

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
  datosAdicionales,
  setDatosAdicionales,
  errores,
  shakeError,
}) => {
  const [tiposOptions, setTiposOptions] = useState([]);
  const [plazoDias, setPlazoDias] = useState("");
  const { data: tiposData, error, isLoading } = useGetTiposTransferenciaQuery();

  // Filtrar solo los tipos con ID 1 y 2
  useEffect(() => {
    if (tiposData && tiposData.length > 0) {
      const filteredTipos = tiposData.filter(
        (tipoItem) => tipoItem.id === 1 || tipoItem.id === 2
      );
      setTiposOptions(filteredTipos);
      
      console.log("Tipos cargados:", tiposData);
      console.log("Tipos filtrados (IDs 1 y 2):", filteredTipos);
    }
  }, [tiposData]);

  // Calcular fecha fin cuando cambie fecha inicio o plazo
  useEffect(() => {
    if (fechaInicio && plazoDias) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaInicioObj);
      fechaFinObj.setDate(fechaInicioObj.getDate() + parseInt(plazoDias));
      
      // Formatear a YYYY-MM-DD para el input type="date"
      const fechaFinFormateada = fechaFinObj.toISOString().split('T')[0];
      setFechaFin(fechaFinFormateada);
    }
  }, [fechaInicio, plazoDias, setFechaFin]);

  // Determinar qué componente mostrar basado en el ID del tipo seleccionado
  const renderComponenteAdicional = () => {
    console.log("Tipo seleccionado ID:", tipo);
    
    if (tipo === "1") {
      return (
        <Licencia
          datos={datosAdicionales}
          setDatos={setDatosAdicionales}
          errores={errores}
        />
      );
    } else if (tipo === "2") {
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
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
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
              Plazo
              <div className="plazo-input-container">
                <input
                  type="number"
                  value={plazoDias}
                  onChange={(e) => setPlazoDias(e.target.value)}
                  min="1"
                  placeholder="Número de días"
                  className="plazo-input"
                />
                <span className="plazo-suffix">días</span>
              </div>
            </label>
          </div>

          <div className="input-row">
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

            <label className="input-group">
              Modalidad
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={errores.tipo ? "error" : ""}
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

          <div className="input-row">
            <label className="input-group">
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={errores.nombre ? "error" : ""}
                placeholder="Nombre o Título Referencial"
              />
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
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group checkbox-group">
              <input
                type="checkbox"
                checked={pago}
                onChange={(e) => setPago(e.target.checked)}
              />
              <span>Tipo: Gratuita o pagada (Si/No)</span>
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