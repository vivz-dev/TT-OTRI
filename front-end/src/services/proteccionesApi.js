// RTK Query – Protecciones
// Endpoints backend: /api/protecciones

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const proteccionesApi = createApi({
  reducerPath: 'proteccionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Proteccion'],
  endpoints: (builder) => ({
    getProtecciones: builder.query({
      query: () => ({ url: 'protecciones', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Proteccion', id: x.id })),
              { type: 'Proteccion', id: 'LIST' },
            ]
          : [{ type: 'Proteccion', id: 'LIST' }],
    }),
    getProteccionById: builder.query({
      query: (id) => ({ url: `protecciones/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Proteccion', id }],
    }),
    createProteccion: builder.mutation({
      query: (body) => ({ url: 'protecciones', method: 'POST', body }),
      invalidatesTags: [{ type: 'Proteccion', id: 'LIST' }],
    }),
    patchProteccion: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `protecciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Proteccion', id },
        { type: 'Proteccion', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProteccionesQuery,
  useGetProteccionByIdQuery,
  useCreateProteccionMutation,
  usePatchProteccionMutation,
} = proteccionesApi;
