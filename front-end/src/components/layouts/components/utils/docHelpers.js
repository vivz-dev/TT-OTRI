// /src/pages/layouts/components/utils/docHelpers.js
// =========================
// Utils (compartidos)
// =========================
export const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const parseDate = (d) => {
  try {
    const t = new Date(d);
    return isNaN(t.getTime()) ? null : t;
  } catch {
    return null;
  }
};

// Presentación bonita desde YYYY-MM-DD
export const fmtFecha = (ymd) => {
  if (!ymd) return "Sin fecha";
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Clave ordenable YYYY-MM-DD
export const fmtYMD = (d) => {
  const t = parseDate(d);
  if (!t) return null;
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/** Helper para columna por fecha */
export const valueOnDate = (obj, dateKey) => {
  const v = obj?.[dateKey];
  return money(toNumber(v));
};

// —— Autores (nombre/monto)
export function getNombreBenef(x) {
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

export function getMontoBenef(x) {
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

// —— Institución
export function getNombreInstitucion(x) {
  if (x?.nombreBenef) return String(x.nombreBenef);
  return (
    x?.institucionNombre ??
    x?.denominacion ??
    x?.razonSocial ??
    x?.sigla ??
    "—"
  );
}
export function getMontoInstitucion(x) {
  if (Number.isFinite(Number(x?.montoBenefInst))) return Number(x.montoBenefInst);
  return toNumber(x?.monto ?? x?.valor ?? x?.total);
}

// —— Centro
export function getNombreCentro(x) {
  if (x?.nombreCentro) return String(x.nombreCentro);
  return "—";
}
export function getMontoCentro(x) {
  if (Number.isFinite(Number(x?.montoCentro))) return Number(x.montoCentro);
  return toNumber(x?.monto ?? x?.valor ?? x?.total);
}
