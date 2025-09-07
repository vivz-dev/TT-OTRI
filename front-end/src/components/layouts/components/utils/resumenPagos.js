
import React from "react";
import * as ReactPDF from "@react-pdf/renderer";
import { ensureAppJwt } from "../../../../services/api";

import { toNumber, parseDate } from "./docHelpers";
import { DistribucionFinalPdf } from "./distribucionPdf";
import { runDistribucionTablaForPagos } from "./docOrquestrator";

// >>> Polyfill mínimo para Buffer en navegador (sin crear archivos nuevos)
import { Buffer as BufferPolyfill } from "buffer";
/* eslint-env browser */
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = BufferPolyfill;
}
// <<< fin polyfill


/* =========================
   Parámetros de configuración
   ========================= */
export const DATES_PER_BLOCK = 3;  // cantidad de fechas por bloque/página
export const DATE_ORDER = "asc";   // "asc" | "desc"

/* =========================
   Resumen
   ========================= */
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
    fechaISO: parseDate(r?.createdAt),
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
    primerPagoISO: primerPago,
    ultimoPagoISO: ultimoPago,
    porUsuario,
    registros: detalleRegistros,
  };
}

/* =========================
   GET y filtro
   ========================= */
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

/* =========================
   Generación y apertura local
   ========================= */
export async function generateAndOpenDistribucionPdf(resultadoLike) {
  try {
    // 1) ordenar fechas según parámetro
    const allFechas = Array.isArray(resultadoLike?.fechas) ? [...resultadoLike.fechas] : [];
    allFechas.sort((a, b) =>
      DATE_ORDER === "desc" ? b.localeCompare(a) : a.localeCompare(b)
    );

    // 2) chunk en bloques de DATES_PER_BLOCK
    const bloquesFechas = [];
    if (allFechas.length === 0) {
      bloquesFechas.push([]); // sin fechas, al menos 1 página
    } else {
      for (let i = 0; i < allFechas.length; i += DATES_PER_BLOCK) {
        bloquesFechas.push(allFechas.slice(i, i + DATES_PER_BLOCK));
      }
    }

    // 3) construir el documento con una página por bloque
    const doc = (
      <DistribucionFinalPdf
        data={resultadoLike}
        bloquesFechas={bloquesFechas}
        totalFechas={allFechas.length}
      />
    );

    // 4) abrir en local
    const blob = await ReactPDF.pdf(doc).toBlob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error("[PDF] Error generando PDF:", e);
    alert("No se pudo generar el PDF: " + String(e?.message || e));
  }
}

/* =========================
   Flujo principal
   ========================= */
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

  const { finalData } = await logGetAllRegistrosPago(resumen.transferenciaId);
  await runDistribucionTablaForPagos(finalData, resumen.transferenciaId, options);
}
