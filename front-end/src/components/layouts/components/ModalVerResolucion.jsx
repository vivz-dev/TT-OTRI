// src/pages/layouts/components/ModalVerResolucion.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./ModalVerResolucion.css";

import { useGetDistributionsByResolutionQuery } from "../../../services/distribucionesApi";
import { useGetAllDistribBenefInstitucionesQuery } from "../../../services/distribBenefInstitucionesApi";
import { useGetBenefInstitucionesQuery } from "../../../services/benefInstitucionesApi";
import * as Buttons from "../buttons/buttons_index"

// RTK Query – archivos por entidad (lazy)
import { useLazyGetArchivosByEntidadQuery } from "../../../services/storage/archivosApi";

import Tag from "./Tag";
import { User, CalendarCheck, FileText } from "lucide-react";
import { getPersonaNameById } from "../../../services/espolUsers";
import { LuClockAlert } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

const ENTIDAD_RESOLUCION = "R"; // Tipo de entidad para Resolución

// 🔹 Función auxiliar para truncar el nombre del archivo
const formatFileName = (nombre) => {
  if (!nombre) return "Sin archivo cargado";
  // buscamos la extensión (ej. .pdf)
  const parts = nombre.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  const base = parts.join("."); // nombre sin extensión
  const truncated = base.length > 20 ? base.substring(0, 20) + "..." : base;
  return `${truncated}${ext ? "." + ext : ""}`;
};

const porcentajeTo100 = (valor) =>
  typeof valor === "number" ? valor * 100 : 0;
const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const ModalVerResolucion = ({ item, onClose }) => {
  const textoRegistrado = item?.usuario ?? "";

  const iconoExtra = item?.completed ? (
    <FaCheckCircle size={30} color="#6edc68" title="Completo" />
  ) : (
    <LuClockAlert size={30} color="#909090ff" title="Incompleto" />
  );

  const [nombrePersona, setNombrePersona] = useState(
    textoRegistrado || "Usuario no disponible"
  );

  useEffect(() => {
    const fetchPersonaName = async () => {
      const id = parseInt(textoRegistrado);
      if (!isNaN(id) && id > 0) {
        try {
          const nombre = await getPersonaNameById(id);
          setNombrePersona(nombre);
        } catch {
          setNombrePersona(textoRegistrado || "Usuario no disponible");
        }
      } else {
        setNombrePersona(textoRegistrado || "Usuario no disponible");
      }
    };
    fetchPersonaName();
  }, [textoRegistrado]);

  // Derivar id de resolución
  const idResolucion =
    item?.id ?? item?.Id ?? item?.idResolucion ?? item?.IdResolucion;

  // Distribuciones
  const {
    data: distribs = [],
    isLoading: distLoading,
    isFetching: distFetching,
    error: distError,
  } = useGetDistributionsByResolutionQuery(idResolucion, {
    skip: !idResolucion,
  });

  // Beneficiarios institucionales
  const { data: allBenefs = [] } = useGetAllDistribBenefInstitucionesQuery();
  const { data: instituciones = [] } = useGetBenefInstitucionesQuery();

  // Mapa id -> nombre institución
  const nameById = useMemo(() => {
    const pairs = (instituciones || []).map((b) => [
      b.id ?? b.Id ?? b.idBenefInstitucion ?? b.IdBenefInstitucion,
      b.nombre ?? b.Nombre ?? b.descripcion ?? "—",
    ]);
    return Object.fromEntries(pairs);
  }, [instituciones]);

  // Agrupar beneficiarios por distribución
  const benefsByDistrib = useMemo(() => {
    const map = new Map();
    for (const b of allBenefs || []) {
      const distId =
        b.IdDistribucionResolucion ??
        b.idDistribucionResolucion ??
        b.DistribucionId ??
        b.distribucionId;
      if (!distId) continue;
      if (!map.has(distId)) map.set(distId, []);
      map.get(distId).push(b);
    }
    return map;
  }, [allBenefs]);

  // Escape + bloqueo scroll
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // ───────────── Archivos ─────────────
  const [triggerGetArchivosByEntidad] = useLazyGetArchivosByEntidadQuery();
  const [loadingArchivoRes, setLoadingArchivoRes] = useState(false);
  const [archivoResolucion, setArchivoResolucion] = useState(null);

  // ⬇️ Buscar archivo apenas se abre el modal
  useEffect(() => {
    const fetchArchivos = async () => {
      if (!idResolucion) return;
      setLoadingArchivoRes(true);
      try {
        const res = await triggerGetArchivosByEntidad({
          idTEntidad: idResolucion,
          tipoEntidad: ENTIDAD_RESOLUCION,
        }).unwrap();

        const archivos = Array.isArray(res) ? res : [];
        if (archivos.length > 0) {
          const a0 = archivos[0] || {};
          const url = a0.url || a0.downloadUrl || a0.publicUrl || a0.fileUrl;
          const nombre = a0.nombre || a0.Nombre || "Documento sin nombre";
          setArchivoResolucion({ url, nombre });
        }
      } catch (err) {
        console.error("Error al cargar archivos:", err);
      } finally {
        setLoadingArchivoRes(false);
      }
    };
    fetchArchivos();
  }, [idResolucion, triggerGetArchivosByEntidad]);

  // ⬇️ Solo abre el archivo (ya cargado en estado)
  const handleOpenArchivoResolucion = useCallback(() => {
    if (!archivoResolucion?.url) {
      alert("El archivo no tiene URL disponible.");
      return;
    }
    window.open(archivoResolucion.url, "_blank", "noopener,noreferrer");
  }, [archivoResolucion]);

  if (!item) return null;

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otri-modal-container">
          <section className="otri-modal-body distribucion-body">
            <div className="distribucion-section">
              <div className="form-header">
                <h1 className="titulo-principal-form">
                  Datos de la resolución
                </h1>
              </div>
              <div className="form-fieldsets">
                <div className="form-card resolucion-card">
                  <div className="information-row">
                    <h2
                      className="form-card-header"
                      style={{ textAlign: "center", marginBottom: "0" }}
                    >
                      Resolución No. {item.titulo || "-"}
                    </h2>
                  </div>

                  <div className="input-row">
                    <div className="form-card information-card">
                      <div className="information-row">
                        <label className="information-row-title">
                          Descripción:
                        </label>
                        <label>{item.descripcion || "No hay datos"}</label>
                      </div>
                    </div>
                  </div>

                  <div className="information-input-row">
                    <div className="item-wrapper">
                      <CalendarCheck
                        size={30}
                        color="var(--esp-azul-institucional)"
                      />
                      <div className="information-row">
                        <label className="information-row-title">
                          Fecha de resolución:
                        </label>
                        <label>{fmtFecha(item.fechaResolucion)}</label>
                      </div>
                    </div>
                    <div className="item-wrapper">
                      <CalendarCheck
                        size={30}
                        color="var(--esp-azul-institucional)"
                      />
                      <div className="information-row">
                        <label className="information-row-title">
                          Fecha de vigencia:
                        </label>
                        <label>{fmtFecha(item.fechaVigencia)}</label>
                      </div>
                    </div>
                  </div>

                  <div className="information-input-row">
                    <div className="item-wrapper">
                      <div className="information-row">
                        <label
                          className="information-row-title"
                          style={{ textAlign: "center" }}
                        >
                          Estado
                        </label>
                        <Tag estado={item.estado} />
                      </div>
                    </div>
                    <div className="item-wrapper">
                      {iconoExtra}
                      <div className="information-row">
                        <label className="information-row-title">
                          Completo
                        </label>
                        {item?.completed ? "Sí" : "No"}
                      </div>
                    </div>
                  </div>

                  <div className="information-input-row">
                    <div className="item-wrapper">
                      <User size={30} />
                      <div className="information-row">
                        <label className="information-row-title">
                          Registrado por:
                        </label>
                        <span>{nombrePersona}</span>
                      </div>
                    </div>

                    <div className="item-wrapper">
                      <button
                        className="btn-add-archivo"
                        onClick={handleOpenArchivoResolucion}
                        disabled={loadingArchivoRes || !archivoResolucion}
                        title={
                          loadingArchivoRes
                            ? "Buscando archivo…"
                            : "Abrir documento de la resolución"
                        }
                      >
                        <FileText />
                      </button>
                      <div className="information-row">
                        <label className="information-row-title">
                          Documento adjunto:
                        </label>
                        <label>
                          {formatFileName(archivoResolucion?.nombre) ||
                            "Sin archivo cargado"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución de beneficios */}
            <div className="distribucion-section">
              <div className="form-header">
                <h1 className="titulo-principal-form">
                  Distribución de beneficios económicos
                </h1>
              </div>
              <div className="form-fieldsets">
                {distLoading || distFetching ? (
                  <p>Cargando distribuciones…</p>
                ) : distError ? (
                  <p>Error al cargar distribuciones</p>
                ) : distribs.length === 0 ? (
                  <i>Sin distribuciones</i>
                ) : (
                  distribs.map((d, i) => {
                    const idDist =
                      d.id ?? d.Id ?? d.idDistribucion ?? d.IdDistribucion;
                    const bene = benefsByDistrib.get(idDist) || [];
                    return (
                      <div
                        key={idDist ?? i}
                        className="form-card resolucion-card"
                      >
                        <table className="tabla-distribucion">
                          <thead>
                            <tr>
                              <th colSpan={4} className="beneficiarios">
                                Listado de beneficiarios
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="autor-name">
                              <td className="nombre-col">
                                Autores/Inventores beneficiarios
                              </td>
                              <td className="input-col">
                                <label className="input-group tecnologia-name">
                                  {porcentajeTo100(d.porcSubtotalAutores) ?? 0} %
                                </label>
                              </td>
                            </tr>

                            <tr className="fila-subtotal">
                              <td>Subtotal de autores/inventores beneficiarios</td>
                              <td className="subtotal" colSpan={3}>
                                <label className="input-group porcentaje-total">
                                  {porcentajeTo100(d.porcSubtotalAutores) ?? 0} %
                                </label>
                              </td>
                            </tr>

                            {bene.map((b, j) => {
                              const idB =
                                b.IdBenefInstitucion ??
                                b.idBenefInstitucion ??
                                b.BenefInstitucionId ??
                                b.benefInstitucionId;
                              const nombre =
                                nameById[idB] ?? `Institución ${idB ?? "—"}`;
                              const porcentaje = b.Porcentaje ?? b.porcentaje ?? 0;

                              return (
                                <tr key={`${idB ?? j}`} className="autor-name">
                                  <td className="nombre-col">{nombre}</td>
                                  <td className="input-col">
                                    <label className="input-group tecnologia-name">
                                      {porcentajeTo100(porcentaje)} %
                                    </label>
                                  </td>
                                </tr>
                              );
                            })}

                            <tr className="fila-subtotal">
                              <td>Subtotal de beneficiarios institucionales</td>
                              <td className="subtotal" colSpan={3}>
                                <label className="input-group tecnologia-name porcentaje-total">
                                  {porcentajeTo100(d.porcSubtotalInstitut) ?? 0} %
                                </label>
                              </td>
                            </tr>
                          </tbody>

                          <tfoot>
                            <tr className="fila-subtotal-titulo">
                              <td className="">Porcentaje total</td>
                              <td colSpan={3}>
                                <label className="input-group tecnologia-name porcentaje-total">
                                  {porcentajeTo100(
                                    d.porcSubtotalAutores + d.porcSubtotalInstitut
                                  )} %
                                </label>
                              </td>
                            </tr>
                          </tfoot>

                        </table>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <footer className="otri-modal-footer">
            <Buttons.RegisterButton
            onClick={onClose}
            text={"Cerrar"}
            />
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ModalVerResolucion;
