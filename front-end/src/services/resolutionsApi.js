/**
 * RTK Query – Resolutions / Distributions (con App JWT + reauth)
 * --------------------------------------------------------------
 *  • GET    /resoluciones
 *  • POST   /resoluciones          -> transformResponse => { id }
 *  • PATCH  /resoluciones/:id
 *
 *  • GET    /resoluciones/:id/distribuciones
 *  • POST   /resoluciones/:id/distribuciones
 *  • PATCH  /distribuciones/:id
 *
 *  TagTypes: Resolution | Distribution
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ---------------- base query con App JWT + reauth ---------------- */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt(); // obtiene/renueva tu JWT interno
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

/* ---------------- helpers ---------------- */
const normalizeId = (resp) => {
  // Acepta varios formatos de respuesta desde el backend
  // 1) objeto { id: 123 } o { Id: 123 } o { idResolucion: 123 }
  // 2) entidad completa con propiedad Id/id
  // 3) valor escalar: 123
  if (resp == null) return null;
  if (typeof resp === 'number') return resp;
  if (typeof resp === 'string') {
    const n = Number(resp);
    return Number.isFinite(n) ? n : null;
  }
  return (
    resp.id ??
    resp.Id ??
    resp.idResolucion ??
    resp.IdResolucion ??
    null
  );
};

/* ---------------- API ---------------- */
export const resolutionsApi = createApi({
  reducerPath: 'resolutionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Resolution', 'Distribution'],
  endpoints: (builder) => ({

    /* ---------- RESOLUCIONES ---------- */
    getResolutions: builder.query({
      query: () => '/resoluciones',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Resolution', id: x.id ?? x.Id })),
              { type: 'Resolution', id: 'LIST' },
            ]
          : [{ type: 'Resolution', id: 'LIST' }],
    }),

    createResolution: builder.mutation({
      query: (body) => ({
        url: '/resoluciones',
        method: 'POST',
        body,
      }),
      // 🔴 CLAVE: normalizamos la respuesta a { id }
      transformResponse: (response, meta) => {
        // Si tu backend está devolviendo la entidad completa, toma el Id.
        // Si devuelve { id }, se respeta.
        // Si devuelve un escalar, lo convertimos.
        const id = normalizeId(response);
        return { id, raw: response, status: meta?.response?.status };
      },
      invalidatesTags: [{ type: 'Resolution', id: 'LIST' }],
    }),

    patchResolution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/resoluciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'Resolution', id },
        { type: 'Resolution', id: 'LIST' },
      ],
    }),

    /* ---------- DISTRIBUCIONES ---------- */
    getDistributionsByResolution: builder.query({
      query: (resolutionId) => `/resoluciones/${resolutionId}/distribuciones`,
      providesTags: (result, _err, resolutionId) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Distribution', id: x.id ?? x.Id })),
              { type: 'Resolution', id: resolutionId },
            ]
          : [{ type: 'Resolution', id: resolutionId }],
    }),

    createDistribution: builder.mutation({
      query: ({ resolutionId, body }) => ({
        url: `/resoluciones/${resolutionId}/distribuciones`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { resolutionId }) => [
        { type: 'Resolution', id: resolutionId },
      ],
    }),

    patchDistribution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/distribuciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Distribution', id }],
    }),

  }),
});

/* Hooks auto-generados -------------------------------------------------- */
export const {
  useGetResolutionsQuery,
  useCreateResolutionMutation,
  usePatchResolutionMutation,
  useGetDistributionsByResolutionQuery,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} = resolutionsApi;
