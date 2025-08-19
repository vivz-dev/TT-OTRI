// RTK Query – Cotitularidad de Tecnología
// Endpoints backend: /api/cotitularidad-tecno

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const cotitularidadTecnoApi = createApi({
  reducerPath: 'cotitularidadTecnoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CotitularidadTecno'],
  endpoints: (builder) => ({
    getCotitularidadesTecno: builder.query({
      query: () => ({ url: 'cotitularidad-tecno', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'CotitularidadTecno', id: x.id })),
              { type: 'CotitularidadTecno', id: 'LIST' },
            ]
          : [{ type: 'CotitularidadTecno', id: 'LIST' }],
    }),
    getCotitularidadTecnoById: builder.query({
      query: (id) => ({ url: `cotitularidad-tecno/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'CotitularidadTecno', id }],
    }),
    createCotitularidadTecno: builder.mutation({
      query: (body) => ({ url: 'cotitularidad-tecno', method: 'POST', body }),
      invalidatesTags: [{ type: 'CotitularidadTecno', id: 'LIST' }],
    }),
    patchCotitularidadTecno: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `cotitularidad-tecno/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'CotitularidadTecno', id },
        { type: 'CotitularidadTecno', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCotitularidadesTecnoQuery,
  useGetCotitularidadTecnoByIdQuery,
  useCreateCotitularidadTecnoMutation,
  usePatchCotitularidadTecnoMutation,
} = cotitularidadTecnoApi;
