// src/pages/layouts/components/ModalAgregarPagos.jsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
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

  return null;
};

/** ───────────────────────── Paso 2: contenido de Distribución (inline) ───────────────────────── **/
const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

const DistribucionStep = ({
  item,
  resumenPago,
  facturas,
  onBack,
  onClose,
  onConfirmDistribucion,
}) => {
  // const total =
  //   resumenPago?.totalPago ||
  //   facturas.reduce((acc, f) => acc + (f?.monto ?? 0), 0);
  // const cantidad = resumenPago?.totalFacturas || facturas.length;

  return (

    <ModalDistribucion
    item={item}
    resumenPago ={resumenPago}
    facturas={facturas}
    onClose={onClose}
    onBack={onBack}
    onConfirmDistribucion={onConfirmDistribucion}
    />
  );
};

/** ───────────────────────── Modal principal (wizard interno) ───────────────────────── **/
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
      })),
    [items]
  );

  // Facturas válidas: requieren fecha y monto > 0
  const facturasValidas = useMemo(() => {
    return payloadFacturas
      .map((f) => {
        if (!f) return null;

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
        if (!fechaOk || !montoOk) return null;

        return { ...f, monto: montoNum };
      })
      .filter(Boolean);
  }, [payloadFacturas]);

  const totalFacturas = facturasValidas.length;
  const totalPago = useMemo(
    () => facturasValidas.reduce((acc, f) => acc + (f?.monto ?? 0), 0),
    [facturasValidas]
  );

  // Ids
  const idPersona = getIdPersonaFromAppJwt();
  const idTT = item?.id ?? null;

  const puedeGuardar = Boolean(
    idPersona && idTT && totalFacturas > 0 && totalPago > 0 && !isSaving
  );

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
          if (file instanceof File) {
            files.push(file);
          }
        }
      }

      if (files.length) {
        map[idxFactura] = files;
      }
    }
    return map;
  }, []);

  const handleGuardar = useCallback(async () => {
    // Normalizamos cada factura al esquema que pide el orquestador
    const facturas = facturasValidas.map((f, i) => {
      const {
        valorStr,
        valorTotalUsd,
        monto,
        fechaFactura,
        tiposSeleccionadosIds, // opcional
        tiposSeleccionados = [], // aquí vienen archivos agrupados por tipo
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
          : (
              tiposNormalizados
                ?.map((x) => x.idTipoTransferencia)
                .filter(Boolean) || []
            ),
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

    console.log("[ModalAgregarPagos] Payload a orquestador:", payload);

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
    idPersona,
    idTT,
    totalPago,
    totalFacturas,
    facturasValidas,
    runOrq,
    buildFilesByFacturaIndex,
    computeDistribucionTabla,
  ]);

  // ⬇️ Cuando cambie a la pantalla de distribución y la data llegue, SOLO loguea
  useEffect(() => {
    if (step === "distribucion" && distribTabla) {
      console.log("[Distribucion] Datos tabla listos:", distribTabla);
    }
  }, [step, distribTabla]);

  if (!item) return null;

  return (
    // ✅ Backdrop ahora SÍ cierra el modal
    <div
      className="otri-modal-backdrop backdropStyle"
      onClick={onClose}
      role="presentation"
      tabIndex={-1}
    >
      <div
        className="otri-modal modalStyle"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {step === "pagos" ? (
          <>
            <header className="otri-modal-header headerStyle">
              <h3>Agregar pagos / facturas</h3>
              <div className="headerActions">
                <RegisterButton onClick={addFactura} text={"Añadir factura"} />
              </div>
            </header>

            <section
              className="otri-modal-body bodyStyle"
              style={{ maxHeight: "60vh", overflow: "auto" }}
            >
              {items.map((it, idx) => (
                <div
                  key={it.id}
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
                    <strong>Factura #{idx + 1}</strong>
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
                    onChange={(payload) => handleChangeFactura(it.id, payload)}
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
            </section>

            <footer
              className="otri-modal-footer footerStyle"
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                Total a pagar:{" "}
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
                  disabled={!puedeGuardar}
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
          />
        )}
      </div>
    </div>
  );
};

export default ModalAgregarPagos;
