// src/pages/TT/DatosEspol.jsx  (ajusta la ruta si tu estructura difiere)
import React, { useEffect, useState } from "react";
import CorreoESPOLInput from "../../Tecnologias/componentes/CorreoESPOLInput";

const DatosEspol = ({
  // ESPOL
  espolNombre,
  setEspolNombre,
  espolRuc,
  setEspolRuc,
  espolCorreo,
  setEspolCorreo,

  // Admin de contrato (valores iniciales)
  adminCorreoLocal,
  setAdminCorreoLocal,
  adminCorreoDominio,
  adminNombre,        // nombre "oficial" inicial (solo lectura)
  adminCedula,
  adminContacto,

  // Setters opcionales para propagar cambios al padre
  setAdminCedula,
  setAdminContacto,
  setAdminNombreLabel, // si quieres que el padre también reciba el nombre autocompletado

  // Receptor (opcional) — por defecto usa valores del admin
  receptorCorreoLocal = adminCorreoLocal,
  setReceptorCorreoLocal = setAdminCorreoLocal,
  receptorNombre = adminNombre,
  receptorCedula = adminCedula,
  receptorContacto = adminContacto,

  // Setters opcionales receptor
  setReceptorCedula,
  setReceptorContacto,
  setReceptorNombreLabel,

  // 👇 NUEVO: Gestor OTRI (opcional). Si no se pasan, se manejan localmente aquí.
  gestorCorreoLocal = "",
  setGestorCorreoLocal,       // opcional
  gestorNombre = "",
  gestorCedula = "",
  gestorContacto = "",
  setGestorCedula,            // opcional
  setGestorContacto,          // opcional
  setGestorNombreLabel,       // opcional

  errores,
  shakeError,
}) => {
  // Estados locales para mostrar nombres que vienen del directorio (no editables)
  const [adminNombreAuto, setAdminNombreAuto] = useState(adminNombre || "");
  const [receptorNombreAuto, setReceptorNombreAuto] = useState(receptorNombre || "");
  const [gestorNombreAuto, setGestorNombreAuto] = useState(gestorNombre || "");

  // Estados locales editables para cédula y contacto
  const [adminCedulaLocal, setAdminCedulaLocal] = useState(adminCedula || "");
  const [adminContactoLocal, setAdminContactoLocal] = useState(adminContacto || "");
  const [receptorCedulaLocal, setReceptorCedulaLocal] = useState(receptorCedula || "");
  const [receptorContactoLocal, setReceptorContactoLocal] = useState(receptorContacto || "");
  const [gestorCedulaLocal, setGestorCedulaLocal] = useState(gestorCedula || "");
  const [gestorContactoLocal, setGestorContactoLocal] = useState(gestorContacto || "");

  // Sincroniza estados locales cuando cambian props iniciales (evita desalineación)
  useEffect(() => {
    setAdminNombreAuto((v) => (adminNombre && !v ? adminNombre : v));
  }, [adminNombre]);
  useEffect(() => {
    if (adminCedula != null && adminCedula !== adminCedulaLocal) {
      setAdminCedulaLocal(adminCedula);
    }
  }, [adminCedula]); // eslint-disable-line
  useEffect(() => {
    if (adminContacto != null && adminContacto !== adminContactoLocal) {
      setAdminContactoLocal(adminContacto);
    }
  }, [adminContacto]); // eslint-disable-line

  useEffect(() => {
    setReceptorNombreAuto((v) => (receptorNombre && !v ? receptorNombre : v));
  }, [receptorNombre]);
  useEffect(() => {
    if (receptorCedula != null && receptorCedula !== receptorCedulaLocal) {
      setReceptorCedulaLocal(receptorCedula);
    }
  }, [receptorCedula]); // eslint-disable-line
  useEffect(() => {
    if (receptorContacto != null && receptorContacto !== receptorContactoLocal) {
      setReceptorContactoLocal(receptorContacto);
    }
  }, [receptorContacto]); // eslint-disable-line

  useEffect(() => {
    setGestorNombreAuto((v) => (gestorNombre && !v ? gestorNombre : v));
  }, [gestorNombre]);
  useEffect(() => {
    if (gestorCedula != null && gestorCedula !== gestorCedulaLocal) {
      setGestorCedulaLocal(gestorCedula);
    }
  }, [gestorCedula]); // eslint-disable-line
  useEffect(() => {
    if (gestorContacto != null && gestorContacto !== gestorContactoLocal) {
      setGestorContactoLocal(gestorContacto);
    }
  }, [gestorContacto]); // eslint-disable-line

  // Handlers de selección desde el autocompletado
  const handleAdminCorreoSelect = (user) => {
    const username = user?.username || "";
    const nombre = user?.nombre || "";
    setAdminCorreoLocal?.(username);
    if (nombre) {
      setAdminNombreAuto(nombre);
      setAdminNombreLabel?.(nombre); // opcional: notificar al padre
    }
  };

  const handleReceptorCorreoSelect = (user) => {
    const username = user?.username || "";
    const nombre = user?.nombre || "";
    setReceptorCorreoLocal?.(username);
    if (nombre) {
      setReceptorNombreAuto(nombre);
      setReceptorNombreLabel?.(nombre); // opcional: notificar al padre
    }
  };

  const handleGestorCorreoSelect = (user) => {
    const username = user?.username || "";
    const nombre = user?.nombre || "";
    setGestorCorreoLocal?.(username); // si el padre lo provee
    if (nombre) {
      setGestorNombreAuto(nombre);
      setGestorNombreLabel?.(nombre); // opcional: notificar al padre
    }
  };

  // Handlers de inputs editables con burbujeo opcional
  const onAdminCedulaChange = (e) => {
    const v = e.target.value;
    setAdminCedulaLocal(v);
    setAdminCedula?.(v);
  };
  const onAdminContactoChange = (e) => {
    const v = e.target.value;
    setAdminContactoLocal(v);
    setAdminContacto?.(v);
  };
  const onReceptorCedulaChange = (e) => {
    const v = e.target.value;
    setReceptorCedulaLocal(v);
    setReceptorCedula?.(v);
  };
  const onReceptorContactoChange = (e) => {
    const v = e.target.value;
    setReceptorContactoLocal(v);
    setReceptorContacto?.(v);
  };
  const onGestorCedulaChange = (e) => {
    const v = e.target.value;
    setGestorCedulaLocal(v);
    setGestorCedula?.(v);
  };
  const onGestorContactoChange = (e) => {
    const v = e.target.value;
    setGestorContactoLocal(v);
    setGestorContacto?.(v);
  };

  return (
    <>
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la ESPOL</h1>
        <p className="subtitulo-form">
          Información institucional y de los involucrados en el contrato de TT.
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

        {/* GESTOR OTRI */}
      <div className="form-fieldsets">
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Gestor de la OTRI</h2>

          <div className="input-row">
            <label
              className="input-group"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              Correo
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 220 }}>
                  <CorreoESPOLInput
                    onSelectUsuario={handleGestorCorreoSelect}
                    className="correo-user-input cotitular-box"
                    menuClassName="correo-menu"
                  />
                </div>
              </div>
            </label>

            <label className="input-group">
              Nombre
              {/* NO editable; proviene del directorio */}
              <div className="value-big italic" title={gestorNombreAuto || "—"}>
                {gestorNombreAuto || "—"}
              </div>
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Cédula
              <input
                type="text"
                value={gestorCedulaLocal}
                onChange={onGestorCedulaChange}
                placeholder="Cédula / DNI"
              />
            </label>

            <label className="input-group">
              Número de contacto
              <input
                type="tel"
                value={gestorContactoLocal}
                onChange={onGestorContactoChange}
                placeholder="0999999999"
              />
            </label>
          </div>
        </div>
      </div>

        {/* ADMIN */}
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">Datos del administrador de contrato</h2>

          <div className="input-row">
            <label
              className="input-group"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              Correo
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 220 }}>
                  <CorreoESPOLInput
                    onSelectUsuario={handleAdminCorreoSelect}
                    className="correo-user-input cotitular-box"
                    menuClassName="correo-menu"
                  />
                </div>
              </div>
            </label>

            <label className="input-group">
              Nombre
              {/* NO editable; proviene del directorio */}
              <div className="value-big italic" title={adminNombreAuto || "—"}>
                {adminNombreAuto || "—"}
              </div>
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Cédula
              <input
                type="text"
                value={adminCedulaLocal}
                onChange={onAdminCedulaChange}
                placeholder="Cédula / DNI"
              />
            </label>

            <label className="input-group">
              Número de contacto
              <input
                type="tel"
                value={adminContactoLocal}
                onChange={onAdminContactoChange}
                placeholder="0999999999"
              />
            </label>
          </div>
        </div>
      </div>
      
    </div>
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos del receptor</h1>
        <p className="subtitulo-form">
          Información de la persona natural o jurídica receptora de la tecnología/<em>know-how.</em>
        </p>
      </div>

      {/* RECEPTOR */}
      <div className="form-fieldsets">
        <div className={`form-card ${shakeError ? "error shake" : ""}`}>
          <h2 className="form-card-header">
            Datos del receptor de tecnología<em>/know-how</em>
          </h2>

          <div className="input-row">
            <label
              className="input-group"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              Correo
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 220 }}>
                  <CorreoESPOLInput
                    onSelectUsuario={handleReceptorCorreoSelect}
                    className="correo-user-input cotitular-box"
                    menuClassName="correo-menu"
                  />
                </div>
              </div>
            </label>

            <label className="input-group">
              Nombre
              {/* NO editable; proviene del directorio */}
              <div className="value-big italic" title={receptorNombreAuto || "—"}>
                {receptorNombreAuto || "—"}
              </div>
            </label>
          </div>

          <div className="input-row">
            <label className="input-group">
              Cédula
              <input
                type="text"
                value={receptorCedulaLocal}
                onChange={onReceptorCedulaChange}
                placeholder="Cédula / DNI"
              />
            </label>

            <label className="input-group">
              Número de contacto
              <input
                type="tel"
                value={receptorContactoLocal}
                onChange={onReceptorContactoChange}
                placeholder="0999999999"
              />
            </label>
          </div>
        </div>
      </div>

      
    </div>
    </>
  );
};

export default DatosEspol;
