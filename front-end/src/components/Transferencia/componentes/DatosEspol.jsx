import React from "react";

const DatosEspol = ({
  espolNombre,
  setEspolNombre,
  espolRuc,
  setEspolRuc,
  espolCorreo,
  setEspolCorreo,
  adminCorreoLocal,
  setAdminCorreoLocal,
  adminCorreoDominio,
  adminNombre,
  adminCedula,
  adminContacto,
  errores,
  shakeError,
}) => {
  return (
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la ESPOL</h1>
        <p className="subtitulo-form">
          Información institucional y del administrador del contrato.
        </p>
      </div>

      <div className="form-fieldsets">
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Datos de la ESPOL</h2>

          <div className="input-row">
            <label className="input-group">
              Nombre
              <input
                type="text"
                value={espolNombre}
                onChange={(e) => setEspolNombre(e.target.value)}
                className={errores.espolNombre ? "error" : ""}
                placeholder="Escuela Superior Politécnica del Litoral"
              />
            </label>

            <label className="input-group">
              RUC
              <input
                type="text"
                value={espolRuc}
                onChange={(e) => setEspolRuc(e.target.value)}
                className={errores.espolRuc ? "error" : ""}
                placeholder="###########"
              />
            </label>
          </div>

          <div className="input-row">
            <label className="input-group" style={{ flex: 1 }}>
              Correo
              <input
                type="email"
                value={espolCorreo}
                onChange={(e) => setEspolCorreo(e.target.value)}
                className={errores.espolCorreo ? "error" : ""}
                placeholder="contacto@espol.edu.ec"
              />
            </label>
          </div>
        </div>

        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">
            Datos del administrador de contrato
          </h2>

          <div className="input-row">
            <label
              className="input-group"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              Correo
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={adminCorreoLocal}
                  onChange={(e) => setAdminCorreoLocal(e.target.value)}
                  className={errores.adminCorreoLocal ? "error" : ""}
                  placeholder="usuario"
                  style={{ width: 220 }}
                />
                <span className="suffix">{adminCorreoDominio}</span>
              </div>
            </label>

            <label className="input-group">
              Nombre
              <input
                type="text"
                value={adminNombre}
                readOnly
                className="italic"
              />
            </label>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Cédula</label>
              <div className="value-big">{adminCedula}</div>
            </div>

            <div className="input-group">
              <label>Número de contacto</label>
              <div className="value-big">{adminContacto}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosEspol;