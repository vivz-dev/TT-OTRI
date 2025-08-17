/**
 * RTK Query – Resolutions / Distributions (con App JWT + reauth)
 * --------------------------------------------------------------
 *  • GET    /resoluciones
 *  • POST   /resoluciones
 *  • PATCH  /resoluciones/:id
 *
 *  • GET    /resoluciones/:id/distribuciones
 *  • POST   /resoluciones/:id/distribuciones
 *  • PATCH  /distribuciones/:id
 *
 *  TagTypes: Resolution | Distribution
 *
 *  Requisitos:
 *  - Haber creado src/services/api.js con ensureAppJwt() (MSAL + /auth/exchange).
 *  - Tu backend expone /api/** y /api/auth/exchange (devuelve { token }).
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api'; // <- reutiliza MSAL + exchange centralizado

/* ==============================
   Config base
   ============================== */
const API_BASE_URL = 'http://localhost:8080/api'; // ← ajusta si tu API usa otro host/puerto

/* ==============================
   Base query con App JWT en headers
   y retry automático ante 401/403
   ============================== */
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

  // Si expiró justo antes o se invalidó, reintenta una vez
  if (result?.error && [401, 403].includes(result.error.status)) {
    try {
      await ensureAppJwt(); // fuerza renovación (MSAL → /auth/exchange)
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      // Si no se pudo renovar, devuelve el error original
      return result;
    }
  }
  return result;
};

/* ==============================
   API RTK Query
   ============================== */
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
              ...result.map(({ id }) => ({ type: 'Resolution', id })),
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
      providesTags: (result, _, resolutionId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Distribution', id })),
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
      invalidatesTags: (_, __, { resolutionId }) => [
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
