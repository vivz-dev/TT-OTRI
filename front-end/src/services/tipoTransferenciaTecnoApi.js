// src/services/tipoTransferenciaTecnoApi.js
/**
 * RTK Query – TipoTransferenciaTecno
 * Join explícito entre la relación (tipotransferenciatecno) y el catálogo (tipos-transferencia).
 *
 * Endpoints clave:
 *  - getTiposTransferenciaTecnoByTT(idTT)        -> Array<TipoTransferencia>   ✅ (EL QUE QUIERES USAR)
 *  - getTiposTransferenciaTecnoJoinByTT(idTT)    -> Array<{ relacion, tipo }>  (solo para debug/inspección)
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { tipoTransferenciaApi } from "./tipoTransferenciaApi";

/* ------------------------------- Helpers ------------------------------- */
const toNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
};

/** Obtiene una propiedad probando múltiples claves (para tolerar PascalCase/camelCase) */
function getProp(obj, keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

export function filterByTransferenciaTecnologica(list, idTT) {
  const idNum = toNum(idTT);
  return Array.isArray(list)
    ? list.filter(
        (x) =>
          toNum(getProp(x, ["idTransferenciaTecnologica", "IdTransferenciaTecnologica"])) === idNum
      )
    : [];
}

/* ----------------------------------- API ----------------------------------- */
export const tipoTransferenciaTecnoApi = createApi({
  reducerPath: "tipoTransferenciaTecnoApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TipoTransferenciaTecno", "TipoTransferencia"],
  endpoints: (builder) => ({
    /* ---------- GET (Todos) ---------- */
    getTiposTransferenciaTecno: builder.query({
      query: () => "/tipotransferenciatecno",
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({
                type: "TipoTransferenciaTecno",
                id: getProp(item, ["Id", "id"]),
              })),
              { type: "TipoTransferenciaTecno", id: "LIST" },
            ]
          : [{ type: "TipoTransferenciaTecno", id: "LIST" }],
    }),

    /* ---------- GET (por ID) ---------- */
    getTipoTransferenciaTecnoById: builder.query({
      query: (id) => `/tipotransferenciatecno/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "TipoTransferenciaTecno", id },
      ],
    }),

    /* ---------- POST ---------- */
    createTipoTransferenciaTecno: builder.mutation({
      query: (body) => ({
        url: "/tipotransferenciatecno",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TipoTransferenciaTecno", id: "LIST" }],
    }),

    /* ---------- PATCH ---------- */
    patchTipoTransferenciaTecno: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tipotransferenciatecno/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "TipoTransferenciaTecno", id },
        { type: "TipoTransferenciaTecno", id: "LIST" },
      ],
    }),

    /* ---------- DELETE ---------- */
    deleteTipoTransferenciaTecno: builder.mutation({
      query: (id) => ({
        url: `/tipotransferenciatecno/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "TipoTransferenciaTecno", id },
        { type: "TipoTransferenciaTecno", id: "LIST" },
      ],
    }),

    /* ---------- GET (por TT) -> SOLO tipos (Array<TipoTransferencia>) ---------- */
    getTiposTransferenciaTecnoByTT: builder.query({
      // Devuelve EXACTAMENTE el array plano de objetos TipoTransferencia
      async queryFn(idTT, api, extraOptions, baseQuery) {
        const idNum =
          typeof idTT === "object" && idTT !== null
            ? toNum(getProp(idTT, ["id", "Id", "ID"]))
            : toNum(idTT);

        if (!Number.isFinite(idNum) || idNum <= 0) {
          return { data: [] };
        }

        // 1) Traer TODAS las relaciones
        const relRes = await baseQuery(
          { url: "/tipotransferenciatecno" },
          api,
          extraOptions
        );
        if (relRes.error) {
          return { error: relRes.error };
        }

        const relacionados = filterByTransferenciaTecnologica(relRes.data, idNum);

        // 2) Por cada relación obtener su "idTipoTransferenciaTecnologica"
        const tipoIds = Array.from(
          new Set(
            relacionados
              .map((r) =>
                toNum(
                  getProp(r, [
                    "idTipoTransferenciaTecnologica",
                    "IdTipoTransferenciaTecnologica",
                  ])
                )
              )
              .filter((n) => Number.isFinite(n))
          )
        );


        if (tipoIds.length === 0) return { data: [] };

        // 3) Traer cada Tipo por id (primero cache RTKQ, luego fallback REST)
        const fetched = await Promise.all(
          tipoIds.map(async (id) => {
            try {
              const init = api.dispatch(
                tipoTransferenciaApi.endpoints.getTipoTransferenciaById.initiate(
                  id,
                  { forceRefetch: false }
                )
              );
              const data = await init.unwrap();
              return { id, ok: true, data };
            } catch (err) {
              console.log(
                `[TiposByTT] cache miss id=${id}; fallback GET /tipos-transferencia/${id}`,
                err
              );
              const res = await baseQuery(
                { url: `/tipos-transferencia/${id}` },
                api,
                extraOptions
              );
              if (res.error) return { id, ok: false, error: res.error };
              return { id, ok: true, data: res.data };
            }
          })
        );

        // 4) Solo los OK y en un array plano (formato TIPOS -> […])
        const tipos = fetched.filter((x) => x.ok).map((x) => x.data);
        return { data: tipos };
      },
      providesTags: (result, _e, idTT) => {
        const idStr =
          typeof idTT === "object" && idTT !== null
            ? getProp(idTT, ["id", "Id", "ID"])
            : idTT;
        const base = [{ type: "TipoTransferencia", id: `TT_${idStr}` }];
        if (!Array.isArray(result)) return base;
        return [
          ...base,
          ...result
            .filter((t) => t && t.id != null)
            .map((t) => ({ type: "TipoTransferencia", id: t.id })),
        ];
      },
    }),

    /* ---------- GET (por TT) -> JOIN {relacion, tipo} (solo debug) ---------- */
    getTiposTransferenciaTecnoJoinByTT: builder.query({
      async queryFn(idTT, api, extraOptions, baseQuery) {
        const idNum =
          typeof idTT === "object" && idTT !== null
            ? toNum(getProp(idTT, ["id", "Id", "ID"]))
            : toNum(idTT);

        if (!Number.isFinite(idNum) || idNum <= 0) return { data: [] };

        // 1) Todas las relaciones
        const relRes = await baseQuery(
          { url: "/tipotransferenciatecno" },
          api,
          extraOptions
        );
        if (relRes.error) {
          return { error: relRes.error };
        }

        const relacionados = filterByTransferenciaTecnologica(relRes.data, idNum);

        if (!relacionados.length) return { data: [] };

        // 2) Traer tipos por id (cache -> fallback)
        const ids = Array.from(
          new Set(
            relacionados
              .map((r) =>
                toNum(
                  getProp(r, [
                    "idTipoTransferenciaTecnologica",
                    "IdTipoTransferenciaTecnologica",
                  ])
                )
              )
              .filter((n) => Number.isFinite(n))
          )
        );

        const fetched = await Promise.all(
          ids.map(async (id) => {
            try {
              const init = api.dispatch(
                tipoTransferenciaApi.endpoints.getTipoTransferenciaById.initiate(
                  id,
                  { forceRefetch: false }
                )
              );
              const data = await init.unwrap();
              return { id, ok: true, data };
            } catch (err) {
              console.log(
                `[JoinByTT] cache miss id=${id}; fallback GET /tipos-transferencia/${id}`,
                err
              );
              const res = await baseQuery(
                { url: `/tipos-transferencia/${id}` },
                api,
                extraOptions
              );
              if (res.error) return { id, ok: false, error: res.error };
              return { id, ok: true, data: res.data };
            }
          })
        );

        const mapById = new Map(
          fetched.filter((x) => x.ok).map((x) => [x.id, x.data])
        );

        const joined = relacionados.map((rel) => {
          const tipoId = toNum(
            getProp(rel, [
              "idTipoTransferenciaTecnologica",
              "IdTipoTransferenciaTecnologica",
            ])
          );
          const tipo = mapById.get(tipoId) ?? null;
          return { relacion: rel, tipo };
        });

        return { data: joined };
      },
      providesTags: (result, _e, idTT) => {
        const idStr =
          typeof idTT === "object" && idTT !== null
            ? getProp(idTT, ["id", "Id", "ID"])
            : idTT;
        const base = [
          { type: "TipoTransferencia", id: `TTJOIN_${idStr}` },
          { type: "TipoTransferenciaTecno", id: `TTJOIN_${idStr}` },
        ];
        if (!Array.isArray(result)) return base;
        return [
          ...base,
          ...result
            .filter((row) => row?.relacion && getProp(row.relacion, ["Id", "id"]) != null)
            .map((row) => ({
              type: "TipoTransferenciaTecno",
              id: getProp(row.relacion, ["Id", "id"]),
            })),
          ...result
            .filter((row) => row?.tipo?.id != null)
            .map((row) => ({ type: "TipoTransferencia", id: row.tipo.id })),
        ];
      },
    }),
  }),
});

/* --------------------------------- Hooks --------------------------------- */
export const {
  useGetTiposTransferenciaTecnoQuery,
  useGetTipoTransferenciaTecnoByIdQuery,
  useCreateTipoTransferenciaTecnoMutation,
  usePatchTipoTransferenciaTecnoMutation,
  useDeleteTipoTransferenciaTecnoMutation,
  useGetTiposTransferenciaTecnoByTTQuery,      // ✅ Array<TipoTransferencia>
  useGetTiposTransferenciaTecnoJoinByTTQuery,  // Array<{ relacion, tipo }>
} = tipoTransferenciaTecnoApi;
