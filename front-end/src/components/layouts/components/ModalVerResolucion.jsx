// src/pages/layouts/components/ModalVerResolucion.jsx
import React, { useEffect, useState, useMemo } from "react";
import "./ModalVerResolucion.css";

import { useGetDistributionsByResolutionQuery } from "../../../services/distribucionesApi";
import { useGetAllDistribBenefInstitucionesQuery } from "../../../services/distribBenefInstitucionesApi";
import { useGetBenefInstitucionesQuery } from "../../../services/benefInstitucionesApi";

import Tag from "./Tag";
import { Lock, User, CalendarCheck } from "lucide-react";
import { getPersonaNameById } from "../../../services/espolUsers";
import CardStatus from "./CardStatus";
import { LuClockAlert } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

const pct = (x) => {
  const n = Number(x);
  if (!Number.isFinite(n)) return "0.00%";
  return (n * 100).toFixed(2) + "%";
};

const ModalVerResolucion = ({ item, onClose }) => {
  // ← NUEVO: base para el hook de nombre de persona
  const textoRegistrado = item?.usuario ?? "";

  const iconoExtra = item.completed ? (
    <FaCheckCircle color="#6edc68" title="Completo" />
  ) : (
    <LuClockAlert color="#909090ff" title="Incompleto" />
  );

  const [nombrePersona, setNombrePersona] = useState(
    textoRegistrado || "Usuario no disponible"
  );

  // ← NUEVO: resolver nombre desde id si corresponde
  useEffect(() => {
    const fetchPersonaName = async () => {
      const id = parseInt(textoRegistrado);
      if (!isNaN(id) && id > 0) {
        try {
          const nombre = await getPersonaNameById(id);
          setNombrePersona(nombre);
        } catch (error) {
          console.error("Error al obtener nombre de persona:", error);
          setNombrePersona(textoRegistrado || "Usuario no disponible");
        }
      } else {
        setNombrePersona(textoRegistrado || "Usuario no disponible");
      }
    };

    fetchPersonaName();
  }, [textoRegistrado]);

  console.log("ModalVerResolucion item:", item);
  const idResolucion =
    item?.id ?? item?.Id ?? item?.idResolucion ?? item?.IdResolucion;

  // 1) Distribuciones de la resolución
  const {
    data: distribs = [],
    isLoading: distLoading,
    isFetching: distFetching,
    error: distError,
  } = useGetDistributionsByResolutionQuery(idResolucion, {
    skip: !idResolucion,
  });

  console.log("Distribuciones", distribs);

  // 2) Beneficiarios institucionales
  const {
    data: allBenefs = [],
    isLoading: benLoading,
    isFetching: benFetching,
    error: benError,
  } = useGetAllDistribBenefInstitucionesQuery();

  // 3) Catálogo de instituciones
  const {
    data: instituciones = [],
    isLoading: instLoading,
    isFetching: instFetching,
    error: instError,
  } = useGetBenefInstitucionesQuery();

  // 4) Mapa id -> nombre institución
  const nameById = useMemo(() => {
    const pairs = (instituciones || []).map((b) => [
      b.id ?? b.Id ?? b.idBenefInstitucion ?? b.IdBenefInstitucion,
      b.nombre ?? b.Nombre ?? b.descripcion ?? "—",
    ]);
    return Object.fromEntries(pairs);
  }, [instituciones]);

  // 5) Agrupar beneficiarios por distribución
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

  console.log("benfs", benefsByDistrib);

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

  const anyLoading =
    distLoading ||
    distFetching ||
    benLoading ||
    benFetching ||
    instLoading ||
    instFetching;
  const anyError = distError || benError || instError;
  if (!item) return null;

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={(e) => e.stopPropagation()}>
        <section className="otri-modal-body">
          {/* Cabecera */}
          <div className="form-header">
            <h1 className="titulo-principal-form">Datos de la resolución</h1>
          </div>
          <div className="form-fieldsets">
            <div className={`form-card resolucion-card`}>
              <div className="input-row">
                <label className="input-group">
                  Número
                  <input
                    type="text"
                    placeholder={item.titulo || "-"}
                    disabled
                  />
                </label>
              </div>

              <div className="input-row">
                <label className="input-group">
                  Fecha de resolución
                  <input
                    type="text"
                    placeholder={item.fecha || "No hay datos"}
                    disabled
                  />
                </label>
              </div>

              <div className="input-row">
                <label className="input-group">
                  Fecha de vigencia
                  <input
                    type="text"
                    placeholder={item.fechaVigencia || "No hay datos"}
                    disabled
                  />
                </label>
              </div>

              <div className="input-row">
                <label className="input-group">
                  Descripción
                  <textarea
                    placeholder={item.descripcion || "No hay datos"}
                    disabled
                  />
                </label>
              </div>

              <div className="input-row">
                <label className="input-group">
                  Registrado por
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <User size={16} />
                    <span>{nombrePersona}</span>
                  </div>
                </label>
              </div>

              <div className="input-row">
                <label className="input-group">
                  Estado
                  <Tag estado={item.estado} />
                </label>

                <label className="input-group">
                  Completado
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {item.completed ? "Sí" : "No"}
                    <div className="tooltip-wrapper">
                      {iconoExtra}
                      <span className="tooltip-text">
                        {item.completed
                          ? "El registro de este documento está completo."
                          : "Faltan datos para terminar de registrar este documento."}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-header">
            <h1 className="titulo-principal-form">
              Distribución de beneficios económicos
            </h1>
          </div>

          <div className="form-fieldsets">
            {anyLoading ? (
              <p>Cargando distribuciones y beneficiarios…</p>
            ) : anyError ? (
              <p>Ocurrió un error cargando información.</p>
            ) : distribs.length === 0 ? (
              <i>Sin distribuciones</i>
            ) : (
              <></>
            )}

            {distribs.map((d) => {
              const total = d.porcSubtotalAutores + d.porcSubtotalInstitut;
              const totalClass = total === 100 ? "total-ok" : "total-error";

              const idDist =
                d.id ?? d.Id ?? d.idDistribucion ?? d.IdDistribucion;
              const bene = benefsByDistrib.get(idDist) || [];
              return (
                <>
                  <div className={`form-card resolucion-card`}>
                    <div className="input-row">
                      <label className="input-group">
                        Monto desde
                        <input
                          type="text"
                          placeholder={d.MontoMinimo || "No hay datos"}
                          disabled
                        />
                      </label>

                      <label className="input-group">
                        Monto hasta
                        <input
                          type="text"
                          placeholder={d.MontoMaximo || "No hay datos"}
                          disabled
                        />
                      </label>
                    </div>

                    <table className="tabla-distribucion">
                      <thead>
                        <tr>
                          <th colSpan={4} className="beneficiarios">
                            Listado de beneficiarios
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td className="nombre-col">
                            Autores/Inventores beneficiarios
                          </td>
                          <td className="input-col">
                            <label className="input-group">
                              {`${d.porcSubtotalAutores} %` || "No hay datos"}
                            </label>
                          </td>
                        </tr>

                        <tr className="fila-subtotal">
                          <td>Subtotal de autores/inventores beneficiarios</td>
                          <td className="subtotal" colSpan={3}>
                            <label className="input-group">
                              {`${d.porcSubtotalAutores} %` || "No hay datos"}
                            </label>
                          </td>
                        </tr>

                        {bene.map((b) => {
                          const idB =
                            b.IdBenefInstitucion ??
                            b.idBenefInstitucion ??
                            b.BenefInstitucionId ??
                            b.benefInstitucionId;
                          const nombre =
                            nameById[idB] ?? `Institución ${idB ?? "—"}`;
                          const porcentaje = b.Porcentaje ?? b.porcentaje ?? 0;

                          return (
                            <>
                              <tr key={nombre}>
                                <td className="nombre-col">{nombre}</td>

                                <td className="input-col">
                                  <label className="input-group">
                                    {`${porcentaje} %` || "No hay datos"}
                                  </label>
                                </td>
                              </tr>
                            </>
                          );
                        })}
                        <tr className="fila-subtotal">
                          <td>Subtotal de beneficiarios institucionales</td>
                          <td className="subtotal" colSpan={3}>
                            <label className="input-group">
                              {`${d.porcSubtotalInstitut} %` || "No hay datos"}
                            </label>
                          </td>
                        </tr>
                      </tbody>

                      <tfoot>
                        <tr>
                          <td className="total-label">Porcentaje total</td>
                          <td
                            className={`total-valor ${totalClass}`}
                            colSpan={3}
                          >
                            {d.porcSubtotalAutores + d.porcSubtotalInstitut} %
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              );
            })}
          </div>
        </section>

        <footer className="otri-modal-footer">
          <button onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default ModalVerResolucion;
