// /src/pages/layouts/components/utils/docHelpers.js
// =========================
// Utils (compartidos)
// =========================

import { ensureAppJwt } from "../../../../services/api";

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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* =========================================================
   Ya existente: obtiene la transferencia y la loguea
   ========================================================= */
export async function fetchTransferById(idTT) {
  const id = Number(idTT);
  if (!Number.isFinite(id)) {
    console.warn("[TT] idTT inválido:", idTT);
    return null;
  }

  try {
    const token = await ensureAppJwt();
    const res = await fetch(`${API_BASE_URL}/transfers/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} – ${msg}`);
    }

    const data = await res.json();
    console.log("[TT] Transferencia obtenida por ID:", data);
    return data;
  } catch (err) {
    console.error("[TT] Error obteniendo transferencia:", err);
    return null;
  }
}

/* =========================================================
   NUEVO: helpers internos con auth para GET JSON
   ========================================================= */
async function authGetJson(path) {
  const token = await ensureAppJwt();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${path} → HTTP ${res.status} ${res.statusText} – ${body}`);
  }
  return res.json();
}

/* =========================================================
   NUEVO: obtiene resolución por id
   ========================================================= */
export async function fetchResolutionById(idResolucion) {
  const rid = Number(idResolucion);
  if (!Number.isFinite(rid)) {
    console.warn("[TT] idResolucion inválido:", idResolucion);
    return null;
  }
  try {
    const data = await authGetJson(`/resoluciones/${rid}`);
    return data;
  } catch (err) {
    console.error("[TT] Error obteniendo resolución:", err);
    return null;
  }
}

/* =========================================================
   NUEVO: obtiene tecnología (RAW) por id
   - Usa el endpoint de tecnologías tal como lo expone tu API
   ========================================================= */
export async function fetchTechnologyRawById(idTecnologia) {
  const tid = Number(idTecnologia);
  if (!Number.isFinite(tid)) {
    console.warn("[TT] idTecnologia inválido:", idTecnologia);
    return null;
  }
  try {
    const data = await authGetJson(`/tecnologias/${tid}`);
    return data; // crudo del backend; si quieres, aquí podrías mapear a "toCardItem"
  } catch (err) {
    console.error("[TT] Error obteniendo tecnología:", err);
    return null;
  }
}

/* =========================================================
   NUEVO: dado idTT → { resolucion, tecnologia }
   - 1) Lee la TT
   - 2) Con idResolucion e idTecnologia, trae ambos objetos
   - 3) Loguea y retorna el paquete
   ========================================================= */
export async function fetchTTDetails(idTT) {
  const tt = await fetchTransferById(idTT);
  if (!tt) {
    console.warn("[TT] No se pudo obtener la transferencia. Devuelvo {resolucion:null, tecnologia:null}");
    const res = { resolucion: null, tecnologia: null };
    console.log("[TT] Detalles TT:", res);
    return res;
  }

  const { idResolucion, idTecnologia } = tt || {};
  const [resolucion, tecnologia] = await Promise.all([
    fetchResolutionById(idResolucion),
    fetchTechnologyRawById(idTecnologia),
  ]);

  const paquete = { resolucion, tecnologia };
  console.log("[TT] Detalles TT (resolución + tecnología):", paquete);
  return paquete;
}
