// src/pages/layouts/components/VerProtecciones.jsx
import React, { useCallback } from "react";
import { FileText } from "lucide-react";
import { Lock, CalendarCheck } from "lucide-react";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const formatFileName = (nombre) => {
  if (!nombre) return "Sin archivo cargado";
  const parts = String(nombre).split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  const base = parts.join(".");
  const truncated = base.length > 20 ? base.substring(0, 20) + "..." : base;
  return `${truncated}${ext ? "." + ext : ""}`;
};

const VerProtecciones = ({
  protecciones = [],
  isLoading = false,
  onOpenArchivo, // opcional; si no llega, usamos window.open
}) => {
  // fallback para abrir archivos si el padre no provee callback
  const openArchivo = useCallback(
    (url) => {
      const finalUrl = url || "";
      if (!finalUrl) {
        alert("El archivo no tiene URL disponible.");
        return;
      }
      if (typeof onOpenArchivo === "function") {
        onOpenArchivo(finalUrl);
      } else {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      }
    },
    [onOpenArchivo]
  );

  return (
    <div className="distribucion-section">
      <div className="form-header">
        <h1 className="titulo-principal-form">Protecciones</h1>
      </div>

      <div className="form-fieldsets">
        {isLoading ? (
          <p>Cargando protecciones.</p>
        ) : (protecciones?.length ?? 0) === 0 ? (
          <p>Sin protecciones registradas.</p>
        ) : (
          (protecciones ?? []).map((p) => (
            <div className="form-card resolucion-card">
              <div className="information-input-row">
                <div className="item-wrapper">
                  <Lock size={30} color="var(--esp-azul-institucional)" />
                  <div className="information-row">
                    <label className="information-row-title">
                      Tipo de protección:
                    </label>
                    <span>{p?.tipoProteccion?.nombre || "No hay datos"}</span>
                  </div>
                </div>
              </div>

              <div className="information-input-row">
                {/* Solicitud */}
                <div className="item-wrapper">
                  <CalendarCheck
                    size={30}
                    color="var(--esp-azul-institucional)"
                  />
                  <div className="information-row">
                    <label className="information-row-title">
                      Fecha de solicitud:
                    </label>
                    <label>
                      {p?.solicitud
                        ? isLoading
                          ? " Cargando..."
                          : ` ${fmtFecha(p?.fechaSolicitud)}`
                        : null}
                    </label>
                  </div>
                </div>

                {/* Concesión */}
                {p?.concesion ? (
                  isLoading ? (
                    "Cargando..."
                  ) : (
                    <div className="item-wrapper">
                      <CalendarCheck
                        size={30}
                        color="var(--esp-azul-institucional)"
                      />
                      <div className="information-row">
                        <label className="information-row-title">
                          Fecha de concesión:
                        </label>
                        <label>
                          {p?.concesion
                            ? isLoading
                              ? " Cargando..."
                              : ` ${fmtFecha(p?.fechaConcesion)}`
                            : null}
                        </label>
                      </div>
                    </div>
                  )
                ) : (
                  <></>
                )}
              </div>

              {/* Archivos */}
              <div className="input-row">
                <div className="form-card information-card">
                  <div className="information-row parrafo-container">
                    <label className="information-row-title">
                      Documentos adjuntos:
                    </label>
                    {(p?.archivos ?? []).map((f, idx) => {
                      const fileUrl =
                        f?.url ||
                        f?.downloadUrl ||
                        f?.publicUrl ||
                        f?.fileUrl ||
                        "";
                      const hasUrl = Boolean(fileUrl);
                      return (
                        <div
                          className="item-wrapper"
                          key={f?.id ?? `${p?.id}-file-${idx}`}
                        >
                          <button
                            className="btn-add-archivo"
                            onClick={() => openArchivo(fileUrl)}
                            disabled={!hasUrl}
                            title={
                              hasUrl
                                ? "Abrir documento de la protección"
                                : "Sin URL disponible"
                            }
                          >
                            <FileText />
                          </button>
                          <label>{formatFileName(f?.nombre)}</label>
                        </div>
                      );
                    })}
                    {(p?.archivos?.length ?? 0) === 0 && <span>—</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VerProtecciones;
