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

// Llama a fn() y si devuelve promesa, la espera; si lanza, devuelve null.
const resolveMaybePromise = async (fn) => {
  try {
    const v = fn();
    return v && typeof v.then === "function" ? await v : v;
  } catch {
    return null;
  }
};

// Construye el body que espera TecnologiaCreate/PatchDto
const buildTecnologiaBody = async (data, completedFlag) => {
  const idPersona =
    data?.idPersona ?? (await resolveMaybePromise(getIdPersonaFromAppJwt));
  const estado = mapEstadoToCode(data?.estado);

  const body = {
    idPersona: idPersona ?? null,
    titulo: data?.titulo ?? "",
    descripcion: data?.descripcion ?? "",
    estado,                  // 'D' o 'N'
    completed: !!completedFlag,
    cotitularidad: !!data?.cotitularidad,
  };

  if (DEBUG_ORCHESTRATOR) {
    console.log("[ORCH] Body /tecnologias =>", body);
  }
  return body;
};

// Extrae ID de múltiples formas
const extractId = (obj) =>
  normalizeId(obj) ??
  obj?.id ??
  obj?.Id ??
  obj?.idTecnologia ??
  obj?.idTecProteccion ??
  null;

export const technologyOrchestratorApi = createApi({
  reducerPath: "technologyOrchestratorApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /**
     * Guardar (borrador) del step 0:
     * - Si NO hay id => POST /tecnologias (completed: false) y devuelve id.
     * - Si hay id    => PATCH /tecnologias/{id} (completed: false).
     */
    saveTechnologyStep: builder.mutation({
      async queryFn({ currentId, data }, _api, _extra, baseQuery) {
        try {
          const body = await buildTecnologiaBody(data || {}, false);

          if (!currentId) {
            const resCreate = await baseQuery({
              url: "tecnologias",
              method: "POST",
              body,
            });
            if (resCreate.error) return { error: resCreate.error };
            const id = extractId(resCreate.data);
            if (!id) {
              return {
                error: {
                  status: 500,
                  data: "No se obtuvo id de tecnología en creación.",
                },
              };
            }
            return { data: { id, raw: resCreate.data } };
          }

          const resPatch = await baseQuery({
            url: `tecnologias/${currentId}`,
            method: "PATCH",
            body,
          });
          if (resPatch.error) return { error: resPatch.error };
          return { data: { id: currentId, raw: resPatch.data } };
        } catch (e) {
          return {
            error: {
              status: 500,
              data: e?.message || "Error guardando tecnología.",
            },
          };
        }
      },
    }),

    /**
     * Finalizar step 0:
     * - Crea/actualiza tecnología con completed:true
     * - Luego crea TODAS las protecciones seleccionadas (excepto NO_APLICA).
     *   • data.tiposSeleccionados: number[]
     *   • data.fechasConcesion: { [tipoId]: 'YYYY-MM-DD' }
     */
    finalizeTechnologyWithProtections: builder.mutation({
      async queryFn({ currentId, data }, _api, _extra, baseQuery) {
        const doPost = (url, body) => baseQuery({ url, method: "POST", body });
        const doPatch = (url, body) => baseQuery({ url, method: "PATCH", body });

        const createdProtectionIds = [];
        const compensateProtections = async () => {
          for (const pid of createdProtectionIds.reverse()) {
            try {
              await baseQuery({
                url: `tecnologia-protecciones/${pid}`,
                method: "DELETE",
              });
            } catch {
              /* no-op */
            }
          }
        };

        try {
          const techBody = await buildTecnologiaBody(data || {}, true);
          let techId = currentId ?? null;

          // 1) Crear o actualizar tecnología (completed:true)
          if (!techId) {
            const resCreate = await doPost("tecnologias", techBody);
            if (resCreate.error) return { error: resCreate.error };
            techId = extractId(resCreate.data);
            if (!techId) {
              return {
                error: {
                  status: 500,
                  data: "No se obtuvo id de tecnología al finalizar.",
                },
              };
            }
          } else {
            const resPatch = await doPatch(`tecnologias/${techId}`, techBody);
            if (resPatch.error) return { error: resPatch.error };
          }

          // 2) Crear protecciones seleccionadas
          const tiposSel = Array.isArray(data?.tiposSeleccionados)
            ? data.tiposSeleccionados
            : [];
          const fechas = data?.fechasConcesion || {};

          // Filtra NO APLICA (ID 8)
          const tiposParaCrear = tiposSel
            .map((t) => Number(t))
            .filter((t) => Number.isFinite(t) && t !== ID_NO_APLICA);

          if (DEBUG_ORCHESTRATOR) {
            console.log("[ORCH] tiposSeleccionados (raw) =>", tiposSel);
            console.log("[ORCH] tiposParaCrear (sin 8) =>", tiposParaCrear);
            console.log("[ORCH] fechasConcesion =>", fechas);
          }

          if (tiposParaCrear.length === 0) {
            return {
              error: {
                status: 400,
                data:
                  "No hay tipos de protección seleccionados (o solo 'No aplica').",
              },
            };
          }
          if (isNullish(techId)) {
            return {
              error: {
                status: 500,
                data: "Id de tecnología inválido al crear protecciones.",
              },
            };
          }

          const proteccionesCreadas = [];
          for (const tipoId of tiposParaCrear) {
            // Acepta clave numérica o string
            const fecha =
              (fechas && (fechas[String(tipoId)] ?? fechas[tipoId])) || null;

            if (!fecha) {
              await compensateProtections();
              return {
                error: {
                  status: 400,
                  data: `Falta fecha para el tipo de protección ${tipoId}.`,
                },
              };
            }

            // DTO espera FechaSolicitud
            const protBody = {
              IdTecnologia: Number(techId),
              IdTipoProteccion: Number(tipoId), // backend lo mapea a short
              FechaSolicitud: String(fecha), // 'YYYY-MM-DD'
            };

            if (DEBUG_ORCHESTRATOR) {
              console.log("[ORCH] Body /tecnologia-protecciones =>", protBody);
            }

            const resProt = await doPost("tecnologia-protecciones", protBody);
            if (resProt.error) {
              await compensateProtections();
              return { error: resProt.error };
            }

            const protId = extractId(resProt.data);
            if (protId) createdProtectionIds.push(protId);

            proteccionesCreadas.push({
              id: protId,
              raw: resProt.data,
              tipoId: Number(tipoId),
              fecha: String(fecha),
            });
          }

          return { data: { id: techId, protecciones: proteccionesCreadas } };
        } catch (e) {
          await compensateProtections();
          return {
            error: {
              status: 500,
              data: e?.message || "Error al finalizar tecnología.",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useSaveTechnologyStepMutation,
  useFinalizeTechnologyWithProtectionsMutation,
} = technologyOrchestratorApi;
