import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const proteccionesApi = createApi({
  reducerPath: 'proteccionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Proteccion'],
  endpoints: (builder) => ({
    // GET /protecciones
    getProtecciones: builder.query({
      query: () => ({ url: '/protecciones', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Proteccion', id: p.id })),
              { type: 'Proteccion', id: 'LIST' },
            ]
          : [{ type: 'Proteccion', id: 'LIST' }],
    }),

    // GET /protecciones/{id}
    getProteccionById: builder.query({
      query: (id) => ({ url: `/protecciones/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Proteccion', id }],
    }),

    // POST /protecciones
    createProteccion: builder.mutation({
      query: (body) => ({
        url: '/protecciones',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Proteccion', id: 'LIST' }],
    }),

    // PATCH /protecciones/{id}
    // 👇 importante: recibir { id, body } para no mezclar el id en el payload
    updateProteccion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/protecciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Proteccion', id },
        { type: 'Proteccion', id: 'LIST' },
      ],
    }),

    // (Opcional) DELETE /protecciones/{id}
    // Solo habilítalo si agregas el endpoint en tu Controller.
    deleteProteccion: builder.mutation({
      query: (id) => ({
        url: `/protecciones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
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
  useUpdateProteccionMutation,
  useDeleteProteccionMutation,
} = proteccionesApi;
