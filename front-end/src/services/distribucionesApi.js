// src/services/distribucionesApi.js
/**
 * RTK Query – Distribuciones de Resolución
 * ----------------------------------------
 *  • GET    /resoluciones/:idResolucion/distribuciones
 *  • GET    /distribuciones/:id
 *  • POST   /resoluciones/:idResolucion/distribuciones
 *  • PATCH  /distribuciones/:id
 *
 *  Regla pedida:
 *   - Si MontoMaximo viene null/undefined/'' => enviar 0 al backend
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt, getIdPersonaFromAppJwt } from './api';
import { removeNullish, coalesceZero } from './_utils';

/* ==============================
   Config base
   ============================== */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ==============================
   Base query con App JWT y reauth
   ============================== */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt();
    headers.set('Authorization', `Bearer ${appToken}`);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && [401, 403].includes(result.error.status)) {
    try {
      await ensureAppJwt();
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }
  return result;
};

/* ==============================
   API RTK Query
   ============================== */
export const distribucionesApi = createApi({
  reducerPath: 'distribucionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Distribution'],
  endpoints: (builder) => ({

    /* ---------- LISTA POR RESOLUCIÓN ---------- */
    getDistributionsByResolution: builder.query({
      query: (idResolucion) => `/resoluciones/${idResolucion}/distribuciones`,
      providesTags: (result, _err, idResolucion) => {
        const baseTag = { type: 'Distribution', id: `RES-${idResolucion}` };
        return result
          ? [baseTag, ...result.map((x) => ({ type: 'Distribution', id: x.id ?? x.Id }))]
          : [baseTag];
      },
    }),

    /* ---------- POR ID ---------- */
    getDistributionById: builder.query({
      query: (id) => `/distribuciones/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Distribution', id }],
    }),

    /* ---------- CREAR (MMax coalesced a 0) ---------- */
    createDistribution: builder.mutation({
      /**
       * Args:
       *   { idResolucion, body: { MontoMaximo, MontoMinimo, PorcSubtotalAutores, PorcSubtotalInstitut } }
       *
       * Reglas:
       *  - Si MontoMaximo es null/undefined/'' => enviar 0
       *  - Se inyecta IdUsuarioCrea desde el App JWT
       */
      query: ({ idResolucion, body }) => {
        const IdUsuarioCrea = getIdPersonaFromAppJwt() ?? null;

        const raw = {
          IdResolucion: body?.IdResolucion ?? idResolucion,
          MontoMaximo: coalesceZero(body?.MontoMaximo), // <<--- AQUÍ
          MontoMinimo: Number(body?.MontoMinimo ?? 0),
          PorcSubtotalAutores: Number(body?.PorcSubtotalAutores ?? 0),
          PorcSubtotalInstitut: Number(body?.PorcSubtotalInstitut ?? 0),
          IdUsuarioCrea,
        };

        const cleaned = removeNullish(raw);

        // DEBUG
        console.debug('[createDistribution] POST body (coalesced):', cleaned);

        return {
          url: `/resoluciones/${idResolucion}/distribuciones`,
          method: 'POST',
          body: cleaned,
        };
      },
      invalidatesTags: (_res, _err, { idResolucion }) => [
        { type: 'Distribution', id: `RES-${idResolucion}` },
      ],
    }),

    /* ---------- PATCH ---------- */
    patchDistribution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/distribuciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id, idResolucion }) => {
        const tags = [{ type: 'Distribution', id }];
        if (idResolucion != null) tags.push({ type: 'Distribution', id: `RES-${idResolucion}` });
        return tags;
      },
    }),

  }),
});

/* Hooks */
export const {
  useGetDistributionsByResolutionQuery,
  useGetDistributionByIdQuery,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} = distribucionesApi;
