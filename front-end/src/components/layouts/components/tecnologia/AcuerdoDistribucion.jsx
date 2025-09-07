// src/pages/layouts/components/tecnologia/AcuerdoDistribucion.jsx
import React, { useCallback } from "react";
import { CalendarCheck, FileText } from "lucide-react";

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

const toPct = (v) => {
  const num = Number(v ?? 0) * 100;
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
};

const AcuerdoDistribucion = ({
  acuerdoDistribucion = null,
  isLoading = false,
  onOpenArchivo, // opcional; si no llega, usamos window.open
}) => {
  const archivos = acuerdoDistribucion?.archivos ?? [];
  const autores = acuerdoDistribucion?.autores ?? [];

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
        <h1 className="titulo-principal-form">Autores/Inventores</h1>
      </div>

      <div className="form-fieldsets">
        <div className="form-card resolucion-card">
          {/* Fechas */}
          <div className="information-input-row" style={{ marginTop: 8 }}>
            <div className="item-wrapper">
              <CalendarCheck size={30} color="var(--esp-azul-institucional)" />
              <div className="information-row">
                <label className="information-row-title">
                  Fecha de creación:
                </label>
                <label>
                  {isLoading
                    ? "Cargando..."
                    : fmtFecha(acuerdoDistribucion?.fechaCreacion)}
                </label>
              </div>
            </div>
            <div className="item-wrapper">
              <CalendarCheck size={30} color="var(--esp-azul-institucional)" />
              <div className="information-row">
                <label className="information-row-title">Último cambio:</label>
                <label>
                  {isLoading
                    ? "Cargando..."
                    : fmtFecha(acuerdoDistribucion?.ultimoCambio)}
                </label>
              </div>
            </div>
          </div>

          {/* Autores/Unidades */}

          <table className="tabla-distribucion">
            <thead>
              <tr>
                <th colSpan={4} className="beneficiarios">
                  ACUERDO DE DISTRIBUCIÓN DE AUTORES
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="fila-subtotal-titulo">
                <td
                  colSpan={2}
                  style={{ textAlign: "center" }}
                  className="autor-name"
                >
                  Autor/Inventor
                </td>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  Unidad/Centro
                </td>
              </tr>
              <tr className="fila-subtotal-titulo">
                <td style={{ textAlign: "center" }}>Nombre</td>
                <td style={{ textAlign: "center" }} className="divisor-border">
                  {" "}
                  % autoría
                </td>
                <td style={{ textAlign: "center" }}> Nombre</td>
                <td style={{ textAlign: "center" }}> % autoría</td>
              </tr>

              {isLoading ? (
                <p style={{ marginTop: 12 }}>Cargando participantes…</p>
              ) : (autores?.length ?? 0) === 0 ? (
                <p style={{ marginTop: 12 }}>Sin participantes registrados.</p>
              ) : (
                (autores ?? []).map((a) => {
                  const pctAutor = toPct(a?.porcAutor);
                  const pctUnidad = toPct(a?.porcUnidad);
                  return (
                    <tr className="autor-name">
                      <td style={{ textAlign: "center", width: "25%" }}>
                        {" "}
                        {a?.nombrePersona ?? "—"}{" "}
                      </td>
                      <td
                        style={{ textAlign: "center", width: "25%" }}
                        className="divisor-border"
                      >
                        {" "}
                        {pctAutor} %{" "}
                      </td>
                      <td style={{ textAlign: "center", width: "25%" }}>
                        {a?.nombreUnidad ?? "—"}
                      </td>
                      <td style={{ textAlign: "center", width: "25%" }}>
                        {pctUnidad} %
                      </td>
                    </tr>
                  );
                })
              )}

              <tr></tr>
            </tbody>
          </table>

          {/* Archivos del acuerdo */}
          <div className="input-row" style={{ marginTop: 12 }}>
            <div className="form-card information-card">
              <div className="information-row parrafo-container">
                <label className="information-row-title">
                  Acuerdo de distribución adjunto:
                </label>
                {(archivos ?? []).map((f, idx) => {
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
                      key={f?.id ?? `ad-file-${idx}`}
                    >
                      <button
                        className="btn-add-archivo"
                        onClick={() => openArchivo(fileUrl)}
                        disabled={!hasUrl}
                        title={
                          hasUrl
                            ? "Abrir documento del acuerdo de distribución"
                            : "Sin URL disponible"
                        }
                      >
                        <FileText />
                      </button>
                      <label>{formatFileName(f?.nombre)}</label>
                    </div>
                  );
                })}
                {(archivos?.length ?? 0) === 0 && <span>—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcuerdoDistribucion;
