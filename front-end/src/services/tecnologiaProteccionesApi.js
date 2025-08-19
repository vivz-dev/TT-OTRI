// src/services/tecnologiaProteccionesApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

/**
 * Convención de backend asumida:
 *  - POST   /tecnologia-protecciones                    (crear)
 *  - GET    /tecnologias/:id/protecciones               (listar por tecnología)
 *  - DELETE /tecnologia-protecciones/:id                (eliminar)
 *  - PATCH  /tecnologia-protecciones/:id                (actualizar)
 *
 * Body crear:
 *  { IdTecnologia: number, IdTipoProteccion: number, Fecha: 'YYYY-MM-DD' }
 */
export const tecnologiaProteccionesApi = createApi({
  reducerPath: 'tecnologiaProteccionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TecProteccionList', 'TecProteccionItem'],
  endpoints: (builder) => ({
    listByTecnologia: builder.query({
      query: (idTecnologia) => `tecnologias/${idTecnologia}/protecciones`,
      providesTags: (result, _err, idTecnologia) =>
        Array.isArray(result)
          ? [
              ...result.map((p) => ({ type: 'TecProteccionItem', id: p.id })),
              { type: 'TecProteccionList', id: idTecnologia },
            ]
          : [{ type: 'TecProteccionList', id: idTecnologia }],
    }),

    create: builder.mutation({
      query: (body) => ({ url: 'tecnologia-protecciones', method: 'POST', body }),
      invalidatesTags: (_res, _err, body) =>
        body?.IdTecnologia ? [{ type: 'TecProteccionList', id: body.IdTecnologia }] : [],
    }),

    patch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `tecnologia-protecciones/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'TecProteccionItem', id }],
    }),

    remove: builder.mutation({
      query: (id) => ({ url: `tecnologia-protecciones/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, _id) => [],
    }),
  }),
});

export const {
  useListByTecnologiaQuery,
  useCreateMutation: useCreateTecProteccionMutation,
  usePatchMutation: usePatchTecProteccionMutation,
  useRemoveMutation: useRemoveTecProteccionMutation,
} = tecnologiaProteccionesApi;
