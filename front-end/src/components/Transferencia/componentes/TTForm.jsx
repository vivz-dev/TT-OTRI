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

import DatosTransferencia from "./DatosTransferencia";
import AsociarResolucionTecnologia from "./AsociarResolucionTecnologia";
import DatosEspol from "./DatosEspol";

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
  const [datosAdicionales, setDatosAdicionales] = useState({});

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
        titulo: r.codigo || "Sin título",
        descripcion: r.descripcion || "Sin descripción",
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
      <DatosTransferencia
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        tipo={tipo}
        setTipo={setTipo}
        nombre={nombre}
        setNombre={setNombre}
        monto={monto}
        setMonto={setMonto}
        pago={pago}
        setPago={setPago}
        errores={errores}
        shakeError={shakeError}
        datosAdicionales={datosAdicionales}
        setDatosAdicionales={setDatosAdicionales}
      />

      <AsociarResolucionTecnologia
        idResolucion={idResolucion}
        setIdResolucion={setIdResolucion}
        idTecnologia={idTecnologia}
        setIdTecnologia={setIdTecnologia}
        resolucionesOpts={resolucionesOpts}
        techOpts={techOpts}
        isLoading={isLoading}
        error={error}
        isTechLoading={isTechLoading}
        techError={techError}
        selectedRes={selectedRes}
        selectedTec={selectedTec}
        errores={errores}
        shakeError={shakeError}
      />

      <DatosEspol
        espolNombre={espolNombre}
        setEspolNombre={setEspolNombre}
        espolRuc={espolRuc}
        setEspolRuc={setEspolRuc}
        espolCorreo={espolCorreo}
        setEspolCorreo={setEspolCorreo}
        adminCorreoLocal={adminCorreoLocal}
        setAdminCorreoLocal={setAdminCorreoLocal}
        adminCorreoDominio={adminCorreoDominio}
        adminNombre={adminNombre}
        adminCedula={adminCedula}
        adminContacto={adminContacto}
        errores={errores}
        shakeError={shakeError}
      />
    </>
  );
});

export default TTForm;
