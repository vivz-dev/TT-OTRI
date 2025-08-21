// TTForm.jsx
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useEffect,
} from "react";
import "./TTForm.css";
import { useGetResolutionsQuery } from "../../../services/resolutionsApi";
import { useGetTechnologiesQuery } from "../../../services/technologiesApi";
import * as Components from "../../layouts/components/index";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const TTForm = forwardRef(({ shakeError }, ref) => {
  /* ---------------- Campos del bloque básico ---------------- */
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState("");
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [pago, setPago] = useState(false);

  /* ---------------- Selecciones ---------------- */
  const [idResolucion, setIdResolucion] = useState("");
  const [idTecnologia, setIdTecnologia] = useState("");

  /* ---------------- Servicio de resoluciones ---------------- */
  const { data: resolutions = [], isLoading, error } = useGetResolutionsQuery();

  const resolucionesOpts = useMemo(() => {
    if (error || !resolutions) return [];

    // Filtrar resoluciones: completed=true y estado='Vigente'
    return resolutions
      .filter((r) => r.completed === true && r.estado === "Vigente")
      .map((r) => ({
        id: r.id,
        label: `${r.codigo} — ${r.descripcion?.slice(0, 60) || ""}`,
        estado: r.estado,
        completed: r.completed,
        titulo: r.codigo || "Sin título", // ← título = número/código
        descripcion: r.descripcion || "Sin descripción", // ← cuerpo = descripción
        fecha: fmtFecha(r.fechaResolucion),
        usuario: r.idUsuario || "Usuario no disponible",
      }));
  }, [resolutions, error]);

  console.log("Resoluciones disponibles:", resolucionesOpts);

  /* ---------------- Servicio de tecnologías ---------------- */
  const {
    data: technologiesData = [],
    isLoading: isTechLoading,
    error: techError,
  } = useGetTechnologiesQuery();

  const techOpts = useMemo(() => {
    if (!technologiesData || technologiesData.length === 0) return [];

    // Filtrar tecnologías: completed=true y estado='Disponible'
    return technologiesData
      .filter((t) => t.completed === true && t.estado === "Disponible")
      .map((tecnologia) => ({
        id: tecnologia.id,
        label: `${tecnologia.titulo} — ${
          tecnologia.descripcion?.slice(0, 60) || ""
        }`,
        estado: tecnologia.estado,
        completed: tecnologia.completed,
        titulo: tecnologia.titulo || "Sin título",
        descripcion: tecnologia.descripcion || "Sin descripción",
        fecha: fmtFecha(tecnologia.fechaInicio),
        usuario: tecnologia.usuario || "Usuario no disponible",
      }));
  }, [technologiesData]);

  /* ---------------- Datos ESPOL & Admin contrato ---------------- */
  const [espolNombre, setEspolNombre] = useState("");
  const [espolRuc, setEspolRuc] = useState("");
  const [espolCorreo, setEspolCorreo] = useState("");

  // Admin contrato
  const [adminCorreoLocal, setAdminCorreoLocal] = useState("");
  const adminCorreoDominio = "@espol.edu.ec";
  const adminNombre = "Viviana Yolanda Vera Falconí";
  const adminCedula = "0930455694";
  const adminContacto = "0958798761";

  /* ---------------- Errores ---------------- */
  const [errores, setErrores] = useState({
    fechaInicio: false,
    fechaFin: false,
    tipo: false,
    nombre: false,
    monto: false,
    idResolucion: false,
    idTecnologia: false,
    espolNombre: false,
    espolRuc: false,
    espolCorreo: false,
    adminCorreoLocal: false,
  });

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isRucLike = (v) => /^[0-9]{10,13}$/.test(v.replace(/\D/g, ""));

  // Función para obtener datos actuales (para depuración)
  const getCurrentData = () => {
    const correoAdminCompleto = adminCorreoLocal
      ? `${adminCorreoLocal}${adminCorreoDominio}`
      : "";

    return {
      fechaInicio,
      fechaFin,
      tipo,
      nombre,
      monto: monto === "" ? null : parseFloat(monto),
      Pago: pago,
      idResolucion: idResolucion ? Number(idResolucion) : null,
      idTecnologia: idTecnologia ? Number(idTecnologia) : null,
      espol: {
        nombre: espolNombre,
        ruc: espolRuc,
        correo: espolCorreo,
      },
      adminContrato: {
        correo: correoAdminCompleto,
        nombre: adminNombre,
        cedula: adminCedula,
        contacto: adminContacto,
      },
    };
  };

  // Efecto para imprimir el payload cuando cambien los valores
  useEffect(() => {
    console.log("Payload actual:", getCurrentData());
  }, [
    fechaInicio,
    fechaFin,
    tipo,
    nombre,
    monto,
    pago,
    idResolucion,
    idTecnologia,
    espolNombre,
    espolRuc,
    espolCorreo,
    adminCorreoLocal,
  ]);

  /* ---------------- Exponer validate() y getData() ---------------- */
  useImperativeHandle(ref, () => ({
    validate() {
      const correoAdminCompleto = adminCorreoLocal
        ? `${adminCorreoLocal}${adminCorreoDominio}`
        : "";

      const nuevo = {
        fechaInicio: !fechaInicio,
        fechaFin: !fechaFin,
        tipo: tipo.trim() === "",
        nombre: nombre.trim() === "",
        monto: monto === "" || isNaN(Number(monto)),
        idResolucion: !idResolucion,
        idTecnologia: !idTecnologia,
        espolNombre: espolNombre.trim() === "",
        espolRuc: !isRucLike(espolRuc),
        espolCorreo: !isEmail(espolCorreo),
        adminCorreoLocal: adminCorreoLocal.trim() === "",
      };
      setErrores(nuevo);

      const ok = !Object.values(nuevo).some(Boolean);
      return {
        valido: ok,
        data: ok
          ? {
              fechaInicio,
              fechaFin,
              tipo,
              nombre,
              monto: parseFloat(monto),
              Pago: pago,
              idResolucion: Number(idResolucion),
              idTecnologia: Number(idTecnologia),
              espol: {
                nombre: espolNombre,
                ruc: espolRuc,
                correo: espolCorreo,
              },
              adminContrato: {
                correo: correoAdminCompleto,
                nombre: adminNombre,
                cedula: adminCedula,
                contacto: adminContacto,
              },
            }
          : null,
      };
    },

    getData() {
      const correoAdminCompleto = adminCorreoLocal
        ? `${adminCorreoLocal}${adminCorreoDominio}`
        : "";

      return {
        fechaInicio,
        fechaFin,
        tipo,
        nombre,
        monto: monto === "" ? null : parseFloat(monto),
        Pago: pago,
        idResolucion: idResolucion ? Number(idResolucion) : null,
        idTecnologia: idTecnologia ? Number(idTecnologia) : null,
        espol: {
          nombre: espolNombre,
          ruc: espolRuc,
          correo: espolCorreo,
        },
        adminContrato: {
          correo: correoAdminCompleto,
          nombre: adminNombre,
          cedula: adminCedula,
          contacto: adminContacto,
        },
      };
    },
  }));

  /* ---------------- Helpers UI ---------------- */
  const selectedRes = resolucionesOpts.find(
    (o) => String(o.id) === String(idResolucion)
  );
  const selectedTec = techOpts.find(
    (o) => String(o.id) === String(idTecnologia)
  );

  return (
    <>
      {/* ======= BLOQUE: Información básica ======= */}
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

      {/* ======= BLOQUE: Asociación resolución / tecnología ======= */}
      <div className="formulario">
        <div className="form-header">
          <h1 className="titulo-principal-form">
            Asociación de resolución y tecnología
          </h1>
          <p className="subtitulo-form">
            Selecciona la resolución y la tecnología/know-how relacionadas a
            esta transferencia.
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

            {
              selectedRes && (
                <Components.Card
                  key={selectedRes.id}
                  titulo={selectedRes.codigo}
                  estado={selectedRes.estado}
                  descripcion={selectedRes.descripcion}
                  textoFecha={selectedRes.fecha}
                  textoRegistrado={selectedRes.usuario}
                  completed={selectedRes.completed}
                />
              )
            }
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

      {/* ======= BLOQUE: Datos de la ESPOL y del administrador ======= */}
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
    </>
  );
});

export default TTForm;
