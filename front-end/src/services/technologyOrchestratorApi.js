// src/services/technologyOrchestratorApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, normalizeId } from "./baseQuery";
import { getIdPersonaFromAppJwt } from "./api";

const ID_NO_APLICA = 8;
const DEBUG_ORCHESTRATOR = true;

const isNullish = (v) => v === null || v === undefined;

const mapEstadoToCode = (v) => {
  if (!v) return "D";
  const s = String(v).trim();
  if (s.toUpperCase() === "D") return "D";
  if (s.toUpperCase() === "N") return "N";
  if (/^dispon/i.test(s)) return "D";
  if (/no\s*dispon/i.test(s)) return "N";
  return "D";
};

const resolveMaybePromise = async (fn) => {
  try {
    const v = fn();
    return v && typeof v.then === "function" ? await v : v;
  } catch {
    return null;
  }
};

/** ───────────── extractores del payload unificado ───────────── **/
const extractTecnologia = (data) => {
  if (data?.tecnologia) return data.tecnologia;
  return {
    idPersona: data?.idPersona,
    titulo: data?.titulo,
    descripcion: data?.descripcion,
    estado: data?.estado,
    cotitularidad: data?.cotitularidad,
  };
};

const extractProtecciones = (data) => {
  if (Array.isArray(data?.protecciones)) return data.protecciones;

  const tiposSel = Array.isArray(data?.tiposSeleccionados) ? data.tiposSeleccionados : [];
  const fechas = data?.fechasConcesion || {};
  return tiposSel
    .map((t) => Number(t))
    .filter((t) => Number.isFinite(t) && t !== ID_NO_APLICA)
    .map((idTipoProteccion) => ({
      idTipoProteccion,
      fechaSolicitud: fechas?.[String(idTipoProteccion)] ?? fechas?.[idTipoProteccion] ?? null,
    }));
};

const extractArchivos = (data) => {
  if (Array.isArray(data?.archivos)) return data.archivos;

  // retrocompat: archivosPorProteccion + fechasConcesion
  const map = data?.archivosPorProteccion || {};
  const fechas = data?.fechasConcesion || {};
  const out = [];
  for (const [k, arr] of Object.entries(map)) {
    const idTipoProteccion = Number(k);
    if (!Number.isFinite(idTipoProteccion) || idTipoProteccion === ID_NO_APLICA) continue;
    const items = Array.isArray(arr) ? arr : [];
    for (const it of items) {
      const file =
        (typeof File !== "undefined" && it instanceof File) ? it
        : it?.file || null;
      const fecha = it?.fecha ?? fechas?.[String(idTipoProteccion)] ?? null;
      out.push({ idTipoProteccion, file, fecha });
    }
  }
  return out;
};

// Body correcto para TecnologiaCreate/Patch (camelCase)
const buildTecnologiaBody = async (dataTecnologia, completadoFlag) => {
  const idPersona =
    dataTecnologia?.idPersona ?? (await resolveMaybePromise(getIdPersonaFromAppJwt));
  const estado = mapEstadoToCode(dataTecnologia?.estado);

  const body = {
    idPersona: idPersona ?? null,
    titulo: dataTecnologia?.titulo ?? "",
    descripcion: dataTecnologia?.descripcion ?? "",
    estado,
    completado: !!completadoFlag, // DTO: Completado
    cotitularidad: !!dataTecnologia?.cotitularidad,
  };

  if (DEBUG_ORCHESTRATOR) console.log("[ORCH] Body /tecnologias =>", body);
  return body;
};

const extractId = (obj) =>
  normalizeId(obj) ?? obj?.id ?? obj?.Id ?? obj?.idTecnologia ?? obj?.idTecProteccion ?? null;

/** ───────────── función común para crear/actualizar y crear protecciones ───────────── **/
const runTechFlow = async ({ currentId, data, baseQuery, completedFlag }) => {
  const doPost = (url, body) => baseQuery({ url, method: "POST", body });
  const doPatch = (url, body) => baseQuery({ url, method: "PATCH", body });

  const createdProtectionIds = [];
  const compensateProtections = async () => {
    for (const pid of createdProtectionIds.reverse()) {
      try { await baseQuery({ url: `protecciones/${pid}`, method: "DELETE" }); } catch {}
    }
  };

  // 0) extraer payload
  const tecnologia = extractTecnologia(data || {});
  const protIn = extractProtecciones(data || {}); // [{ idTipoProteccion, fechaSolicitud }]

  // 1) upsert tecnología con flag
  const techBody = await buildTecnologiaBody(tecnologia, completedFlag);
  let techId = currentId ?? null;

  if (!techId) {
    const resCreate = await doPost("tecnologias", techBody);
    if (resCreate.error) return { error: resCreate.error };
    techId = extractId(resCreate.data);
    if (!techId) return { error: { status: 500, data: "No se obtuvo id de tecnología." } };
  } else {
    const resPatch = await doPatch(`tecnologias/${techId}`, techBody);
    if (resPatch.error) return { error: resPatch.error };
  }

  if (isNullish(techId)) return { error: { status: 500, data: "Id de tecnología inválido." } };

  // 2) crear protecciones si vienen y son válidas (solo si tenemos idTecnologia)
  const proteccionesCreadas = [];
  for (const p of protIn) {
    const idTipoProteccion = Number(p?.idTipoProteccion);
    if (!Number.isFinite(idTipoProteccion) || idTipoProteccion === ID_NO_APLICA) continue;

    const fecha = p?.fechaSolicitud ?? null;
    if (!fecha) {
      await compensateProtections();
      return { error: { status: 400, data: `Falta fecha para el tipo de protección ${idTipoProteccion}.` } };
    }

    const protBody = {
      idTecnologia: Number(techId),
      idTipoProteccion,
      fechaSolicitud: String(fecha),
    };

    if (DEBUG_ORCHESTRATOR) console.log("[ORCH] Body POST /protecciones =>", protBody);
    const resProt = await doPost("protecciones", protBody);
    if (resProt.error) {
      await compensateProtections();
      return { error: resProt.error };
    }

    const protId = extractId(resProt.data);
    if (protId) createdProtectionIds.push(protId);

    proteccionesCreadas.push({
      id: protId,
      raw: resProt.data,
      tipoId: idTipoProteccion,
      fecha: String(fecha),
    });
  }

  return { data: { id: techId, protecciones: proteccionesCreadas } };
};

/** ───────────── API ───────────── **/
export const technologyOrchestratorApi = createApi({
  reducerPath: "technologyOrchestratorApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /**
     * Guardar borrador: SOLO tecnología (legacy). Se deja por compatibilidad si lo llamas directo.
     */
    saveTechnologyStep: builder.mutation({
      async queryFn({ currentId, data }, _api, _extra, baseQuery) {
        try {
          const tecnologia = extractTecnologia(data || {});
          const body = await buildTecnologiaBody(tecnologia, false);

          if (!currentId) {
            const resCreate = await baseQuery({ url: "tecnologias", method: "POST", body });
            if (resCreate.error) return { error: resCreate.error };
            const id = extractId(resCreate.data);
            if (!id) return { error: { status: 500, data: "No se obtuvo id de tecnología en creación." } };
            return { data: { id, raw: resCreate.data } };
          }

          const resPatch = await baseQuery({ url: `tecnologias/${currentId}`, method: "PATCH", body });
          if (resPatch.error) return { error: resPatch.error };
          return { data: { id: currentId, raw: resPatch.data } };
        } catch (e) {
          return { error: { status: 500, data: e?.message || "Error guardando tecnología." } };
        }
      },
    }),

    /**
     * Nuevo: Upsert con protecciones (completed:false).
     * Úsalo para "Guardar" y enviar TODO lo disponible si se pueden obtener IDs.
     */
    upsertTechnologyWithProtections: builder.mutation({
      async queryFn({ currentId, data }, _api, _extra, baseQuery) {
        try {
          const result = await runTechFlow({ currentId, data, baseQuery, completedFlag: false });
          return result;
        } catch (e) {
          return { error: { status: 500, data: e?.message || "Error guardando (upsert) tecnología." } };
        }
      },
    }),

    /**
     * Finalizar: Upsert con protecciones (completed:true).
     */
    finalizeTechnologyWithProtections: builder.mutation({
      async queryFn({ currentId, data }, _api, _extra, baseQuery) {
        try {
          const result = await runTechFlow({ currentId, data, baseQuery, completedFlag: true });
          return result;
        } catch (e) {
          return { error: { status: 500, data: e?.message || "Error al finalizar tecnología." } };
        }
      },
    }),
  }),
});

export const {
  useSaveTechnologyStepMutation,
  useUpsertTechnologyWithProtectionsMutation,
  useFinalizeTechnologyWithProtectionsMutation,
} = technologyOrchestratorApi;
