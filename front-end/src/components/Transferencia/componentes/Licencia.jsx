// src/components/Licencia.jsx
import React, { useState, useEffect } from "react";
import SublicenciaTabla from "./SublicenciaTabla";

const Licencia = ({ datos, setDatos, errores }) => {
  const [mostrarOpcionesRegalias, setMostrarOpcionesRegalias] = useState(false);
  const [tipoRegalia, setTipoRegalia] = useState(datos.regaliasTipo || "");
  const [valorRegalia, setValorRegalia] = useState(datos.regaliasValor || "");
  const [mostrarTablaSublicencias, setMostrarTablaSublicencias] = useState(false);

  // Efecto para mostrar/ocultar opciones de regalías
  useEffect(() => {
    setMostrarOpcionesRegalias(datos.tieneRegalias === "si");
    if (datos.tieneRegalias !== "si") {
      setDatos({
        ...datos,
        regaliasTipo: "",
        regaliasValor: ""
      });
      setTipoRegalia("");
      setValorRegalia("");
    }
  }, [datos.tieneRegalias]);

  // Efecto para mostrar/ocultar tabla de sublicencias
  useEffect(() => {
    setMostrarTablaSublicencias(datos.tieneSublicenciamiento === "si");
    if (datos.tieneSublicenciamiento !== "si") {
      setDatos({
        ...datos,
        sublicencias: []
      });
    } else if (!datos.sublicencias || datos.sublicencias.length === 0) {
      // Inicializar con una fila vacía si no hay sublicencias
      setDatos({
        ...datos,
        sublicencias: [{
          min: "",
          max: "",
          porcentajeEspol: "",
          porcentajeReceptor: ""
        }]
      });
    }
  }, [datos.tieneSublicenciamiento]);

  // Efecto para actualizar el valor de regalía en el estado principal
  useEffect(() => {
    if (tipoRegalia && valorRegalia) {
      let valorConvertido = tipoRegalia === "porcentaje" 
        ? parseFloat(valorRegalia) / 100 
        : parseInt(valorRegalia);
      
      setDatos({
        ...datos,
        regaliasTipo: tipoRegalia,
        regaliasValor: valorConvertido
      });
    }
  }, [tipoRegalia, valorRegalia]);

  const handleValorChange = (e) => {
    const value = e.target.value;
    // Solo permitir números enteros positivos
    if (/^\d*$/.test(value) && (value === "" || parseInt(value) > 0)) {
      setValorRegalia(value);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-card-header">Detalles de Licencia</h2>
      
      <div className="input-row">
        <label className="input-group">
          Plazo
          <input
            type="date"
            value={datos.fechaLimite || ""}
            onChange={(e) => setDatos({ ...datos, fechaLimite: e.target.value })}
            className={errores.fechaLimite ? "error" : ""}
          />
        </label>
      </div>

      <div className="input-row">
        <label className="input-group">
          ¿Tiene Regalías?
          <select
            value={datos.tieneRegalias || ""}
            onChange={(e) => setDatos({ ...datos, tieneRegalias: e.target.value })}
            className={errores.tieneRegalias ? "error" : ""}
          >
            <option value="">Seleccione una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        {mostrarOpcionesRegalias && (
        <>
          <div className="input-row">
            <div className="input-group">
              <span>Tipo de Regalía</span>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="unidad"
                    checked={tipoRegalia === "unidad"}
                    onChange={(e) => setTipoRegalia(e.target.value)}
                  />
                  <span>$ por unidad</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="porcentaje"
                    checked={tipoRegalia === "porcentaje"}
                    onChange={(e) => setTipoRegalia(e.target.value)}
                  />
                  <span>Por porcentaje</span>
                </label>
              </div>
            </div>
          </div>

          {tipoRegalia && (
            <div className="input-row">
              <label className="input-group">
                {tipoRegalia === "unidad" 
                  ? "Cantidad $(USD) por unidad" 
                  : "Porcentaje por unidad vendida (%)"}
                <input
                  type="text"
                  value={valorRegalia}
                  onChange={handleValorChange}
                  placeholder={tipoRegalia === "$" ? "Ej: $ 5" : "Ej: $ 10"}
                  className={errores.regaliasValor ? "error" : ""}
                />
              </label>
            </div>
          )}
        </>
      )}
      </div>

      <div className="input-row">
        <label className="input-group">
          ¿Tiene Sublicenciamiento?
          <select
            value={datos.tieneSublicenciamiento || ""}
            onChange={(e) => setDatos({ ...datos, tieneSublicenciamiento: e.target.value })}
            className={errores.tieneSublicenciamiento ? "error" : ""}
          >
            <option value="">Seleccione una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      {mostrarTablaSublicencias && (
        <SublicenciaTabla datos={datos} setDatos={setDatos} errores={errores} />
      )}
    </div>
  );
};

export default Licencia;