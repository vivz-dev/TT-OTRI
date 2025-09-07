// src/pages/layouts/components/Licencia.jsx
import React, { useState, useEffect } from "react";
import SublicenciaTabla from "./SublicenciaTabla";

const Licencia = ({ datos = {}, setDatos, errores = {} }) => {
  const [mostrarOpcionesRegalias, setMostrarOpcionesRegalias] = useState(false);
  const [tipoRegalia, setTipoRegalia] = useState(datos.regaliasTipo || "");
  const [valorRegalia, setValorRegalia] = useState(
    datos.regaliasValor != null && datos.regaliasTipo === "porcentaje"
      ? String(Number(datos.regaliasValor) * 100)
      : datos.regaliasValor != null
      ? String(datos.regaliasValor)
      : ""
  );
  const [mostrarTablaSublicencias, setMostrarTablaSublicencias] =
    useState(false);

  // Mostrar/ocultar opciones de regalías
  useEffect(() => {
    const visible = datos.tieneRegalias === true;
    setMostrarOpcionesRegalias(visible);

    if (!visible) {
      // Evitar sets si ya está limpio
      const needsClear =
        (datos.regaliasTipo && datos.regaliasTipo !== "") ||
        (datos.regaliasValor !== "" && datos.regaliasValor != null);
      if (needsClear) {
        setDatos((prev) => ({
          ...(prev || {}),
          regaliasTipo: "",
          regaliasValor: "",
        }));
      }
      if (tipoRegalia !== "") setTipoRegalia("");
      if (valorRegalia !== "") setValorRegalia("");
    }
  }, [datos.tieneRegalias, datos.regaliasTipo, datos.regaliasValor, setDatos]); // <-- no bucles

  // Mostrar/ocultar tabla de sublicencias
  // IMPORTANTE: NO dependas de datos.sublicencias (cambia de referencia y causa loops)
  useEffect(() => {
    const visible = datos.tieneSublicenciamiento === true;
    setMostrarTablaSublicencias(visible);

    if (!visible) {
      // Solo limpiar si actualmente hay algo
      const hasItems =
        Array.isArray(datos.sublicencias) && datos.sublicencias.length > 0;
      if (hasItems) {
        setDatos((prev) => {
          const cur = Array.isArray(prev?.sublicencias)
            ? prev.sublicencias
            : [];
          if (cur.length === 0) return prev || {};
          return { ...(prev || {}), sublicencias: [] };
        });
      }
    } else {
      // Inicializar SOLO si no existe o está vacío
      const necesitaInicial =
        !Array.isArray(datos.sublicencias) || datos.sublicencias.length === 0;
      if (necesitaInicial) {
        setDatos((prev) => {
          const cur = Array.isArray(prev?.sublicencias)
            ? prev.sublicencias
            : [];
          if (cur.length > 0) return prev || {};
          return {
            ...(prev || {}),
            sublicencias: [
              { min: "", max: "", porcentajeEspol: "", porcentajeReceptor: "" },
            ],
          };
        });
      }
    }
  }, [datos.tieneSublicenciamiento, setDatos]); // <-- quitamos datos.sublicencias de deps

  // Actualizar valor de regalía en el estado principal (con guardas)
  useEffect(() => {
    if (!tipoRegalia || valorRegalia === "") return;

    const valorConvertido =
      tipoRegalia === "porcentaje"
        ? parseFloat(valorRegalia) / 100
        : parseInt(valorRegalia, 10);

    if (isNaN(valorConvertido)) return;

    const yaIgual =
      datos.regaliasTipo === tipoRegalia &&
      Number(datos.regaliasValor) === Number(valorConvertido);

    if (!yaIgual) {
      setDatos((prev) => ({
        ...(prev || {}),
        regaliasTipo: tipoRegalia,
        regaliasValor: valorConvertido,
      }));
    }
  }, [
    tipoRegalia,
    valorRegalia,
    datos.regaliasTipo,
    datos.regaliasValor,
    setDatos,
  ]);

  const handleValorChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setValorRegalia(value);
  };

  return (
    <div className="form-card separate-card">
      <h2 className="form-card-header">Detalles de Licenciamiento</h2>
      <div className="input-row">
        <label className="input-group">
          Fecha plazo
          {/* 🔒 No editable: se sincroniza desde "Fecha de fin" en DatosTransferencia */}
          <input
            type="date"
            value={datos.fechaLimite || ""}
            className={errores.fechaLimite ? "error" : ""}
            readOnly
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
            title="Se establece automáticamente según la Fecha de fin"
          />
        </label>
      </div>

      {/* Selector rounded para regalías */}
      <div
        className="input-row"
        style={{ marginLeft: "auto", marginRight: "auto" }}
      >
        <div className="input-group" style={{ width: "100%" }}>
          <h2 className="form-card-header">¿Tiene Regalías?</h2>
          <div
            className={`checkbox-container ${
              errores.tieneRegalias ? "error" : ""
            }`}
          >
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="tieneRegalias"
                checked={datos.tieneRegalias === true}
                onChange={() =>
                  setDatos({ ...(datos || {}), tieneRegalias: true })
                }
              />
              Sí
            </label>
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="tieneRegalias"
                checked={datos.tieneRegalias === false}
                onChange={() =>
                  setDatos({ ...(datos || {}), tieneRegalias: false })
                }
              />
              No
            </label>
          </div>
        </div>
      </div>

      {mostrarOpcionesRegalias && (
        <>
          {/* ⬇️ FORMATO CENTRADO IGUAL AL EJEMPLO */}
          <div
            className="input-row"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            <div className="input-group" style={{ width: "100%" }}>
              <h2 className="form-card-header">Tipo de regalía</h2>
              <div
            className={`checkbox-container ${
              errores.tieneRegalias ? "error" : ""
            }`}
          >
                <label className="checkbox-rounded">
                  <input
                    type="radio"
                    name="tipoRegalia"
                    value="unidad"
                    checked={tipoRegalia === "unidad"}
                    onChange={(e) => setTipoRegalia(e.target.value)}
                  />
                  <span>$ por unidad</span>
                </label>
                <label className="checkbox-rounded">
                  <input
                    type="radio"
                    name="tipoRegalia"
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
            <div
              className="input-row"
              style={{ marginLeft: "auto", marginRight: "auto" }}
            >
              <div className="input-group" style={{ width: "100%" }}>
                <h2 className="form-card-header">
                  {tipoRegalia === "unidad"
                    ? "Cantidad $(USD) por unidad"
                    : "Porcentaje por unidad vendida (%)"}
                </h2>
                <input
                  type="text"
                  value={valorRegalia}
                  onChange={handleValorChange}
                  placeholder={tipoRegalia === "unidad" ? "Ej: 5" : "Ej: 10"}
                  className={errores.regaliasValor ? "error" : ""}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Selector rounded para sublicenciamiento */}
      <div
        className="input-row"
        style={{ marginLeft: "auto", marginRight: "auto" }}
      >
        <div className="input-group" style={{ width: "100%" }}>
          <h2 className="form-card-header">¿Tiene Sublicenciamiento?</h2>
          <div
            className={`checkbox-container ${
              errores.tieneSublicenciamiento ? "error" : ""
            }`}
          >
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="tieneSublicenciamiento"
                checked={datos.tieneSublicenciamiento === true}
                onChange={() =>
                  setDatos({
                    ...(datos || {}),
                    tieneSublicenciamiento: true,
                  })
                }
              />
              Sí
            </label>
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="tieneSublicenciamiento"
                checked={datos.tieneSublicenciamiento === false}
                onChange={() =>
                  setDatos({
                    ...(datos || {}),
                    tieneSublicenciamiento: false,
                  })
                }
              />
              No
            </label>
          </div>
        </div>
      </div>

      {/* NUEVO: Selector rounded para Licencia Exclusiva */}
      <div
        className="input-row"
        style={{ marginLeft: "auto", marginRight: "auto" }}
      >
        <div className="input-group" style={{ width: "100%" }}>
          <h2 className="form-card-header">¿Tiene licencia exclusiva?</h2>
          <div
            className={`checkbox-container ${
              errores.licenciaExclusiva ? "error" : ""
            }`}
          >
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="licenciaExclusiva"
                checked={datos.licenciaExclusiva === true}
                onChange={() =>
                  setDatos({ ...(datos || {}), licenciaExclusiva: true })
                }
              />
              Sí
            </label>
            <label className="checkbox-rounded">
              <input
                type="radio"
                name="licenciaExclusiva"
                checked={datos.licenciaExclusiva === false}
                onChange={() =>
                  setDatos({ ...(datos || {}), licenciaExclusiva: false })
                }
              />
              No
            </label>
          </div>
        </div>
      </div>

      {mostrarTablaSublicencias && (
        <SublicenciaTabla datos={datos} setDatos={setDatos} errores={errores} />
      )}
    </div>
  );
};

export default Licencia;
