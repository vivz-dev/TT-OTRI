/**
 * RTK Query – Sublicenciamientos
 *
 * Campos:
 * {
 *   idSublicenciamiento, idLicenciamiento, licenciasMinimas, licenciasMaximas,
 *   porcEspol, porcReceptor, fechaCreacion, ultimoCambio
 * }
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const sublicenciamientosApi = createApi({
  reducerPath: 'sublicenciamientosApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Sublicenciamiento'],
  endpoints: (builder) => ({
    /* ---------- GET (todos) ---------- */
    getSublicenciamientos: builder.query({
      query: () => '/sublicenciamientos',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idSublicenciamiento }) => ({
                type: 'Sublicenciamiento',
                id: idSublicenciamiento,
              })),
              { type: 'Sublicenciamiento', id: 'LIST' },
            ]
          : [{ type: 'Sublicenciamiento', id: 'LIST' }],
    }),

    /* ---------- GET (por ID) ---------- */
    getSublicenciamientoById: builder.query({
      query: (id) => `/sublicenciamientos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sublicenciamiento', id }],
    }),

    /* ---------- POST (crear) ---------- */
    createSublicenciamiento: builder.mutation({
      query: (body) => ({
        url: '/sublicenciamientos',
        method: 'POST',
        body, // { idLicenciamiento, licenciasMinimas?, licenciasMaximas?, porcEspol?, porcReceptor? }
      }),
      invalidatesTags: [{ type: 'Sublicenciamiento', id: 'LIST' }],
    }),

    /* ---------- PATCH (parcial) ---------- */
    patchSublicenciamiento: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sublicenciamientos/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Sublicenciamiento', id }],
    }),
  }),
});

export const {
  useGetSublicenciamientosQuery,
  useGetSublicenciamientoByIdQuery,
  useCreateSublicenciamientoMutation,
  usePatchSublicenciamientoMutation,
} = sublicenciamientosApi;
