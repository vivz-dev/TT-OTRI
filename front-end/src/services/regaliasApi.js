/**
 * RTK Query – Regalías
 *
 * Campos:
 * {
 *   id, idTransferenciaTecnologica, cantidadUnidad, cantidadPorcentaje,
 *   esPorUnidad, esPorcentaje, fechaCreacion, ultimoCambio
 * }
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const regaliasApi = createApi({
  reducerPath: 'regaliasApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Regalia'],
  endpoints: (builder) => ({
    /* ---------- GET (todas) ---------- */
    getRegalias: builder.query({
      query: () => '/regalias',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Regalia', id })),
              { type: 'Regalia', id: 'LIST' },
            ]
          : [{ type: 'Regalia', id: 'LIST' }],
    }),

    /* ---------- GET (por ID) ---------- */
    getRegaliaById: builder.query({
      query: (id) => `/regalias/${id}`,
      providesTags: (result, error, id) => [{ type: 'Regalia', id }],
    }),

    /* ---------- POST (crear) ---------- */
    createRegalia: builder.mutation({
      query: (body) => ({
        url: '/regalias',
        method: 'POST',
        body, // RegaliaCreateDto
      }),
      invalidatesTags: [{ type: 'Regalia', id: 'LIST' }],
    }),

    /* ---------- PUT (reemplazo total) ---------- */
    updateRegalia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/regalias/${id}`,
        method: 'PUT',
        body, // RegaliaCreateDto como "update full"
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Regalia', id }],
    }),

    /* ---------- PATCH (parcial) ---------- */
    patchRegalia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/regalias/${id}`,
        method: 'PATCH',
        body, // RegaliaPatchDto
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Regalia', id }],
    }),
  }),
});

export const {
  useGetRegaliasQuery,
  useGetRegaliaByIdQuery,
  useCreateRegaliaMutation,
  useUpdateRegaliaMutation,
  usePatchRegaliaMutation,
} = regaliasApi;
