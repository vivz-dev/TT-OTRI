// /src/pages/layouts/components/utils/docOrquestrator.js
import { DATE_ORDER } from "./resumenPagos";
import {
  toNumber,
  fmtYMD,
  getNombreBenef,
  getMontoBenef,
  getNombreInstitucion,
  getMontoInstitucion,
  getNombreCentro,
  getMontoCentro,
} from "./docHelpers";
import { generateAndOpenDistribucionPdf } from "./resumenPagos";

/* =========================
   Orquestador RTK + agregados
   ========================= */
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

  // Agregadores detallados
  const autoresAgg = new Map();     // nombre -> { nombre, total, byDate: Map<YYYY-MM-DD, monto> }
  const instCentroAgg = new Map();  // "I:/C:" -> { nombre, tipo, total, byDate: Map<YYYY-MM-DD, monto> }

  const fechasSet = new Set();
  const detallePagos = [];

  for (const p of pagosFiltrados) {
    const idRegistro = p?.idRegistroPago ?? p?.id ?? "—";
    try {
      const monto = toNumber(p?.totalPago);
      const dateKey =
        fmtYMD(p?.createdAt) || fmtYMD(p?.fecha) || fmtYMD(p?.fechaPago) || "s/f";
      if (dateKey !== "s/f") fechasSet.add(dateKey);

      const args = { idTT: tid, montoTotalRegistroPago: monto };
      const data = await computeDistribucion(args).unwrap();

      // SUBTOTALES cabecera
      const sa = toNumber(data?.subtotalAutores);
      const si = toNumber(data?.subtotalInstituciones);

      autoresByDate.set(dateKey, toNumber(autoresByDate.get(dateKey) || 0) + sa);
      instSubtotalByDate.set(dateKey, toNumber(instSubtotalByDate.get(dateKey) || 0) + si);

      // AUTORES
      const autores = Array.isArray(data?.autores) ? data.autores : [];
      for (const a of autores) {
        const nombre = getNombreBenef(a) || "—";
        const valor = toNumber(getMontoBenef(a));

        const prev = autoresAgg.get(nombre) || { nombre, total: 0, byDate: new Map() };
        prev.total += valor;
        prev.byDate.set(dateKey, toNumber(prev.byDate.get(dateKey) || 0) + valor);
        autoresAgg.set(nombre, prev);
      }

      // INSTITUCIONES
      const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
      for (const inst of instituciones) {
        const nombre = getNombreInstitucion(inst);
        const valor = getMontoInstitucion(inst);

        const key = `I:${nombre}`;
        const prev = instCentroAgg.get(key) || { nombre, tipo: "Institución", total: 0, byDate: new Map() };
        prev.total += valor;
        prev.byDate.set(dateKey, toNumber(prev.byDate.get(dateKey) || 0) + valor);
        instCentroAgg.set(key, prev);
      }

      // CENTROS
      const centros = Array.isArray(data?.centros) ? data.centros : [];
      for (const c of centros) {
        const nombre = getNombreCentro(c);
        const valor = getMontoCentro(c);

        const key = `C:${nombre}`;
        const prev = instCentroAgg.get(key) || { nombre, tipo: "Centro", total: 0, byDate: new Map() };
        prev.total += valor;
        prev.byDate.set(dateKey, toNumber(prev.byDate.get(dateKey) || 0) + valor);
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
      console.error("[ERROR] computeDistribucionTabla]:", err);
    }
  }

  // —— Fechas ordenadas (quitamos "s/f") y aplicamos parámetro DATE_ORDER
  let fechas = Array.from(fechasSet.values()).filter((f) => f !== "s/f");
  fechas.sort((a, b) =>
    DATE_ORDER === "desc" ? b.localeCompare(a) : a.localeCompare(b)
  );

  // —— Helper: Map<fecha,monto> -> objeto llano (solo para fechas ordenadas)
  const toObjByDates = (map, orderedDates) => {
    const obj = {};
    for (const f of orderedDates) {
      const v = toNumber(map.get(f) || 0);
      obj[f] = Number(v.toFixed(2));
    }
    return obj;
  };

  // —— Totales de cabecera (subtotales) por fecha
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

  // —— BLOQUE AUTORES (detalle por autor) con desglose por fecha
  const autoresArr = Array.from(autoresAgg.values())
    .map(({ nombre, total, byDate }) => ({
      autor: nombre,
      totalRecibido: Number(total.toFixed(2)),
      porFecha: toObjByDates(byDate, fechas),
    }))
    .sort((a, b) => (b.totalRecibido || 0) - (a.totalRecibido || 0));

  // —— BLOQUE INSTITUCIONES + CENTROS (juntos) con desglose por fecha
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
    transferenciaId: Number(idTT),
    fechas, // ya ordenadas según DATE_ORDER
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

  // ——— Construcción del objeto que consume el PDF
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
    nombreTecnologia: `Transferencia #${Number(idTT)}`,
    codigoResolucion: "—",
    fechas: salida.fechas,
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