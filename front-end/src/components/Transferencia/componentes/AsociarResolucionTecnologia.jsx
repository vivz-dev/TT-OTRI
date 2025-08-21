import React from "react";
import * as Components from "../../layouts/components/index";

const AsociarResolucionTecnologia = ({
  idResolucion,
  setIdResolucion,
  idTecnologia,
  setIdTecnologia,
  resolucionesOpts,
  techOpts,
  isLoading,
  error,
  isTechLoading,
  techError,
  selectedRes,
  selectedTec,
  errores,
  shakeError,
}) => {
  return (
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">
          Asociación de resolución y tecnología
        </h1>
        <p className="subtitulo-form">
          Selecciona la resolución y la tecnología/know-how relacionadas a esta
          transferencia.
        </p>
      </div>

      <div className="form-fieldsets">
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Seleccionar Resolución</h2>
          <div className="input-row">
            <label className="input-group">
              Resolución
              <select
                value={idResolucion}
                onChange={(e) => setIdResolucion(e.target.value)}
                className={errores.idResolucion ? "error" : ""}
                disabled={isLoading || error}
              >
                <option value="">
                  {isLoading
                    ? "Cargando resoluciones…"
                    : error
                    ? "Error al cargar"
                    : "Seleccione…"}
                </option>
                {resolucionesOpts.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedRes && (
            <Components.Card
              key={selectedRes.id}
              titulo={selectedRes.codigo}
              estado={selectedRes.estado}
              descripcion={selectedRes.descripcion}
              textoFecha={selectedRes.fecha}
              textoRegistrado={selectedRes.usuario}
              completed={selectedRes.completed}
            />
          )}
        </div>

        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Seleccionar Tecnología</h2>
          <div className="input-row">
            <label className="input-group">
              Tecnología
              <select
                value={idTecnologia}
                onChange={(e) => setIdTecnologia(e.target.value)}
                className={errores.idTecnologia ? "error" : ""}
                disabled={isTechLoading || techError}
              >
                <option value="">
                  {isTechLoading
                    ? "Cargando tecnologías…"
                    : techError
                    ? "Error al cargar"
                    : "Seleccione…"}
                </option>
                {techOpts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedTec && (
            <Components.Card
              key={selectedTec.id}
              titulo={selectedTec.codigo}
              estado={selectedTec.estado}
              descripcion={selectedTec.descripcion}
              textoFecha={selectedTec.fecha}
              textoRegistrado={selectedTec.usuario}
              completed={selectedTec.completed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AsociarResolucionTecnologia;