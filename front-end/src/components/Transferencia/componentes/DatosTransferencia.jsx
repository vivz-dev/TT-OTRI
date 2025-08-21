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

        {/* Mostrar componente específico según el ID del tipo seleccionado */}
        {renderComponenteAdicional()}
      </div>
    </div>
  );
};

export default DatosTransferencia;