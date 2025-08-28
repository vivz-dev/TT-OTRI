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

  // GET /archivos y filtra por idEntidad + tipoEntidad
  const { data: archivos = [], isLoading, isError } = useGetArchivosByEntidadQuery(
    { idTEntidad: idEntidad, tipoEntidad },
    { skip: !idEntidad }
  );

  // Preparar campos para mostrar
  const fechaStr = formatDate(factura?.fechaFactura ?? factura?.FechaFactura);
  const montoStr = formatMoney(factura?.monto ?? factura?.valor ?? factura?.Valor);

  // Elegir el primer archivo con URL disponible (normaliza url/Url)
  const bestArchivo = useMemo(() => {
    if (!Array.isArray(archivos)) return null;
    return archivos.find((a) => (a?.url ?? a?.Url)) ?? null;
  }, [archivos]);

  const archivoUrl = bestArchivo?.url ?? bestArchivo?.Url ?? "";
  const archivoNombre = bestArchivo?.nombre ?? bestArchivo?.Nombre ?? "No ha subido archivo";

  const handleOpenArchivo = () => {
    if (!archivoUrl) {
      console.warn("No hay URL de archivo para esta factura", { idEntidad, archivos });
      return;
    }
    try {
      window.open(archivoUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("No se pudo abrir el archivo", e);
    }
  };

  // Debug opcional
  console.log("ARCHIVOS (filtrados) -> ", archivos);
  console.log("Archivo elegido -> ", bestArchivo);

  return (
    <tr className="autor-name">
      <td>{fechaStr}</td>
      <td>{montoStr}</td>
      <td>{archivoNombre}</td>
      <td>
        <button
          className="btn-add-archivo"
          onClick={handleOpenArchivo}
          disabled={isLoading || isError || !archivoUrl}
          title={
            isLoading
              ? "Cargando adjuntos…"
              : isError
              ? "Error al cargar adjuntos"
              : archivoUrl
              ? "Ver Factura"
              : "Sin adjuntos"
          }
          aria-label="Ver factura adjunta"
        >
          <FileText />
        </button>
      </td>
      
    </tr>
  );
};

export default Factura;
