// RTK Query – Cotitulares
// Endpoints backend: /api/cotitulares

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const cotitularesApi = createApi({
  reducerPath: 'cotitularesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Cotitular'],
  endpoints: (builder) => ({
    getCotitulares: builder.query({
      query: () => ({ url: 'cotitulares', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Cotitular', id: x.id })),
              { type: 'Cotitular', id: 'LIST' },
            ]
          : [{ type: 'Cotitular', id: 'LIST' }],
    }),
    getCotitularById: builder.query({
      query: (id) => ({ url: `cotitulares/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Cotitular', id }],
    }),
    createCotitular: builder.mutation({
      query: (body) => ({ url: 'cotitulares', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cotitular', id: 'LIST' }],
    }),
    // El backend ofrece un PUT completo además del PATCH
    updateCotitular: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `cotitulares/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Cotitular', id },
        { type: 'Cotitular', id: 'LIST' },
      ],
    }),
    patchCotitular: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `cotitulares/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Cotitular', id },
        { type: 'Cotitular', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCotitularesQuery,
  useGetCotitularByIdQuery,
  useCreateCotitularMutation,
  useUpdateCotitularMutation,
  usePatchCotitularMutation,
} = cotitularesApi;
