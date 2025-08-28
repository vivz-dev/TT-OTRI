// src/pages/layouts/components/ModalDistribucion.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import ReactPDF from "@react-pdf/renderer";
import DistribucionFinal from "./DistribucionFinal";
import { useComputeDistribucionTablaMutation } from "../../../services/distribucionPagoOrchestratorApi";
import * as Buttons from '../buttons/buttons_index'

// 🆕 PDF document component
import DistribucionFinalPdf from "./DistribucionFinalPdf";

// 🆕 Orquestador de archivos + endpoints
import { uploadAndSaveArchivo } from "../../../services/storage/archivosOrchestrator";
import {
  useUploadToDspaceMutation,
  useCreateArchivoMutation,
} from "../../../services/storage/archivosApi";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/**
 * Props esperadas:
 * - item: TT seleccionada (id, idTecnologia, titulo, etc.)
 * - resumenPago: { totalPago, totalFacturas }
 * - facturas: array con { index, fechaFactura, monto, ... }
 * - onClose: cerrar modal
 * - onBack: opcional, volver al paso anterior
 */
const ModalDistribucion = ({
  item,
  resumenPago,
  facturas = [],
  onClose,
  onBack,
}) => {
  const stop = (e) => e.stopPropagation();

  const total =
    resumenPago?.totalPago ||
    facturas.reduce((acc, f) => acc + (f?.monto ?? 0), 0);
  const cantidad = resumenPago?.totalFacturas || facturas.length;

  const rows = useMemo(() => {
    return facturas.map((f) => ({
      index: f.index,
      fecha: f.fechaFactura ?? "—",
      monto: f.monto ?? 0,
    }));
  }, [facturas]);

  const [computeDistribucion, { isLoading, isError, error }] =
    useComputeDistribucionTablaMutation();
  const [resultado, setResultado] = useState(null);

  // 🆕 Mutations para orquestador de archivos
  const [uploadToDspace] = useUploadToDspaceMutation();
  const [createArchivo] = useCreateArchivoMutation();

  // ───────────────── Candados para ejecutar 1 sola vez ─────────────────
  const didRunRef = useRef(false);
  const inFlightRef = useRef(false);

  const handleCalcular = async () => {
    if (inFlightRef.current) {
      // console.log("[MODAL] 🔒 Cálculo ya en vuelo. Ignorando llamada duplicada.");
      return;
    }
    inFlightRef.current = true;

    try {
      const args = {
        idTT: item?.id, // Ajusta si tu TT usa otra clave (p.ej., item.idTT)
        montoTotalRegistroPago: total,
      };
      // console.log("[MODAL] ▶ Ejecutando orquestador con:", args);
      const data = await computeDistribucion(args).unwrap();
      // console.log("[MODAL] ✅ Respuesta orquestador:", data);
      setResultado((prev) => prev || data);
    } catch (e) {
      console.error("[MODAL] ❌ Error al calcular distribución:", e);
      setResultado(null);
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (didRunRef.current) {
      // console.log("[MODAL] ⏭ Ya se ejecutó el cálculo previamente. Skip.");
      return;
    }
    didRunRef.current = true;
    handleCalcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🆕 Guardar & Ver PDF
  const savingRef = useRef(false);
  const handleGuardarYVerPdf = async () => {
    if (!resultado || savingRef.current) return;
    savingRef.current = true;

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hoy = `${yyyy}_${mm}_${dd}`;

    try {
      // 1) Construir el documento PDF
      const doc = <DistribucionFinalPdf data={resultado} />;
      const blob = await ReactPDF.pdf(doc).toBlob();

      // 2) Nombre de archivo solicitado
      const idTec =
        item?.id ??
        item?.idTecnologia ??
        item?.tecnologiaId ??
        item?.id_tec ??
        "NA";
      const codResRaw = resultado?.codigoResolucion ?? "SIN-CODIGO";
      const codRes = String(codResRaw)
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]+/g, "_");
      const fileName = `${hoy}_distribucion_pago_tecnologia_${idTec}_resolucion_${codRes}.pdf`;

      // 3) Enviar al orquestador de archivos (tipo SP)
      const file = new File([blob], fileName, { type: "application/pdf" });

      const meta = {
        titulo: fileName,
        idTEntidad: item?.id ?? idTec, // usa id de la TT si existe; fallback: idTecnologia
        tipoEntidad: "SP", // requerido (no modificar)
        // nombresAutor / identificacion se toman del JWT por el orquestador
      };

      const res = await uploadAndSaveArchivo({
        file,
        meta,
        uploadToDspace, // mutation trigger (retorna { data / error })
        createArchivo, // mutation trigger (retorna { data / error })
      });

      // 4) Ver el PDF (preferimos la URL de DSpace; si no, el blob local)
      const viewUrl = res?.urlDescargaServicio || res?.urlDspace;
      if (viewUrl) {
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      } else {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }

      onClose();
    } catch (e) {
      console.error("[MODAL] ❌ Error generando/subiendo PDF:", e);
      alert("No se pudo generar o guardar el PDF: " + String(e?.message || e));
    } finally {
      savingRef.current = false;
    }
  };

  // console.log("RESULTADO --> ", resultado);

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={stop}>
        <header className="otri-modal-header">
          <h3>Distribución de beneficios económicos</h3>
        </header>

        <section
          className="otri-modal-body"
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            display: "grid",
            gap: 12,
          }}
        >
          {isError && (
            <div
              style={{
                color: "#b91c1c",
                border: "1px solid #fecaca",
                background: "#fff1f2",
                padding: 12,
                borderRadius: 8,
              }}
            >
              Error al calcular:{" "}
              {String(error?.data || error?.message || "Desconocido")}
            </div>
          )}

          {/* Vista HTML en pantalla */}
          {resultado && <DistribucionFinal data={resultado} />}
        </section>

        <footer className="otri-modal-footer">
          <div>
            <Buttons.RegisterButton
              onClick={handleGuardarYVerPdf}
              disabled={!resultado || isLoading}
              text={isLoading ? "Calculando…" : "Cerrar y ver archivo PDF"}

            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ModalDistribucion;
