import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const proteccionesApi = createApi({
  reducerPath: 'proteccionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Proteccion'],
  endpoints: (builder) => ({
    createProteccion: builder.mutation({
      query: (body) => ({
        url: 'tecnologia-protecciones',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Proteccion', id: 'LIST' }],
    }),
    updateProteccion: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `tecnologia-protecciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Proteccion', id }],
    }),
    deleteProteccion: builder.mutation({
      query: (id) => ({
        url: `tecnologia-protecciones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Proteccion', id }],
    }),
  }),
});

export const {
  useCreateProteccionMutation,
  useUpdateProteccionMutation,
  useDeleteProteccionMutation,
} = proteccionesApi;