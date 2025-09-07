// /src/pages/layouts/components/utils/resumenPagos.js
import React from "react";
import * as ReactPDF from "@react-pdf/renderer";
import { ensureAppJwt } from "../../../../services/api";

// ——————————————————— Utils ———————————————————
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const parseDate = (d) => {
  try {
    const t = new Date(d);
    return isNaN(t.getTime()) ? null : t;
  } catch {
    return null;
  }
};

const fmtISO = (d) => (d instanceof Date ? d.toISOString() : null);
const fmtYMD = (d) => {
  const t = parseDate(d);
  if (!t) return null;
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ——— Reemplaza getNombreBenef y getMontoBenef por estas versiones ———

// Nombre flexible (prioriza el shape del orquestador: { idPersona })
function getNombreBenef(x) {
  if (x?.idPersona) return String(x.idPersona);
  return (
    x?.nombre ??
    x?.nombrePersona ??
    x?.nombreCompleto ??
    x?.autorNombre ??
    x?.inventorNombre ??
    x?.denominacion ??
    x?.institucionNombre ??
    x?.razonSocial ??
    x?.sigla ??
    "—"
  );
}

// Monto flexible (prioriza el shape del orquestador: { montoAutor })
function getMontoBenef(x) {
  if (Number.isFinite(Number(x?.montoAutor))) return Number(x.montoAutor);

  const cands = [
    x?.monto,
    x?.valor,
    x?.total,
    x?.totalAsignado,
    x?.montoAsignado,
    x?.valorAsignado,
    x?.valorDistribucion,
    x?.pago,
    x?.cuota,
  ];
  for (const v of cands) {
    const n = toNumber(v);
    if (n) return n;
  }
  return 0;
}

// —— PRIORIDAD para instituciones/centros según el orquestador ——

// Institución
function getNombreInstitucion(x) {
  if (x?.nombreBenef) return String(x.nombreBenef);
  return (
    x?.institucionNombre ??
    x?.denominacion ??
    x?.razonSocial ??
    x?.sigla ??
    "—"
  );
}
function getMontoInstitucion(x) {
  if (Number.isFinite(Number(x?.montoBenefInst))) return Number(x.montoBenefInst);
  return toNumber(x?.monto ?? x?.valor ?? x?.total);
}

// Centro
function getNombreCentro(x) {
  if (x?.nombreCentro) return String(x.nombreCentro);
  return "—";
}
function getMontoCentro(x) {
  if (Number.isFinite(Number(x?.montoCentro))) return Number(x.montoCentro);
  return toNumber(x?.monto ?? x?.valor ?? x?.total);
}



// ——————————————————— Resumen ———————————————————
export function buildResumenPagos(registros = [], item = null) {
  const rows = Array.isArray(registros) ? registros : [];

  const totalPagado = rows.reduce((acc, r) => acc + toNumber(r?.totalPago), 0);

  const fechas = rows
    .map((r) => parseDate(r?.createdAt))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const primerPago = fechas[0] || null;
  const ultimoPago = fechas[fechas.length - 1] || null;

  const aggPorUsuario = rows.reduce((map, r) => {
    const nombre = r?.nombrePersona || "Sin nombre";
    const prev =
      map.get(nombre) || { nombrePersona: nombre, total: 0, cantidad: 0 };
    prev.total += toNumber(r?.totalPago);
    prev.cantidad += 1;
    map.set(nombre, prev);
    return map;
  }, new Map());

  const porUsuario = Array.from(aggPorUsuario.values()).sort(
    (a, b) => b.total - a.total
  );

  const detalleRegistros = rows.map((r) => ({
    idRegistro: r?.idRegistroPago ?? r?.id ?? null,
    fechaISO: fmtISO(parseDate(r?.createdAt)),
    registradoPor: r?.nombrePersona || "Sin nombre",
    totalPago: toNumber(r?.totalPago),
    facturasCount: Array.isArray(r?.facturas) ? r.facturas.length : undefined,
  }));

  const meta = {
    transferenciaId: item?.id ?? item?.idTT ?? item?.idTransferencia ?? null,
    transferenciaNombre:
      item?.nombre ?? item?.titulo ?? item?.nombreTT ?? null,
  };

  return {
    ...meta,
    cantidadRegistros: rows.length,
    totalPagado,
    primerPagoISO: fmtISO(primerPago),
    ultimoPagoISO: fmtISO(ultimoPago),
    porUsuario,
    registros: detalleRegistros,
  };
}

// ——————————————————— GET y filtro ———————————————————
function matchByTransferenciaId(registro, transferenciaId) {
  if (!Number.isFinite(Number(transferenciaId))) return false;
  const tid = Number(transferenciaId);

  const candidates = [
    registro?.transferenciaId,
    registro?.idTransferencia,
    registro?.idTransferenciaTecnologica,
    registro?.idTT,
    registro?.idTt,
    registro?.ttId,
  ].map((v) => (Number.isFinite(Number(v)) ? Number(v) : null));

  return candidates.some((v) => v === tid);
}

export async function logGetAllRegistrosPago(transferenciaId = null) {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
  const base = `${baseUrl}/registros-pago`;
  const hasTid = Number.isFinite(Number(transferenciaId));

  let url = base;
  let usedServerFilter = false;

  try {
    const token = await ensureAppJwt();

    if (hasTid) {
      const tryUrl = `${base}?transferenciaId=${Number(transferenciaId)}`;
      const resTry = await fetch(tryUrl, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (resTry.ok) {
        const data = (await resTry.json().catch(() => null)) || [];
        usedServerFilter = true;
        url = tryUrl;

        console.groupCollapsed(
          `📦 [GET ${tryUrl}] Resultado (filtro en servidor)`
        );
        console.table(Array.isArray(data) ? data : []);
        console.log("Total (servidor):", Array.isArray(data) ? data.length : 0);
        console.groupEnd();

        return { finalData: data, usedServerFilter };
      }
    }

    const res = await fetch(base, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[GET ${base}] HTTP ${res.status}`, text);
      return { finalData: [], usedServerFilter };
    }

    const allData = (await res.json().catch(() => null)) || [];

    const finalData =
      hasTid && !usedServerFilter
        ? allData.filter((r) => matchByTransferenciaId(r, transferenciaId))
        : allData;

    const label = hasTid
      ? `📦 [GET ${base}] Resultado (filtrado en cliente por transferenciaId=${Number(
          transferenciaId
        )})`
      : `📦 [GET ${base}] Resultado`;

    console.groupCollapsed(label);
    console.table(finalData);
    console.log(
      "Total:",
      Array.isArray(finalData) ? finalData.length : 0,
      hasTid && !usedServerFilter
        ? `(de ${Array.isArray(allData) ? allData.length : 0} totales)`
        : ""
    );
    console.groupEnd();

    return { finalData, usedServerFilter };
  } catch (err) {
    console.error(`[GET ${url}] Error`, err);
    return { finalData: [], usedServerFilter };
  }
}

// ——————————————————— PDF (en el mismo archivo) ———————————————————

/* Paleta para el PDF */
const palette = {
  primary: "#1f2f56",
  primaryLight: "#d9e2ff",
  subtotalBg: "#e6e6e6",
  border: "#000000",
  textDark: "#0b132b",
};

const styles = ReactPDF.StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: palette.textDark,
  },
  headerBox: {
    backgroundColor: palette.primary,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
  },
  labelRow: {
    flexDirection: "row",
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.primaryLight,
  },
  labelCell: {
    flexGrow: 1,
    fontWeight: 700,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  valueCell: {
    width: 250,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },
  paragraphBox: {
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 0,
  },
  paragraph: {
    lineHeight: 1.4,
    textAlign: "justify",
  },
  sectionHeader: {
    backgroundColor: palette.primary,
    borderColor: palette.border,
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },
  blockHeader: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  blockHeaderLabel: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  blockHeaderRight: {
    width: 120,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  headRow: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  th: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  cellLabel: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: 200,
    textTransform: "capitalize",
  },
  cellMoney: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },
  dateCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    backgroundColor: palette.subtotalBg,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  subtotalLabel: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  subtotalMoney: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  totalLabel: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  totalMoney: {
    width: 80,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },
});

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/** Helper para columna por fecha */
const valueOnDate = (obj, dateKey) => {
  const v = obj?.[dateKey];
  return money(toNumber(v));
};

/**
 * Componente PDF – con columnas dinámicas por fecha
 */
const DistribucionFinalPdf = ({ data }) => {
  const autores = Array.isArray(data?.autores) ? data.autores : [];
  const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
  const centros = Array.isArray(data?.centros) ? data.centros : [];
  const fechas = Array.isArray(data?.fechas) ? data.fechas : [];

  // ancho fijo para Total; ancho por fecha
  const dateWidth = 70; // si tienes más de 6-7 fechas, considera dividir en varias páginas

  return (
    <ReactPDF.Document>
      <ReactPDF.Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <ReactPDF.View style={styles.headerBox}>
          <ReactPDF.Text style={styles.headerTitle}>
            FORMULARIO DE DISTRIBUCIÓN DE BENEFICIOS ECONÓMICOS DE LA ESPOL
          </ReactPDF.Text>
          <ReactPDF.Text style={styles.headerTitle}>
            POR EXPLOTACIÓN DE LA PROPIEDAD INTELECTUAL
          </ReactPDF.Text>
        </ReactPDF.View>

        {/* Tecnología */}
        <ReactPDF.View style={styles.labelRow}>
          <ReactPDF.Text style={styles.labelCell}>Nombre de la tecnología/know-how:</ReactPDF.Text>
          <ReactPDF.Text style={styles.valueCell}>
            {data?.nombreTecnologia ?? "No hay datos de la tecnología"}
          </ReactPDF.Text>
        </ReactPDF.View>

        {/* Intro */}
        <ReactPDF.View style={styles.paragraphBox}>
          <ReactPDF.Text style={styles.paragraph}>
            {`Con base al acuerdo de distribución de beneficios económicos de autores/inventores por explotación de la Propiedad Intelectual, y a la resolución No. ${data?.codigoResolucion ?? "—"}, la distribución de los beneficios económicos que reciba la ESPOL por la explotación de la Propiedad Intelectual de la tecnología/know how descrita, se distribuya conforme al siguiente detalle:`}
          </ReactPDF.Text>
        </ReactPDF.View>

        {/* Sección */}
        <ReactPDF.View style={styles.sectionHeader}>
          <ReactPDF.Text style={styles.sectionHeaderText}>LISTADO DE BENEFICIARIOS</ReactPDF.Text>
        </ReactPDF.View>

        {/* Header autores */}
        <ReactPDF.View style={styles.headRow}>
          <ReactPDF.Text style={{ ...styles.th, textAlign: "left", flexGrow: 1, paddingLeft: 8 }}>
            Autores/Inventores beneficiarios
          </ReactPDF.Text>
          <ReactPDF.Text style={{ ...styles.th, width: 80 }}>Total</ReactPDF.Text>
          {fechas.map((f) => (
            <ReactPDF.Text key={`aut-h-${f}`} style={{ ...styles.th, width: dateWidth }}>
              {f}
            </ReactPDF.Text>
          ))}
        </ReactPDF.View>

        {/* Rows autores */}
        {autores.map((a, i) => {
          const label = a?.nombrePersona ?? a?.idPersona ?? `Autor ${i + 1}`;
          const monto = a?.montoAutor ?? 0;
          const porFecha = a?.porFecha || {};
          return (
            <ReactPDF.View key={`autor-${i}`} style={styles.row}>
              <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
              {fechas.map((f) => (
                <ReactPDF.Text key={`aut-${i}-${f}`} style={{ ...styles.dateCell, width: dateWidth }}>
                  {valueOnDate(porFecha, f)}
                </ReactPDF.Text>
              ))}
            </ReactPDF.View>
          );
        })}

        <ReactPDF.View style={styles.subtotalRow}>
          <ReactPDF.Text style={styles.subtotalLabel}>
            Subtotal de autores/inventores beneficiarios
          </ReactPDF.Text>
          <ReactPDF.Text style={styles.subtotalMoney}>{money(data?.subtotalAutores)}</ReactPDF.Text>
          {fechas.map((f) => (
            <ReactPDF.Text key={`aut-sub-${f}`} style={{ ...styles.subtotalMoney, width: dateWidth }}>
              {money(toNumber(data?.porFechaAutores?.[f]))}
            </ReactPDF.Text>
          ))}
        </ReactPDF.View>

        {/* Header inst/centros */}
        <ReactPDF.View style={styles.headRow}>
          <ReactPDF.Text style={{ ...styles.th, textAlign: "left", flexGrow: 1, paddingLeft: 8 }}>
            Otros beneficiarios institucionales
          </ReactPDF.Text>
          <ReactPDF.Text style={{ ...styles.th, width: 80 }}>Total</ReactPDF.Text>
          {fechas.map((f) => (
            <ReactPDF.Text key={`inst-h-${f}`} style={{ ...styles.th, width: dateWidth }}>
              {f}
            </ReactPDF.Text>
          ))}
        </ReactPDF.View>

        {/* CENTROS */}
        {centros.map((c, i) => {
          const label = c?.nombreCentro?.toLowerCase?.() ?? `Centro ${i + 1}`;
          const monto = c?.montoCentro ?? 0;
          const porFecha = c?.porFecha || {};
          return (
            <ReactPDF.View key={`centro-${i}`} style={styles.row}>
              <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
              {fechas.map((f) => (
                <ReactPDF.Text key={`cent-${i}-${f}`} style={{ ...styles.dateCell, width: dateWidth }}>
                  {valueOnDate(porFecha, f)}
                </ReactPDF.Text>
              ))}
            </ReactPDF.View>
          );
        })}

        {/* INSTITUCIONES */}
        {instituciones.map((inst, i) => {
          const label = inst?.nombreBenef ?? `Institución ${i + 1}`;
          const monto = inst?.montoBenefInst ?? 0;
          const porFecha = inst?.porFecha || {};
          return (
            <ReactPDF.View key={`inst-${i}`} style={styles.row}>
              <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
              {fechas.map((f) => (
                <ReactPDF.Text key={`inst-${i}-${f}`} style={{ ...styles.dateCell, width: dateWidth }}>
                  {valueOnDate(porFecha, f)}
                </ReactPDF.Text>
              ))}
            </ReactPDF.View>
          );
        })}

        <ReactPDF.View style={styles.subtotalRow}>
          <ReactPDF.Text style={styles.subtotalLabel}>Subtotal de beneficiarios institucionales</ReactPDF.Text>
          <ReactPDF.Text style={styles.subtotalMoney}>{money(data?.subtotalInstituciones)}</ReactPDF.Text>
          {fechas.map((f) => (
            <ReactPDF.Text key={`inst-sub-${f}`} style={{ ...styles.subtotalMoney, width: dateWidth }}>
              {money(toNumber(data?.porFechaInstituciones?.[f]))}
            </ReactPDF.Text>
          ))}
        </ReactPDF.View>

        {/* TOTAL GENERAL */}
        <ReactPDF.View style={styles.totalRow}>
          <ReactPDF.Text style={styles.totalLabel}>Total del pago realizado</ReactPDF.Text>
          <ReactPDF.Text style={styles.totalMoney}>{money(data?.total)}</ReactPDF.Text>
          {fechas.map((f) => (
            <ReactPDF.Text key={`tot-${f}`} style={{ ...styles.totalMoney, width: dateWidth }}>
              {money(
                toNumber(data?.porFechaAutores?.[f]) + toNumber(data?.porFechaInstituciones?.[f])
              )}
            </ReactPDF.Text>
          ))}
        </ReactPDF.View>
      </ReactPDF.Page>
    </ReactPDF.Document>
  );
};

/**
 * Genera el PDF en local y lo abre en una pestaña nueva
 */
async function generateAndOpenDistribucionPdf(resultadoLike) {
  try {
    const doc = <DistribucionFinalPdf data={resultadoLike} />;
    const blob = await ReactPDF.pdf(doc).toBlob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error("[PDF] Error generando PDF:", e);
    alert("No se pudo generar el PDF: " + String(e?.message || e));
  }
}

// ——————————————————— Orquestador RTK por pago + SUBTOTALES (JSON) ———————————————————
export async function runDistribucionTablaForPagos(
  pagosFiltrados = [],
  idTT,
  options = {}
) {
  if (!Array.isArray(pagosFiltrados) || pagosFiltrados.length === 0) {
    console.info("[ORQ][Distribución] No hay pagos para procesar.");
    return;
  }

  const tid = Number(idTT);
  if (!Number.isFinite(tid)) {
    console.warn("[ORQ][Distribución] idTT inválido, se omite la ejecución.");
    return;
  }

  const computeDistribucion = options.computeDistribucion;
  if (typeof computeDistribucion !== "function") {
    console.warn(
      "[ORQ][Distribución] Falta el trigger del hook: pasa { computeDistribucion } " +
        "desde useComputeDistribucionTablaMutation()."
    );
    return;
  }

  // Subtotales por fecha (autores e instituciones del payload de cabecera)
  const autoresByDate = new Map();
  const instSubtotalByDate = new Map();

  // 🔥 Agregadores detallados:
  // Autores: nombre -> { nombre, total, byDate: Map<fecha,monto> }
  const autoresAgg = new Map();

  // Centros + Instituciones (juntos): nombre -> { nombre, tipo, total, byDate: Map<fecha,monto> }
  const instCentroAgg = new Map();

  const fechasSet = new Set();
  const detallePagos = [];

  for (const p of pagosFiltrados) {
    const idRegistro = p?.idRegistroPago ?? p?.id ?? "—";
    theLoop: try {
      const monto = toNumber(p?.totalPago);
      const dateKey =
        fmtYMD(p?.createdAt) || fmtYMD(p?.fecha) || fmtYMD(p?.fechaPago) || "s/f";
      if (dateKey !== "s/f") fechasSet.add(dateKey);

      const args = { idTT: tid, montoTotalRegistroPago: monto };
      const data = await computeDistribucion(args).unwrap();

      // ——— SUBTOTALES de cabecera
      const sa = toNumber(data?.subtotalAutores);
      const si = toNumber(data?.subtotalInstituciones);

      autoresByDate.set(dateKey, toNumber(autoresByDate.get(dateKey) || 0) + sa);
      instSubtotalByDate.set(
        dateKey,
        toNumber(instSubtotalByDate.get(dateKey) || 0) + si
      );

      // ——— AUTORES por fecha
      const autores = Array.isArray(data?.autores) ? data.autores : [];
      for (const a of autores) {
        const nombre = getNombreBenef(a) || "—";
        const valor = toNumber(getMontoBenef(a));

        const prev =
          autoresAgg.get(nombre) || { nombre, total: 0, byDate: new Map() };
        prev.total += valor;
        prev.byDate.set(
          dateKey,
          toNumber(prev.byDate.get(dateKey) || 0) + valor
        );
        autoresAgg.set(nombre, prev);
      }

      // ——— INSTITUCIONES
      const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
      for (const inst of instituciones) {
        const nombre = getNombreInstitucion(inst);
        const valor = getMontoInstitucion(inst);

        const key = `I:${nombre}`;
        const prev =
          instCentroAgg.get(key) || {
            nombre,
            tipo: "Institución",
            total: 0,
            byDate: new Map(),
          };
        prev.total += valor;
        prev.byDate.set(
          dateKey,
          toNumber(prev.byDate.get(dateKey) || 0) + valor
        );
        instCentroAgg.set(key, prev);
      }

      // ——— CENTROS
      const centros = Array.isArray(data?.centros) ? data.centros : [];
      for (const c of centros) {
        const nombre = getNombreCentro(c);
        const valor = getMontoCentro(c);

        const key = `C:${nombre}`;
        const prev =
          instCentroAgg.get(key) || {
            nombre,
            tipo: "Centro",
            total: 0,
            byDate: new Map(),
          };
        prev.total += valor;
        prev.byDate.set(
          dateKey,
          toNumber(prev.byDate.get(dateKey) || 0) + valor
        );
        instCentroAgg.set(key, prev);
      }

      // Auditoría por pago
      detallePagos.push({
        pagoId: idRegistro,
        fecha: dateKey,
        montoTotalRegistroPago: Number(monto.toFixed?.(2) ?? monto),
        subtotalAutores: Number(sa.toFixed?.(2) ?? sa),
        subtotalInstituciones: Number(si.toFixed?.(2) ?? si),
      });

      // Log corto por pago
      console.log(
        "[ORQ] Subtotales por pago:",
        JSON.stringify(
          {
            pagoId: idRegistro,
            fecha: dateKey,
            idTT: tid,
            subtotalAutores: Number(sa.toFixed?.(2) ?? sa),
            subtotalInstituciones: Number(si.toFixed?.(2) ?? si),
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error("[ERROR] computeDistribucionTabla:", err);
    }
  }

  // —— Fechas ordenadas (quitamos "s/f")
  const fechas = Array.from(fechasSet.values())
    .filter((f) => f !== "s/f")
    .sort();

  // —— Helper: Map<fecha,monto> -> objeto llano
  const toObjByDates = (map, orderedDates) => {
    const obj = {};
    for (const f of orderedDates) {
      const v = toNumber(map.get(f) || 0);
      obj[f] = Number(v.toFixed(2));
    }
    return obj;
  };

  // —— Totales de cabecera (subtotales)
  const porFechaAutoresObj = toObjByDates(autoresByDate, fechas);
  const porFechaInstObj = toObjByDates(instSubtotalByDate, fechas);

  const totalAutoresSubtotal = Object.values(porFechaAutoresObj).reduce(
    (acc, v) => acc + toNumber(v),
    0
  );
  const totalInstSubtotal = Object.values(porFechaInstObj).reduce(
    (acc, v) => acc + toNumber(v),
    0
  );

  // —— BLOQUE AUTORES (detalle por autor)
  const autoresArr = Array.from(autoresAgg.values())
    .map(({ nombre, total, byDate }) => ({
      autor: nombre,
      totalRecibido: Number(total.toFixed(2)),
      porFecha: toObjByDates(byDate, fechas),
    }))
    .sort((a, b) => (b.totalRecibido || 0) - (a.totalRecibido || 0));

  // —— BLOQUE INSTITUCIONES + CENTROS (juntos)
  const instCentroArr = Array.from(instCentroAgg.values())
    .map(({ nombre, tipo, total, byDate }) => ({
      entidad: nombre,
      tipo, // "Institución" | "Centro"
      totalRecibido: Number(total.toFixed(2)),
      porFecha: toObjByDates(byDate, fechas),
    }))
    .sort((a, b) => (b.totalRecibido || 0) - (a.totalRecibido || 0));

  // —— JSON final (para logs y para derivar el PDF)
  const salida = {
    transferenciaId: tid,
    fechas,
    categorias: [
      {
        categoria: "subtotalAutores",
        label: "Autores",
        totalPagadoHastaLaFecha: Number(totalAutoresSubtotal.toFixed(2)),
        porFecha: porFechaAutoresObj,
      },
      {
        categoria: "subtotalInstituciones",
        label: "Instituciones (subtotal de cabecera)",
        totalPagadoHastaLaFecha: Number(totalInstSubtotal.toFixed(2)),
        porFecha: porFechaInstObj,
      },
    ],
    autores: autoresArr,                 // detalle SOLO autores por fecha
    institucionesYCentros: instCentroArr,// detalle instituciones+centros por fecha (juntos)
    detallePagos,
  };

  // —— PRINT JSON + TABLAS (igual que antes)
  console.log(
    "📋 Distribución (autores + centros/instituciones) [JSON]:\n",
    JSON.stringify(salida, null, 2)
  );
  console.table(
    salida.categorias.map((c) => ({
      categoria: c.label,
      total: c.totalPagadoHastaLaFecha,
      ...c.porFecha,
    }))
  );
  console.table(
    salida.autores.map((a) => ({ autor: a.autor, total: a.totalRecibido, ...a.porFecha }))
  );
  console.table(
    salida.institucionesYCentros.map((e) => ({
      entidad: `${e.entidad} (${e.tipo})`,
      total: e.totalRecibido,
      ...e.porFecha,
    }))
  );

  // ———————————————————————————————————————————————————————————————
  // 🆕 GENERAR Y ABRIR EL PDF EN LOCAL (DESPUÉS DE LOS LOGS)
  // Construimos un "resultado" con la misma forma que espera <DistribucionFinalPdf />
  const autoresForPdf = salida.autores.map((a) => ({
    nombrePersona: a.autor,
    montoAutor: a.totalRecibido,
    porFecha: a.porFecha,
  }));

  const centrosForPdf = salida.institucionesYCentros
    .filter((e) => e.tipo === "Centro")
    .map((e) => ({
      nombreCentro: e.entidad,
      montoCentro: e.totalRecibido,
      porFecha: e.porFecha,
    }));

  const institucionesForPdf = salida.institucionesYCentros
    .filter((e) => e.tipo === "Institución")
    .map((e) => ({
      nombreBenef: e.entidad,
      montoBenefInst: e.totalRecibido,
      porFecha: e.porFecha,
    }));

  const resultadoLike = {
    nombreTecnologia: `Transferencia #${tid}`,
    codigoResolucion: "—",
    fechas: salida.fechas, // 👈 columnas dinámicas
    autores: autoresForPdf,
    centros: centrosForPdf,
    instituciones: institucionesForPdf,
    porFechaAutores: salida.categorias?.[0]?.porFecha || {},
    porFechaInstituciones: salida.categorias?.[1]?.porFecha || {},
    subtotalAutores: salida.categorias?.[0]?.totalPagadoHastaLaFecha || 0,
    subtotalInstituciones: salida.categorias?.[1]?.totalPagadoHastaLaFecha || 0,
    total:
      (salida.categorias?.[0]?.totalPagadoHastaLaFecha || 0) +
      (salida.categorias?.[1]?.totalPagadoHastaLaFecha || 0),
  };

  await generateAndOpenDistribucionPdf(resultadoLike);
}

// ——————————————————— Flujo principal ———————————————————
/**
 * Imprime el resumen y ejecuta el orquestador RTK por cada pago filtrado.
 *
 * @param {Array<any>} registros   Lista local (opcional). Se usa solo para el resumen de arriba.
 * @param {any} item               Debe traer item.id (idTT)
 * @param {{ computeDistribucion: Function }} options  ← trigger del hook RTK
 */
export async function logResumenPagos(registros = [], item = null, options = {}) {
  const resumen = buildResumenPagos(registros, item);
  const title =
    `📊 Resumen de Pagos` +
    (resumen.transferenciaId ? ` (TT #${resumen.transferenciaId})` : "");

  console.groupCollapsed(title);
  console.log("Metadatos:", {
    transferenciaId: resumen.transferenciaId,
    transferenciaNombre: resumen.transferenciaNombre,
  });
  console.log("Totales:", {
    cantidadRegistros: resumen.cantidadRegistros,
    totalPagado: resumen.totalPagado,
    primerPagoISO: resumen.primerPagoISO,
    ultimoPagoISO: resumen.ultimoPagoISO,
  });

  if (resumen.porUsuario?.length) {
    console.log("— Por usuario (suma y cantidad) —");
    console.table(resumen.porUsuario);
  }

  if (resumen.registros?.length) {
    console.log("— Detalle de registros —");
    console.table(resumen.registros);
  }
  console.groupEnd();

  // 1) Traer todos los registros de pago filtrados por la TT (desde backend)
  const { finalData } = await logGetAllRegistrosPago(resumen.transferenciaId);

  // 2) Ejecutar el orquestador EXACTAMENTE como en tu ejemplo (por cada pago filtrado)
  await runDistribucionTablaForPagos(finalData, resumen.transferenciaId, options);
}
