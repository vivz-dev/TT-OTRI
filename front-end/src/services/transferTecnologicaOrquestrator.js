// src/services/transferTecnologicaOrquestrator.js
/**
 * TransferTecnologicaOrquestrator
 * --------------------------------
 * Usa UN solo payload (TTForm.getData()) y procesa:
 *   1) /transfers (POST o PATCH si viene id)
 *   2) /tipotransferenciatecno (relación TT <-> Tipo)
 *   3) /licenciamientos (+ /sublicenciamientos) si tipo === 1 y finalize === true
 *   4) /cesiones si tipo === 2 y finalize === true
 *   5) NUEVO: si licenciaExclusiva === true -> PATCH /tecnologias/:id { estado: 'N' }
 */

import { ensureAppJwt, getIdPersonaFromAppJwt } from './api';

const API_BASE_URL = String(process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');
const ENDPOINTS = {
  transfers: '/transfers',
  tipoTT: '/tipotransferenciatecno',
  licenciamientos: '/licenciamientos',
  sublicenciamientos: '/sublicenciamientos',
  cesiones: '/cesiones',
  tecnologias: '/tecnologias', // 👈 NUEVO
};

/* ============================== Utils ============================== */
const isFiniteNum = (v) => Number.isFinite(Number(v));
const toNumOrNull = (v) => (isFiniteNum(v) ? Number(v) : null);
const asBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
const trimOrNull = (s) => {
  const t = (s ?? '').toString().trim();
  return t.length ? t : null;
};
const removeNullish = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([_, v]) => v !== null && v !== undefined));

function getTransferId(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return (
    obj.id ??
    obj.Id ??
    obj.idTransferenciaTecnologica ??
    obj.IdTransferenciaTecnologica ??
    obj.idOtriTtTransferTecnologica ??
    obj.IdOtriTtTransferTecnologica ??
    null
  );
}

/** Fetch autenticado */
async function apiFetch(path, { method = 'GET', body, debug = false } = {}) {
  const token = await ensureAppJwt();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (debug) console.log(`[API ${method}] ${path}`, { status: res.status, body, data });

  if (!res.ok) {
    const msg = (data && (data.message || data.error || data.title)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

/* ===================== Normalización del payload ===================== */
function normalizeTransferPayload(allData, { finalize }) {
  const tipoId =
    toNumOrNull(allData?.tipo) ??
    toNumOrNull(allData?.idtipoTransferencia) ??
    toNumOrNull(allData?.tipoTransferTecno?.idtipoTransferencia);

  const idResolucion =
    toNumOrNull(allData?.idResolucion) ??
    toNumOrNull(allData?.idOtriTtResolucion) ??
    null;

  const idTecnologia =
    toNumOrNull(allData?.idTecnologia) ??
    toNumOrNull(allData?.idOtriTtTecnologia) ??
    null;

  // UI -> backend
  const idDistribucionResolucion =
    toNumOrNull(allData?.idDistribucion) ??
    toNumOrNull(allData?.idDistribucionResolucion) ??
    null;

  const pago = asBool(allData?.Pago ?? allData?.pago);
  const monto = pago ? Number(allData?.monto ?? 0) : 0;

  let fechaInicio = trimOrNull(allData?.fechaInicio);
  let fechaFin = trimOrNull(allData?.fechaFin);
  const plazo = toNumOrNull(allData?.plazo);

  if (!fechaFin && fechaInicio && isFiniteNum(plazo)) {
    const fi = new Date(fechaInicio);
    const f = new Date(fi);
    f.setDate(fi.getDate() + plazo);
    fechaFin = f.toISOString().slice(0, 10);
  }

  const estado = trimOrNull(allData?.estado) || 'V';

  return {
    ui: {
      tipoId,
      licenciamiento: allData?.licenciamiento || null,
      cesion: allData?.cesion || null,
      sublicencias:
        allData?.licenciamiento?.sublicencias ||
        allData?.licenciamiento?.sublicenciamientos ||
        null,
    },
    transfer: removeNullish({
      id: toNumOrNull(allData?.id),
      idPersona: toNumOrNull(allData?.idPersona),
      idResolucion,
      idTecnologia,
      idDistribucionResolucion,
      monto: isFiniteNum(monto) ? Number(monto) : 0,
      pago,
      completed: Boolean(finalize),
      titulo: trimOrNull(allData?.titulo) || trimOrNull(allData?.nombre),
      descripcion: trimOrNull(allData?.descripcion) || null,
      estado,
      fechaInicio,
      fechaFin,
      plazo: toNumOrNull(allData?.plazo),
    }),
  };
}

/** Normaliza regalías */
function extractRegalias(lic) {
  if (!lic) return {};
  const r = lic.regalias || {};
  const esPorUnidad = r.esPorUnidad ?? (lic.regaliasTipo === 'unidad');
  const esPorcentaje = r.esPorcentaje ?? (lic.regaliasTipo === 'porcentaje');

  const v = r.cantidadUnidad ?? (esPorUnidad ? Number(lic.regaliasValor) : null);
  let p = r.cantidadPorcentaje ?? (esPorcentaje ? Number(lic.regaliasValor) : null);
  if (p != null && Number.isFinite(p) && p > 1) p = p / 100;

  return removeNullish({
    regaliasCantidadUnidad: isFiniteNum(v) ? Number(v) : null,
    regaliasCantidadPorcentaje: isFiniteNum(p) ? Number(p) : null,
    regaliasEsPorUnidad: Boolean(esPorUnidad),
    regaliasEsPorcentaje: Boolean(esPorcentaje),
  });
}

function normalizeSublicencias(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((row) => {
      let porcEsp = row?.porcEspol;
      let porcRec = row?.porcReceptor;
      if (porcEsp != null && Number.isFinite(Number(porcEsp)) && Number(porcEsp) > 1) porcEsp = Number(porcEsp) / 100;
      if (porcRec != null && Number.isFinite(Number(porcRec)) && Number(porcRec) > 1) porcRec = Number(porcRec) / 100;

      return removeNullish({
        licenciasMinimas: toNumOrNull(row?.licenciasMinimas),
        licenciasMaximas: toNumOrNull(row?.licenciasMaximas),
        porcEspol: porcEsp != null ? Number(porcEsp) : null,
        porcReceptor: porcRec != null ? Number(porcRec) : null,
      });
    })
    .filter((x) => Object.keys(x).length > 0);
}

/* ============================== Steps ============================== */
async function createOrPatchTransfer(body, { debug }) {
  if (toNumOrNull(body.id)) {
    const id = Number(body.id);
    const { id: _omit, ...patch } = body;
    return await apiFetch(`${ENDPOINTS.transfers}/${id}`, {
      method: 'PATCH',
      body: patch,
      debug,
    });
  }
  return await apiFetch(ENDPOINTS.transfers, { method: 'POST', body, debug });
}

async function createTipoRelacion(idTT, tipoId, { debug }) {
  if (!isFiniteNum(idTT) || !isFiniteNum(tipoId)) return null;
  const body = {
    idTransferenciaTecnologica: Number(idTT),
    idTipoTransferenciaTecnologica: Number(tipoId),
  };
  return await apiFetch(ENDPOINTS.tipoTT, { method: 'POST', body, debug });
}

async function createLicenciamiento(idTT, lic, fechaFin, { debug }) {
  if (!isFiniteNum(idTT)) return null;
  const regalias = extractRegalias(lic);
  const licBody = removeNullish({
    idTransferTecnologica: Number(idTT),
    subLicenciamiento: asBool(lic?.subLicenciamiento),
    licenciaExclusiva: asBool(lic?.licenciaExclusiva),
    fechaLimite: trimOrNull(lic?.fechaLimite) || trimOrNull(fechaFin) || null,
    ...regalias,
  });
  return await apiFetch(ENDPOINTS.licenciamientos, {
    method: 'POST',
    body: licBody,
    debug,
  });
}

async function createSublicencias(idLicenciamiento, rows, { debug }) {
  if (!isFiniteNum(idLicenciamiento)) return [];
  const norm = normalizeSublicencias(rows);
  const created = [];
  for (const row of norm) {
    const body = removeNullish({ idLicenciamiento: Number(idLicenciamiento), ...row });
    const res = await apiFetch(ENDPOINTS.sublicenciamientos, {
      method: 'POST',
      body,
      debug,
    });
    created.push(res);
  }
  return created;
}

async function createCesion(idTT, cesion, fechaFin, { debug }) {
  if (!isFiniteNum(idTT)) return null;
  const body = removeNullish({
    idOtriTtTransferTecnologica: Number(idTT),
    fechaLimite: trimOrNull(cesion?.fechaLimite) || trimOrNull(fechaFin) || null,
  });
  return await apiFetch(ENDPOINTS.cesiones, {
    method: 'POST',
    body,
    debug,
  });
}

/** 👇 NUEVO: Patch de tecnología a estado 'N' */
async function patchTechnologyEstado(idTecnologia, nuevoEstado, { debug }) {
  if (!isFiniteNum(idTecnologia)) return null;
  const body = { estado: String(nuevoEstado) }; // backend espera char: 'D'/'N'
  return await apiFetch(`${ENDPOINTS.tecnologias}/${Number(idTecnologia)}`, {
    method: 'PATCH',
    body,
    debug,
  });
}

/* ============================== Orquestrador ============================== */
export async function runTransferTecnologicaFlow(allData, { finalize = false, debug = true } = {}) {
  if (debug) {
    console.log('[TT-ORQ] Payload recibido:', allData);
    console.log('[TT-ORQ] finalize =', finalize);
  }

  // 0) Normalizar y completar idPersona si falta
  const norm = normalizeTransferPayload(allData, { finalize });
  if (!norm.transfer.idPersona) {
    try {
      const idP = await getIdPersonaFromAppJwt();
      if (isFiniteNum(idP)) norm.transfer.idPersona = Number(idP);
    } catch (e) {
      console.warn('[TT-ORQ] No se pudo obtener idPersona desde AppJwt:', e);
    }
  }

  // 1) Crear o actualizar Transferencia
  const transferRes = await createOrPatchTransfer(norm.transfer, { debug });
  const transferId = getTransferId(transferRes);
  if (!isFiniteNum(transferId)) throw new Error('No se obtuvo el ID de la transferencia tecnológica');
  if (debug) console.log('[TT-ORQ] Transfer creada/actualizada. ID =', transferId, transferRes);

  // 2) Vincular Tipo <-> TT (si hay tipo)
  let tipoRelacion = null;
  if (isFiniteNum(norm.ui.tipoId)) {
    try {
      tipoRelacion = await createTipoRelacion(transferId, norm.ui.tipoId, { debug });
      if (debug) console.log('[TT-ORQ] Relación tipo creada:', tipoRelacion);
    } catch (e) {
      console.error('[TT-ORQ] Error creando relación TT<->Tipo:', e);
    }
  }

  // Si es solo guardado (borrador), NO creamos hijas
  if (!finalize) {
    return {
      ok: true,
      mode: 'draft',
      transfer: transferRes,
      transferId,
      tipoRelacion,
      licenciamiento: null,
      sublicenciamientos: [],
      cesion: null,
      tecnologiaPatched: null, // 👈 nuevo en el summary
      note: 'Borrador guardado. Entidades hijas se crearán al finalizar.',
    };
  }

  // 3) Entidades hijas según tipo
  let licenciamiento = null;
  let sublicenciamientos = [];
  let cesion = null;
  let tecnologiaPatched = null; // 👈 NUEVO

  if (norm.ui.tipoId === 1) {
    // LICENCIA
    try {
      licenciamiento = await createLicenciamiento(
        transferId,
        norm.ui.licenciamiento,
        norm.transfer.fechaFin,
        { debug }
      );
      const idLic =
        licenciamiento?.id ??
        licenciamiento?.Id ??
        licenciamiento?.idLicenciamiento ??
        licenciamiento?.IdLicenciamiento ??
        null;

      if (isFiniteNum(idLic) && Array.isArray(norm.ui.sublicencias) && norm.ui.sublicencias.length) {
        sublicenciamientos = await createSublicencias(idLic, norm.ui.sublicencias, { debug });
      }

      // 👇 NUEVO: si licencia es EXCLUSIVA => marcar tecnología 'N'
      const isExclusiva = asBool(norm.ui?.licenciamiento?.licenciaExclusiva);
      const idTec = toNumOrNull(norm.transfer?.idTecnologia);
      if (isExclusiva && isFiniteNum(idTec)) {
        try {
          tecnologiaPatched = await patchTechnologyEstado(idTec, 'N', { debug });
          if (debug) console.log('[TT-ORQ] Tecnología marcada como No Disponible (N):', tecnologiaPatched);
        } catch (e) {
          console.error('[TT-ORQ] Error parcheando estado de tecnología a N:', e);
          // decisión: no abortamos la finalización si falla este paso
        }
      }
    } catch (e) {
      console.error('[TT-ORQ] Error creando licenciamiento/sublicencias:', e);
      throw e;
    }
  } else if (norm.ui.tipoId === 2) {
    // CESIÓN
    try {
      cesion = await createCesion(transferId, norm.ui.cesion, norm.transfer.fechaFin, { debug });
    } catch (e) {
      console.error('[TT-ORQ] Error creando cesión:', e);
      throw e;
    }
  }

  return {
    ok: true,
    mode: 'finalized',
    transfer: transferRes,
    transferId,
    tipoRelacion,
    licenciamiento,
    sublicenciamientos,
    cesion,
    tecnologiaPatched, // 👈 se incluye en el resultado
  };
}

/* Export utilitario por si quieres testear aislado */
export function __normalizeForTest(allData, opts) {
  return normalizeTransferPayload(allData, opts || { finalize: false });
}

export default {
  runTransferTecnologicaFlow,
  __normalizeForTest,
};
