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
import { getIdPersonaFromAppJwt } from "../../../services/api";

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

const toNumOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ==============================
// NUEVO: helper para mapear regalías
// ==============================
function mapLicenciamiento(datosAdicionales) {
  const da = datosAdicionales || {};
  const lic = { ...da };

  if (da.tieneRegalias === true) {
    const tipo = da.regaliasTipo; // "unidad" | "porcentaje"
    const esPorUnidad = tipo === "unidad";
    const esPorcentaje = tipo === "porcentaje";
    const val = da.regaliasValor; // ya normalizado: número; si porcentaje, viene en 0-1

    const cantidadUnidad =
      esPorUnidad && val != null && !Number.isNaN(Number(val))
        ? Number(val)
        : null;

    const cantidadPorcentaje =
      esPorcentaje && val != null && !Number.isNaN(Number(val))
        ? Number(val)
        : null;

    lic.regalias = {
      cantidadUnidad,
      cantidadPorcentaje,
      esPorUnidad,
      esPorcentaje,
    };
  }

  return lic;
}

const TTForm = forwardRef(({ shakeError }, ref) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState(""); // "" | number (1=Licencia, 2=Cesión)
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [pago, setPago] = useState(false);
  const [datosAdicionales, setDatosAdicionales] = useState({});
  const [plazoDias, setPlazoDias] = useState("");

  const [idPersona, setIdPersona] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const id = await getIdPersonaFromAppJwt();
        if (Number.isFinite(Number(id))) setIdPersona(Number(id));
      } catch (e) {
        console.warn("[TTForm] No se pudo obtener idPersona desde AppJwt:", e);
      }
    })();
  }, []);

  const [idResolucion, setIdResolucion] = useState("");
  const [idTecnologia, setIdTecnologia] = useState("");

  const { data: resolutions = [], isLoading, error } = useGetResolutionsQuery();
  const resolucionesOpts = useMemo(() => {
    if (error || !resolutions) return [];
    return resolutions
      .filter(
        (r) =>
          r.completed === true &&
          (r.estado === "Vigente" || r.estado === "V")
      )
      .map((r) => ({
        id: r.id,
        label: `Resolución No. ${r.codigo ?? "Sin código"}`,
        estado: r.estado,
        completed: r.completed,
        titulo: r.titulo || "Sin título",
        descripcion: r.codigo || "Sin descripción",
        fecha: fmtFecha(r.fechaResolucion),
        usuario: r.idUsuario || "Usuario no disponible",
      }));
  }, [resolutions, error]);

  const {
    data: technologiesData = [],
    isLoading: isTechLoading,
    error: techError,
  } = useGetTechnologiesQuery();

  const techOpts = useMemo(() => {
    if (!technologiesData || technologiesData.length === 0) return [];
    return technologiesData
      .filter(
        (t) =>
          t.completed === true && (t.estado === "Disponible" || t.estado === "V")
      )
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

  const [espolNombre, setEspolNombre] = useState("");
  const [espolRuc, setEspolRuc] = useState("");
  const [espolCorreo, setEspolCorreo] = useState("");

  const [adminCorreoLocal, setAdminCorreoLocal] = useState("");
  const adminCorreoDominio = "@espol.edu.ec";
  const adminNombre = "Viviana Yolanda Vera Falconí";
  const adminCedula = "0930455694";
  const adminContacto = "0958798761";

  const [errores, setErrores] = useState({
    fechaInicio: false,
    fechaFin: false,
    tipo: false,
    nombre: false,
    monto: false,
    idResolucion: false,
    idTecnologia: false,
    idDistribucion: false, // 👈 nuevo
    espolNombre: false,
    espolRuc: false,
    espolCorreo: false,
    adminCorreoLocal: false,
  });

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isRucLike = (v) => /^[0-9]{10,13}$/.test(v.replace(/\D/g, ""));

  const idtipoTransferencia = toNumOrNull(tipo);
  const isLicencia = idtipoTransferencia === 1;
  const isCesion = idtipoTransferencia === 2;

  const normIdResol = () => {
    const n = Number(idResolucion);
    return Number.isFinite(n) ? n : null;
    };
  const normIdTec = () => {
    const n = Number(idTecnologia);
    return Number.isFinite(n) ? n : null;
  };

  const getCurrentData = () => {
    const correoAdminCompleto = adminCorreoLocal
      ? `${adminCorreoLocal}${adminCorreoDominio}`
      : "";

    const _idResol = normIdResol();
    const _idTec = normIdTec();

    const base = {
      fechaInicio,
      fechaFin,
      tipo: idtipoTransferencia,
      titulo: nombre,
      nombre,
      monto: monto === "" ? null : parseFloat(monto),
      Pago: pago,

      // ✅ Solo ids
      idResolucion: _idResol,
      idTecnologia: _idTec,
      idDistribucion: datosAdicionales?.idDistribucion ?? null,

      idPersona: idPersona ?? null,
      completado: true,
      estado: "V",
      plazo: plazoDias ? Number(plazoDias) : null,

      tipoTransferTecno: {
        idtipoTransferencia,
      },

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

    if (isLicencia) {
      // ✅ licenciamiento con regalias mapeadas
      base.licenciamiento = mapLicenciamiento(datosAdicionales || {});
    } else if (isCesion) {
      base.cesion = {
        fechaLimite: datosAdicionales?.fechaLimite ?? null,
      };
    }

    return base;
  };

  useImperativeHandle(ref, () => ({
    validate() {
      const correoAdminCompleto = adminCorreoLocal
        ? `${adminCorreoLocal}${adminCorreoDominio}`
        : "";

      const nuevo = {
        fechaInicio: !fechaInicio,
        fechaFin: !fechaFin,
        tipo: !Number.isFinite(Number(idtipoTransferencia)),
        nombre: String(nombre).trim() === "",
        monto: monto === "" || isNaN(Number(monto)),
        idResolucion: !normIdResol(),
        idTecnologia: !normIdTec(),
        idDistribucion: !(datosAdicionales?.idDistribucion != null),
        espolNombre: String(espolNombre).trim() === "",
        espolRuc: !isRucLike(espolRuc),
        espolCorreo: !isEmail(espolCorreo),
        adminCorreoLocal: String(adminCorreoLocal).trim() === "",
      };
      setErrores(nuevo);

      const ok = !Object.values(nuevo).some(Boolean);
      if (!ok) return { valido: false, data: null };

      const _idResol = normIdResol();
      const _idTec = normIdTec();

      const data = {
        fechaInicio,
        fechaFin,
        tipo: idtipoTransferencia,
        nombre,
        titulo: nombre,
        monto: parseFloat(monto),
        Pago: pago,

        // ✅ Solo ids
        idResolucion: _idResol,
        idTecnologia: _idTec,
        idDistribucion: datosAdicionales?.idDistribucion ?? null,

        idPersona: idPersona ?? null,
        completado: true,
        estado: "V",
        plazo: plazoDias ? Number(plazoDias) : null,

        tipoTransferTecno: {
          idtipoTransferencia,
        },

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

      if (isLicencia) {
        // ✅ licenciamiento con regalias mapeadas
        data.licenciamiento = mapLicenciamiento(datosAdicionales || {});
      } else if (isCesion) {
        data.cesion = {
          fechaLimite: datosAdicionales?.fechaLimite ?? null,
        };
      }

      return { valido: true, data };
    },

    getData() {
      return getCurrentData();
    },
  }));

  const selectedRes = resolucionesOpts.find(
    (o) => String(o.id) === String(idResolucion)
  );
  const selectedTec = techOpts.find(
    (o) => String(o.id) === String(idTecnologia)
  );

  return (
    <div className="separate-card">
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
        // 👇 pasar datosAdicionales para manejar idDistribucion
        datosAdicionales={datosAdicionales}
        setDatosAdicionales={setDatosAdicionales}
      />

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
        plazoDias={plazoDias}
        setPlazoDias={setPlazoDias}
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
    </div>
  );
});

export default TTForm;
