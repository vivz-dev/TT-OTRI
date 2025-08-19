/**
 * RTK Query – DistribBenefInstituciones
 * -------------------------------------
 *  • GET    /distrib-benef-instituciones
 *  • GET    /distrib-benef-instituciones/:id
 *  • POST   /distrib-benef-instituciones
 *  • PATCH  /distrib-benef-instituciones/:id
 *  • DELETE /distrib-benef-instituciones/:id
 *
 *  TagType: DistribBenefInstitucion
 *
 *  Requisitos:
 *  - src/services/api.js con ensureAppJwt() (MSAL + /auth/exchange → { token }).
 *  - Backend expone /api/** y /api/auth/exchange.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

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
      await ensureAppJwt(); // fuerza renovación
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
export const distribBenefInstitucionesApi = createApi({
  reducerPath: 'distribBenefInstitucionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DistribBenefInstitucion'],
  endpoints: (builder) => ({

    /* ---------- LISTAR TODO ---------- */
    getAllDistribBenefInstituciones: builder.query({
      query: () => `/distrib-benef-instituciones`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'DistribBenefInstitucion', id: x.idDistribBenefInstitucion })),
              { type: 'DistribBenefInstitucion', id: 'LIST' },
            ]
          : [{ type: 'DistribBenefInstitucion', id: 'LIST' }],
    }),

    /* ---------- OBTENER POR ID ---------- */
    getDistribBenefInstitucionById: builder.query({
      query: (id) => `/distrib-benef-instituciones/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'DistribBenefInstitucion', id }],
    }),

    /* ---------- CREAR ---------- */
    createDistribBenefInstitucion: builder.mutation({
      // body: DistribBenefInstitucionCreateDto
      query: (body) => ({
        url: `/distrib-benef-instituciones`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DistribBenefInstitucion', id: 'LIST' }],
    }),

    /* ---------- PATCH ---------- */
    patchDistribBenefInstitucion: builder.mutation({
      // args: { id, body: DistribBenefInstitucionPatchDto }
      query: ({ id, body }) => ({
        url: `/distrib-benef-instituciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'DistribBenefInstitucion', id },
        { type: 'DistribBenefInstitucion', id: 'LIST' },
      ],
    }),

    /* ---------- DELETE ---------- */
    deleteDistribBenefInstitucion: builder.mutation({
      query: (id) => ({
        url: `/distrib-benef-instituciones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'DistribBenefInstitucion', id },
        { type: 'DistribBenefInstitucion', id: 'LIST' },
      ],
    }),

  }),
});

/* Hooks auto-generados ------------------------------------ */
export const {
  useGetAllDistribBenefInstitucionesQuery,
  useGetDistribBenefInstitucionByIdQuery,
  useCreateDistribBenefInstitucionMutation,
  usePatchDistribBenefInstitucionMutation,
  useDeleteDistribBenefInstitucionMutation,
} = distribBenefInstitucionesApi;
