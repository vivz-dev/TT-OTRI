// src/pages/layouts/components/tecnologia/DatosTecnologia.jsx
import React, { useEffect, useState } from "react";
import Tag from "../Tag";
import { User, CalendarCheck } from "lucide-react";
import { getPersonaNameById } from "../../../../services/espolUsers";
import { LuClockAlert } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

// Helpers locales (aislados en el hijo)
const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const mapEstado = (c) => {
  if (c === "D") return "Disponible";
  if (c === "N") return "No Disponible";
  return String(c ?? "");
};

/**
 * Renderiza "Datos de la tecnología" EXACTAMENTE como en tu diseño original.
 * Props:
 *  - tec: objeto data?.tecnologia (o null)
 *  - isLoading: boolean
 *  - error: cualquier valor de error para mostrar "No se pudo cargar" en el título
 */
const DatosTecnologia = ({ tec, isLoading, error }) => {
  const [nombrePersona, setNombrePersona] = useState("Usuario no disponible");

  // Carga del nombre del registrador (idPersona) – aislado aquí
  useEffect(() => {
    const idPersona = tec?.idPersona;
    const fetchPersonaName = async () => {
      const id = Number(idPersona);
      if (!Number.isFinite(id) || id <= 0) {
        setNombrePersona("Usuario no disponible");
        return;
      }
      try {
        const nombre = await getPersonaNameById(id);
        setNombrePersona(nombre || "Usuario no disponible");
      } catch {
        setNombrePersona("Usuario no disponible");
      }
    };
    if (idPersona != null) fetchPersonaName();
  }, [tec?.idPersona]);

  const iconoExtra = tec?.completado ? (
    <FaCheckCircle size={30} color="#6edc68" title="Completo" />
  ) : (
    <LuClockAlert size={30} color="#909090ff" title="Incompleto" />
  );

  return (
    <div className="distribucion-section">
      <div className="form-header">
        <h1 className="titulo-principal-form">
          Datos de la tecnología/<em>know-how</em>
        </h1>
      </div>

      <div className="form-fieldsets">
        <div className="form-card resolucion-card">
          {/* Título */}
          <div className="information-row parrafo-container">
            <h2
              className="form-card-header"
              style={{ textAlign: "center", marginBottom: "0" }}
            >
              {isLoading
                ? "Cargando..."
                : error
                ? "No se pudo cargar"
                : tec?.titulo || "No hay título"}
            </h2>
          </div>

          {/* Descripción */}
          <div className="input-row">
            <div className="form-card information-card">
              <div className="information-row parrafo-container">
                <label className="information-row-title">
                  Descripción:
                </label>
                <label>
                  {isLoading
                    ? "Cargando..."
                    : error
                    ? "No hay datos"
                    : tec?.descripcion || "No hay datos"}
                </label>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="information-input-row">
            <div className="item-wrapper">
              <CalendarCheck
                size={30}
                color="var(--esp-azul-institucional)"
              />
              <div className="information-row">
                <label className="information-row-title">
                  Fecha de registro:
                </label>
                <label>
                  {isLoading
                    ? "Cargando..."
                    : fmtFecha(tec?.fechaCreacion)}
                </label>
              </div>
            </div>
            <div className="item-wrapper">
              <CalendarCheck
                size={30}
                color="var(--esp-azul-institucional)"
              />
              <div className="information-row">
                <label className="information-row-title">
                  Fecha de último cambio:
                </label>
                <label>
                  {isLoading
                    ? "Cargando..."
                    : fmtFecha(tec?.ultimoCambio)}
                </label>
              </div>
            </div>
          </div>

          {/* Estado y Completado */}
          <div className="information-input-row">
            <div className="item-wrapper">
              <div className="information-row">
                <label
                  className="information-row-title"
                  style={{ textAlign: "center" }}
                >
                  Estado
                </label>
                {!isLoading && tec ? (
                  <Tag estado={mapEstado(tec?.estado)} />
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <div className="item-wrapper">
              {iconoExtra}
              <div className="information-row">
                <label className="information-row-title">
                  Completo
                </label>
                {isLoading
                  ? "Cargando..."
                  : tec?.completado
                  ? "Sí"
                  : "No"}
              </div>
            </div>
          </div>

          {/* Registrado por */}
          <div className="information-input-row">
            <div className="item-wrapper">
              <User size={30} />
              <div className="information-row">
                <label className="information-row-title">
                  Registrado por:
                </label>
                <span>{isLoading ? "Cargando..." : nombrePersona}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosTecnologia;
