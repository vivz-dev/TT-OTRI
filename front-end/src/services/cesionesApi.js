/**
 * RTK Query – Cesiones
 *
 * Campos (camelCase por ASP.NET):
 * {
 *   idOtriTtCesion, idOtriTtTransferTecnologica, fechaLimite,
 *   fechaCreacion, ultimoCambio
 * }
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const cesionesApi = createApi({
  reducerPath: 'cesionesApi',
  baseQuery: baseQueryWithReauth, // baseUrl ya debe apuntar a /api
  tagTypes: ['Cesion'],
  endpoints: (builder) => ({
    /* ---------- GET (todas) ---------- */
    getCesiones: builder.query({
      query: () => '/cesiones',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idOtriTtCesion }) => ({
                type: 'Cesion',
                id: idOtriTtCesion,
              })),
              { type: 'Cesion', id: 'LIST' },
            ]
          : [{ type: 'Cesion', id: 'LIST' }],
    }),

    /* ---------- GET (por ID) ---------- */
    getCesionById: builder.query({
      query: (id) => `/cesiones/${id}`,
      providesTags: (result, error, id) => [{ type: 'Cesion', id }],
    }),

    /* ---------- POST (crear) ---------- */
    createCesion: builder.mutation({
      query: (body) => ({
        url: '/cesiones',
        method: 'POST',
        body, // { idOtriTtTransferTecnologica, fechaLimite? }
      }),
      invalidatesTags: [{ type: 'Cesion', id: 'LIST' }],
    }),

    /* ---------- PATCH (parcial) ---------- */
    patchCesion: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cesiones/${id}`,
        method: 'PATCH',
        body, // { idOtriTtTransferTecnologica?, fechaLimite? }
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Cesion', id }],
    }),
  }),
});

export const {
  useGetCesionesQuery,
  useGetCesionByIdQuery,
  useCreateCesionMutation,
  usePatchCesionMutation,
} = cesionesApi;
