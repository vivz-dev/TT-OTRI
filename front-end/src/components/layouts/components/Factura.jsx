// src/pages/layouts/components/Factura.jsx
import React, { useMemo } from "react";
import { useGetArchivosByEntidadQuery } from "../../../services/storage/archivosApi";
import { FileText } from "lucide-react";

const formatDate = (d) => {
  if (!d) return "—";
  try {
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
};

const formatMoney = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v ?? "—");
  try {
    return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  } catch {
    return n.toFixed(2);
  }
};

const Factura = ({ factura = {} }) => {
  // Derivar valores de forma segura
  const idEntidad = useMemo(
    () => factura?.id ?? factura?.idFactura ?? factura?.Id ?? factura?.IdFactura ?? null,
    [factura]
  );
  const tipoEntidad = "F";

  // GET /archivos por entidad
  const { data: archivos = [], isLoading, isError } = useGetArchivosByEntidadQuery(
    { idTEntidad: idEntidad, tipoEntidad },
    { skip: !idEntidad }
  );

  const fechaStr = formatDate(factura?.fechaFactura ?? factura?.FechaFactura);
  const montoStr = formatMoney(factura?.monto ?? factura?.valor ?? factura?.Valor);

  // Normalizar estructura de archivos
  const archivosNorm = useMemo(() => {
    if (!Array.isArray(archivos)) return [];
    return archivos
      .filter(Boolean)
      .map((a, idx) => ({
        key: a?.id ?? a?.Id ?? idx,
        id: a?.id ?? a?.Id ?? null,
        nombre: a?.nombre ?? a?.Nombre ?? `Archivo ${idx + 1}`,
        url: a?.url ?? a?.Url ?? "",
        formato: a?.formato ?? a?.Formato ?? "",
      }));
  }, [archivos]);

  const handleOpenArchivo = (url) => {
    if (!url) return;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("No se pudo abrir el archivo", e);
    }
  };

  return (
    <tr className="autor-name">
      <td>{fechaStr}</td>
      <td>{montoStr}</td>
      <td>
        {isLoading && <em>Cargando adjuntos…</em>}
        {isError && <em>Error al cargar adjuntos</em>}
        {!isLoading && !isError && (
          archivosNorm.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {archivosNorm.map((a) => (
                <li key={a.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span>{a.nombre}</span>
                  <button
                    className="btn-add-archivo"
                    onClick={() => handleOpenArchivo(a.url)}
                    disabled={!a.url}
                    title={a.url ? "Ver Factura" : "Sin URL"}
                    aria-label={`Ver adjunto ${a.nombre}`}
                    type="button"
                  >
                    <FileText />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <span>Sin adjuntos</span>
          )
        )}
      </td>
    </tr>
  );
};

export default Factura;
