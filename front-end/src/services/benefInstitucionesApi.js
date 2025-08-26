// RTK Query — Benef Instituciones API (EXTENDIDO)
// -----------------------------------------------
// Catálogo:
//  • GET    /api/benef-instituciones
//  • GET    /api/benef-instituciones/:id
//  • POST   /api/benef-instituciones
//  • DELETE /api/benef-instituciones/:id
//
// Distribución por Tecnología (QP-only, SIN rutas anidadas):
//  • GET /api/benef-instituciones?tecnologiaId=:id
//  • GET /api/benef-instituciones?IdTecnologia=:id
//  • fallback: GET /api/benef-instituciones  -> filtro en front
//
// Distribución por Acuerdo (se mantienen ambas variantes):
//  • GET /api/acuerdos-distrib-instituciones/:acuerdoId/instituciones
//  • GET /api/benef-instituciones?acuerdoId=:acuerdoId
//
// Requisitos:
//  - ensureAppJwt() en src/services/api.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* Base query con App JWT */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const token = await ensureAppJwt();

  let finalArgs = args;
  if (typeof args === 'string') finalArgs = { url: args, method: 'GET' };

  const headers = new Headers(finalArgs.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  finalArgs.headers = headers;

  return rawBaseQuery(finalArgs, api, extraOptions);
};

export const benefInstitucionesApi = createApi({
  reducerPath: 'benefInstitucionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BenefInstitucion', 'DistribucionInstitucional'],
  endpoints: (builder) => ({

    /* ====== Catálogo ====== */

    getBenefInstituciones: builder.query({
      query: () => ({ url: '/benef-instituciones', method: 'GET' }),
      transformResponse: (res) => res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'BenefInstitucion', id })),
              { type: 'BenefInstitucion', id: 'LIST' },
            ]
          : [{ type: 'BenefInstitucion', id: 'LIST' }],
    }),

    getBenefInstitucion: builder.query({
      query: (id) => ({ url: `/benef-instituciones/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'BenefInstitucion', id }],
    }),

    createBenefInstitucion: builder.mutation({
      query: (body) => ({ url: '/benef-instituciones', method: 'POST', body }),
      invalidatesTags: [{ type: 'BenefInstitucion', id: 'LIST' }],
    }),

    deleteBenefInstitucion: builder.mutation({
      query: (id) => ({ url: `/benef-instituciones/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'BenefInstitucion', id },
        { type: 'BenefInstitucion', id: 'LIST' },
      ],
    }),

    /* ====== Distribución por Tecnología (QP-only, sin anidada) ====== */

    getDistribucionByTecnologia: builder.query({
      async queryFn(idTecnologia, _api, _extra, baseQuery) {
        // 1) QP camelCase
        let res = await baseQuery({
          url: '/benef-instituciones',
          method: 'GET',
          params: { tecnologiaId: idTecnologia },
        });
        if (!res?.error) return { data: Array.isArray(res.data) ? res.data : [] };

        // 2) QP PascalCase
        res = await baseQuery({
          url: '/benef-instituciones',
          method: 'GET',
          params: { IdTecnologia: idTecnologia },
        });
        if (!res?.error) return { data: Array.isArray(res.data) ? res.data : [] };

        // 3) Traer todo y filtrar
        const all = await baseQuery({ url: '/benef-instituciones', method: 'GET' });
        if (all?.error) return { error: all.error };

        const list = Array.isArray(all.data) ? all.data : [];
        const filtered = list.filter((u) => {
          const nums = [u?.idTecnologia, u?.IdTecnologia, u?.tecnologiaId, u?.TecnologiaId]
            .map((v) => Number(v))
            .filter((v) => Number.isFinite(v));
          const found = nums.length ? nums[0] : NaN;
          return Number(found) === Number(idTecnologia);
        });

        return { data: filtered };
      },
      providesTags: (_res, _err, idTecnologia) => [
        { type: 'DistribucionInstitucional', id: `TEC-${idTecnologia}` },
      ],
    }),

    // (Opcional) QP directo explícito
    getDistribucionByTecnologiaQP: builder.query({
      query: (idTecnologia) => ({
        url: `/benef-instituciones`,
        method: 'GET',
        params: { tecnologiaId: idTecnologia },
      }),
      providesTags: (_res, _err, idTecnologia) => [
        { type: 'DistribucionInstitucional', id: `TEC-${idTecnologia}` },
      ],
    }),

    /* ====== Distribución por Acuerdo ====== */

    getDistribucionByAcuerdoId: builder.query({
      query: (acuerdoId) => ({
        url: `/acuerdos-distrib-instituciones/${acuerdoId}/instituciones`,
        method: 'GET',
      }),
      providesTags: (_res, _err, acuerdoId) => [
        { type: 'DistribucionInstitucional', id: `ACU-${acuerdoId}` },
      ],
    }),

    getDistribucionByAcuerdoIdQP: builder.query({
      query: (acuerdoId) => ({
        url: `/benef-instituciones`,
        method: 'GET',
        params: { acuerdoId },
      }),
      providesTags: (_res, _err, acuerdoId) => [
        { type: 'DistribucionInstitucional', id: `ACU-${acuerdoId}` },
      ],
    }),
  }),
});

export const {
  // Catálogo
  useGetBenefInstitucionesQuery,
  useGetBenefInstitucionQuery,
  useCreateBenefInstitucionMutation,
  useDeleteBenefInstitucionMutation,

  // Distribución por Tecnología
  useGetDistribucionByTecnologiaQuery,
  useGetDistribucionByTecnologiaQPQuery,

  // Distribución por Acuerdo
  useGetDistribucionByAcuerdoIdQuery,
  useGetDistribucionByAcuerdoIdQPQuery,
} = benefInstitucionesApi;
