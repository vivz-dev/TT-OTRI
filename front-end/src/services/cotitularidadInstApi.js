// RTK Query – Cotitularidad Institucional
// Endpoints backend: /api/cotitularidad-institucional

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const cotitularidadInstApi = createApi({
  reducerPath: 'cotitularidadInstApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CotitularidadInst'],
  endpoints: (builder) => ({
    getCotitularidadesInst: builder.query({
      query: () => ({ url: 'cotitularidad-institucional', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'CotitularidadInst', id: x.id })),
              { type: 'CotitularidadInst', id: 'LIST' },
            ]
          : [{ type: 'CotitularidadInst', id: 'LIST' }],
    }),
    getCotitularidadInstById: builder.query({
      query: (id) => ({ url: `cotitularidad-institucional/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'CotitularidadInst', id }],
    }),
    createCotitularidadInst: builder.mutation({
      query: (body) => ({ url: 'cotitularidad-institucional', method: 'POST', body }),
      invalidatesTags: [{ type: 'CotitularidadInst', id: 'LIST' }],
    }),
    patchCotitularidadInst: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `cotitularidad-institucional/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'CotitularidadInst', id },
        { type: 'CotitularidadInst', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCotitularidadesInstQuery,
  useGetCotitularidadInstByIdQuery,
  useCreateCotitularidadInstMutation,
  usePatchCotitularidadInstMutation,
} = cotitularidadInstApi;
