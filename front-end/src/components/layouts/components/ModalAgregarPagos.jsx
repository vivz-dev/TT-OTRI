// src/pages/layouts/components/ModalAgregarPagos.jsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import RegistrarFactura from "./RegistrarFactura";
import { CircleMinus } from "lucide-react";
import RegisterButton from "../buttons/RegisterButton";
import { getIdPersonaFromAppJwt } from "../../../services/api";
import { useCreatePagoFacturasYArchivosMutation } from "../../../services/pagosOrchestratorApi";

// ⬇️ orquestador de distribución (solo datos para la tabla)
import { useComputeDistribucionTablaMutation } from "../../../services/distribucionPagoOrchestratorApi";
import ModalDistribucion from "./ModalDistribucion";

// ── helpers money ─────────────────────────────────────────
const parseMoney = (value) => {
  if (value == null) return NaN;
  const s = String(value).trim();
  if (!s) return NaN;
  const clean = s.replace(/[^\d.,-]/g, "").replace(/\s+/g, "");
  const lastComma = clean.lastIndexOf(",");
  const lastDot = clean.lastIndexOf(".");
  let normalized = clean;
  if (lastComma !== -1 && lastDot !== -1) {
    const decimalIsComma = lastComma > lastDot;
    normalized = decimalIsComma
      ? clean.replace(/\./g, "").replace(",", ".")
      : clean.replace(/,/g, "");
  } else if (lastComma !== -1) {
    normalized = clean.replace(/\./g, "").replace(",", ".");
  }
  return Number(normalized);
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// ⬇️ util para extraer File desde posibles campos (incluye nested selected.*)
const extractFileFromAny = (a) => {
  if (!a) return null;
  if (typeof File !== "undefined") {
    if (a instanceof File) return a;
    if (a._file instanceof File) return a._file;
    if (a.file instanceof File) return a.file;
    if (a.rawFile instanceof File) return a.rawFile;
    if (a.original instanceof File) return a.original;
    if (a.fileObj instanceof File) return a.fileObj;
    if (a.blob instanceof File) return a.blob;
    if (a.data instanceof File) return a.data;
    if (a.selected?.file instanceof File) return a.selected.file;
    if (a.selected?.rawFile instanceof File) return a.selected.rawFile;
    if (a.selected?._file instanceof File) return a.selected._file;
    if (a.selected?.original instanceof File) return a.selected.original;
    if (a.selected?.fileObj instanceof File) return a.selected.fileObj;
    if (a.selected?.blob instanceof File) return a.selected.blob;
    if (a.selected?.data instanceof File) return a.selected.data;
  }
  return null;
};

const hasAtLeastOneFile = (factura) => {
  const tipos = Array.isArray(factura?.tiposSeleccionados)
    ? factura.tiposSeleccionados
    : [];
  for (const t of tipos) {
    const arr = Array.isArray(t?.archivos) ? t.archivos : [];
    for (const a of arr) {
      if (a?.selected?.hasFile) return true;
      const f = extractFileFromAny(a);
      if (f) return true;
    }
  }
  return false;
};

/** ───────────────────────── Paso 2: contenido de Distribución (inline) ───────────────────────── */
const DistribucionStep = ({
  item,
  resumenPago,
  facturas,
  onBack,
  onClose,
  onConfirmDistribucion,
  registroPagoId,
}) => {
  return (
    <ModalDistribucion
      item={item}
      resumenPago={resumenPago}
      facturas={facturas}
      onClose={onClose}
      onBack={onBack}
      onConfirmDistribucion={onConfirmDistribucion}
      registroPagoId={registroPagoId}
    />
  );
};

/** ───────────────────────── Modal principal (wizard interno) ───────────────────────── */
const ModalAgregarPagos = ({ item, onClose }) => {
  const [items, setItems] = useState(() => [{ id: makeId(), data: null }]);
  const [runOrq, { isLoading: isSaving }] =
    useCreatePagoFacturasYArchivosMutation();

  // ⬇️ orquestador de distribución (solo tabla)
  const [
    computeDistribucionTabla,
    { data: distribTabla, isLoading: isComputingTabla, error: distribErr },
  ] = useComputeDistribucionTablaMutation();

  // Estado de pasos: 'pagos' | 'distribucion'
  const [step, setStep] = useState("pagos");
  const [nextData, setNextData] = useState(null); // { resumenPago, facturas, orquestadorResult }

  // Para mostrar errores al hacer click
  const [triedSubmit, setTriedSubmit] = useState(false);

  // refs para scrollear a la primera factura con error
  const cardRefs = useRef({}); // { [id]: HTMLElement }
  const setCardRef = (id) => (el) => {
    if (el) cardRefs.current[id] = el;
  };

  // ✅ ESC cierra el modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addFactura = () =>
    setItems((prev) => [...prev, { id: makeId(), data: null }]);

  const removeFactura = (id) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((it) => it.id !== id) : prev
    );

  const handleChangeFactura = useCallback((id, payload) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx === -1) return prev;
      const oldData = prev[idx].data;
      const same =
        (!!oldData || oldData === 0) &&
        (!!payload || payload === 0) &&
        Object.keys({ ...(oldData || {}), ...(payload || {}) }).every(
          (k) => oldData?.[k] === payload?.[k]
        );
      if (same) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], data: payload };
      return next;
    });
  }, []);

  // ⚠️ evita spread sobre null
  const payloadFacturas = useMemo(
    () =>
      items.map((it) => ({
        ...(it.data || {}),
        _id: it.id, // para tracking visual
      })),
    [items]
  );

  // helpers de validación por factura
  const analyzeFactura = (f) => {
    if (!f)
      return { ok: false, missing: ["fecha", "valor", "al menos un archivo"] };

    let montoNum =
      typeof f?.valorTotalUsd === "number" && isFinite(f.valorTotalUsd)
        ? f.valorTotalUsd
        : null;

    if (montoNum === null) {
      const candidato = f?.monto ?? f?.valorStr ?? f?.valorTotalUsd;
      const parsed = parseMoney(candidato);
      if (Number.isFinite(parsed)) montoNum = parsed;
    }

    const fechaOk = !!f?.fechaFactura;
    const montoOk = montoNum !== null && montoNum > 0;
    const archivosOk = hasAtLeastOneFile(f);

    const missing = [];
    if (!fechaOk) missing.push("fecha");
    if (!montoOk) missing.push("valor");
    if (!archivosOk) missing.push("al menos un archivo");

    return {
      ok: missing.length === 0,
      missing,
      monto: montoNum != null ? Number(montoNum.toFixed(2)) : null,
    };
  };

  // Particiona válidas/ inválidas (para UI + orquestador)
  const { facturasValidas, facturasInvalidas } = useMemo(() => {
    const valids = [];
    const invalids = [];
    for (const f of payloadFacturas) {
      const res = analyzeFactura(f);
      if (res.ok) {
        valids.push({ ...f, monto: res.monto });
      } else {
        invalids.push({ ...f, _missing: res.missing });
      }
    }
    return { facturasValidas: valids, facturasInvalidas: invalids };
  }, [payloadFacturas]);

  const totalFacturas = facturasValidas.length;
  const totalPago = useMemo(
    () => facturasValidas.reduce((acc, f) => acc + (f?.monto ?? 0), 0),
    [facturasValidas]
  );

  // Ids
  const idPersona = getIdPersonaFromAppJwt();
  const idTT = item?.id ?? null;

  // Ahora el botón permite click para validar (no bloqueamos por campos)
  const puedeHacerClick =
    items.length > 0 && !!idPersona && !!idTT && !isSaving;

  // ⬇️ construye filesByFacturaIndex desde tiposSeleccionados[*].archivos[*]
  const buildFilesByFacturaIndex = useCallback((facturas) => {
    const map = {};
    for (let i = 0; i < facturas.length; i++) {
      const f = facturas[i] || {};
      const idxFactura = i + 1; // 1-based como en tu payload
      const tipos = Array.isArray(f.tiposSeleccionados)
        ? f.tiposSeleccionados
        : [];
      const files = [];

      for (const t of tipos) {
        const arr = Array.isArray(t?.archivos) ? t.archivos : [];
        for (const a of arr) {
          const file = extractFileFromAny(a);
          if (file) files.push(file);
        }
      }

      if (files.length) {
        map[idxFactura] = files;
      }
    }
    return map;
  }, []);

  const scrollToFirstInvalid = useCallback(() => {
    const first = facturasInvalidas[0];
    if (!first) return;
    const id = first._id;
    const node = cardRefs.current[id];
    if (node && node.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [facturasInvalidas]);

  const handleGuardar = useCallback(async () => {
    setTriedSubmit(true); // activa mensajes en hijos

    // Si hay inválidas, mostrar y NO avanzar
    if (facturasInvalidas.length > 0) {
      scrollToFirstInvalid();
      return;
    }

    // Normalizamos cada factura al esquema que pide el orquestador
    const facturas = facturasValidas.map((f, i) => {
      const {
        valorStr,
        valorTotalUsd,
        monto,
        fechaFactura,
        tiposSeleccionadosIds, // opcional
        tiposSeleccionados = [], // aquí vienen archivos agrupados por tipo
        _id, // interno para UI
        ...resto
      } = f;

      const tiposNormalizados = (tiposSeleccionados || []).map((t) => ({
        idTipoTransferencia:
          t?.idTipoTransferencia ?? t?.idTipo ?? t?.tipoId ?? null,
        valorUsd:
          typeof t?.valorUsd === "number" && isFinite(t.valorUsd)
            ? t.valorUsd
            : (() => {
                const parsed = parseMoney(t?.valorUsd);
                return Number.isFinite(parsed) ? parsed : null;
              })(),
        archivos: (t?.archivos || [])
          .filter((a) => a?.fileName || a?.nombre || extractFileFromAny(a))
          .map((a) => ({
            fileName:
              a?.fileName || a?.nombre || extractFileFromAny(a)?.name || null,
            nombre:
              a?.nombre || a?.fileName || extractFileFromAny(a)?.name || null,
            tamanio:
              a?.tamanio || a?.size || extractFileFromAny(a)?.size || null,
            formato: a?.formato || "pdf",
          })),
      }));

      return {
        index: i + 1,
        fechaFactura: fechaFactura ?? null, // yyyy-MM-dd
        monto: Number(Number(monto).toFixed(2)),
        tiposSeleccionadosIds: Array.isArray(tiposSeleccionadosIds)
          ? tiposSeleccionadosIds
          : tiposNormalizados
              ?.map((x) => x.idTipoTransferencia)
              .filter(Boolean) || [],
        tiposSeleccionados: tiposNormalizados,
        ...resto,
      };
    });

    const payload = {
      pago: {
        idPersona,
        idTT,
        totalPago: Number(totalPago.toFixed(2)),
        totalFacturas,
      },
      facturas,
      filesByFacturaIndex: buildFilesByFacturaIndex(facturasValidas),
      options: {
        tipoEntidadArchivo: "F",
        idColeccion: 155,
        compensateOnError: true,
        stopOnFirstError: true,
      },
    };

    // console.log("[ModalAgregarPagos] Payload a orquestador:", payload);

    try {
      const result = await runOrq(payload).unwrap();
      console.log("[ModalAgregarPagos] Orquestador OK:", result);

      // Guarda datos para el siguiente paso (UI)
      setNextData({
        resumenPago: {
          totalPago: payload.pago.totalPago,
          totalFacturas: payload.pago.totalFacturas,
        },
        facturas,
        orquestadorResult: result,
        registroPagoId: result?.registroPagoId ?? null,
      });

      // ✅ Cambiar a pantalla "distribución"
      setStep("distribucion");

      // ✅ Disparar cálculo de tabla de distribución (no renderiza, solo log)
      computeDistribucionTabla({
        idTT,
        montoTotalRegistroPago: payload.pago.totalPago,
        facturas, // por si lo necesitas luego
        idDistribucionResolucion: 2, // default pedido
      })
        .unwrap()
        .catch((err) => {
          console.error("[Distribucion] Error al calcular tabla:", err);
        });
    } catch (err) {
      console.error("[ModalAgregarPagos] Orquestador ERROR:", err);
    }
  }, [
    facturasInvalidas.length,
    facturasValidas,
    idPersona,
    idTT,
    totalPago,
    totalFacturas,
    buildFilesByFacturaIndex,
    runOrq,
    computeDistribucionTabla,
    scrollToFirstInvalid,
  ]);

  // ⬇️ Cuando cambie a la pantalla de distribución y la data llegue, SOLO loguea
  useEffect(() => {
    if (step === "distribucion" && distribTabla) {
      // console.log("[Distribucion] Datos tabla listos:", distribTabla);
    }
  }, [step, distribTabla]);

  if (!item) return null;

  // resumen de errores para footer
  const invalidSummaries = facturasInvalidas.map((f, idx) => {
    const index = items.findIndex((it) => it.id === f._id);
    const numero = index >= 0 ? index + 1 : "?";
    return `#${numero}: falta ${f._missing.join(", ")}`;
  });

  return (
    // ✅ Backdrop ahora SÍ cierra el modal
    <div className="otri-modal-backdrop" role="presentation" tabIndex={-1}>
      <div
        className="otri-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="otri-modal-container">
          {step === "pagos" ? (
            <>
              <header className="otri-modal-header">
                <h3>Agregar factura(s)</h3>
                <div className="headerActions">
                  <RegisterButton
                    onClick={addFactura}
                    text={"Añadir factura"}
                  />
                </div>
              </header>

              <section
                className="otri-modal-body"
                style={{ maxHeight: "60vh", overflow: "auto" }}
              >
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    ref={setCardRef(it.id)}
                    className="facturaCard"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="facturaCardHeader"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <h2
                        className="form-card-header"
                        style={{
                          textAlign: "center",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        Factura #{idx + 1}
                      </h2>
                      <button
                        type="button"
                        onClick={() => removeFactura(it.id)}
                        disabled={items.length === 1 || isSaving}
                        title={
                          items.length === 1
                            ? "Debe haber al menos una"
                            : "Quitar esta factura"
                        }
                        className="btn-delete-top"
                      >
                        <CircleMinus />
                      </button>
                    </div>

                    <RegistrarFactura
                      idTT={item}
                      showErrors={triedSubmit}
                      onChange={(payload) =>
                        handleChangeFactura(it.id, payload)
                      }
                    />
                  </div>
                ))}
              </section>

              <section
                className="facturas-resumen"
                style={{
                  borderTop: "1px dashed #e5e7eb",
                  padding: "10px 12px",
                  maxHeight: "18vh",
                  overflow: "auto",
                }}
              >
                <div style={{ marginBottom: 6, fontWeight: 600 }}>
                  Facturas agregadas: {items.length} &nbsp;|&nbsp; Válidas para
                  guardar: {totalFacturas}
                </div>

                {/* Lista resumida de errores por factura (tras click) */}
                {triedSubmit && invalidSummaries.length > 0 && (
                  <div style={{ color: "#b91c1c", fontSize: 13 }}>
                    {invalidSummaries.map((txt, i) => (
                      <div key={i}>• {txt}</div>
                    ))}
                  </div>
                )}
              </section>

              <footer
                className="otri-modal-footer"
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Total del pago:&nbsp;
                  {new Intl.NumberFormat("es-EC", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  }).format(totalPago || 0)}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <RegisterButton
                    onClick={handleGuardar}
                    text={isSaving ? "Guardando..." : "Siguiente"}
                    disabled={!puedeHacerClick}
                  />
                </div>
              </footer>
            </>
          ) : (
            <DistribucionStep
              item={item}
              resumenPago={nextData?.resumenPago}
              facturas={nextData?.facturas || []}
              onBack={() => setStep("pagos")}
              onClose={onClose}
              onConfirmDistribucion={() => {
                // TODO: POST distribución
                onClose?.();
              }}
              registroPagoId={nextData?.registroPagoId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarPagos;
