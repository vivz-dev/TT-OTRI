// src/services/autoresApi.js
// RTK Query – Autores
// Endpoints backend base (con baseQueryWithReauth): /api/autores

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

/** Normalizador: AutorReadDto (PascalCase) -> camelCase usable en front */
const toAutorItem = (x) => {
  if (!x) return null;
  // Acepta tanto PascalCase como camelCase por seguridad
  const get = (a, b) => (a ?? b);

  return {
    id:               get(x.idOtriTtAutor, x.IdOtriTtAutor),
    idAcuerdoDistrib: get(x.idOtriTtAcuerdoDistribAutores, x.IdOtriTtAcuerdoDistribAutores),
    idUnidad:         get(x.idUnidad, x.IdUnidad),
    idPersona:        get(x.idPersona, x.IdPersona),
    porcAutor:        get(x.porcAutor, x.PorcAutor),
    porcUnidad:       get(x.porcUnidad, x.PorcUnidad),
    fechaCreacion:    get(x.fechaCreacion, x.FechaCreacion),
    ultimoCambio:     get(x.ultimoCambio, x.UltimoCambio),
  };
};

export const autoresApi = createApi({
  reducerPath: 'autoresApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Autor'],
  endpoints: (builder) => ({

    /** GET /api/autores */
    getAutores: builder.query({
      query: () => ({ url: 'autores', method: 'GET' }),
      transformResponse: (res) =>
        Array.isArray(res) ? res.map(toAutorItem).filter(Boolean) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Autor', id: a.id })),
              { type: 'Autor', id: 'LIST' },
            ]
          : [{ type: 'Autor', id: 'LIST' }],
    }),

    /** GET /api/autores/{id} */
    getAutorById: builder.query({
      query: (id) => ({ url: `autores/${id}`, method: 'GET' }),
      transformResponse: (res) => toAutorItem(res),
      providesTags: (_res, _err, id) => [{ type: 'Autor', id }],
    }),

    /** GET /api/autores/por-acuerdo/{idAcuerdoDistrib} */
    getByAcuerdoDistrib: builder.query({
      query: (idAcuerdoDistrib) => ({
        url: `autores/por-acuerdo/${idAcuerdoDistrib}`,
        method: 'GET',
      }),
      transformResponse: (res) =>
        Array.isArray(res) ? res.map(toAutorItem).filter(Boolean) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Autor', id: a.id })),
              { type: 'Autor', id: 'LIST' },
            ]
          : [{ type: 'Autor', id: 'LIST' }],
    }),

    /** GET /api/autores/por-unidad/{idUnidad} */
    getByUnidad: builder.query({
      query: (idUnidad) => ({
        url: `autores/por-unidad/${idUnidad}`,
        method: 'GET',
      }),
      transformResponse: (res) =>
        Array.isArray(res) ? res.map(toAutorItem).filter(Boolean) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Autor', id: a.id })),
              { type: 'Autor', id: 'LIST' },
            ]
          : [{ type: 'Autor', id: 'LIST' }],
    }),

    /** GET /api/autores/por-persona/{idPersona} */
    getByPersona: builder.query({
      query: (idPersona) => ({
        url: `autores/por-persona/${idPersona}`,
        method: 'GET',
      }),
      transformResponse: (res) =>
        Array.isArray(res) ? res.map(toAutorItem).filter(Boolean) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Autor', id: a.id })),
              { type: 'Autor', id: 'LIST' },
            ]
          : [{ type: 'Autor', id: 'LIST' }],
    }),

    /** POST /api/autores */
    createAutor: builder.mutation({
      query: (body) => ({
        url: 'autores',
        method: 'POST',
        body,
      }),
      // El backend retorna { id: newId }
      invalidatesTags: [{ type: 'Autor', id: 'LIST' }],
    }),

    /** PATCH /api/autores/{id} */
    patchAutor: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `autores/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Autor', id },
        { type: 'Autor', id: 'LIST' },
      ],
    }),

    /** DELETE /api/autores/{id} */
    deleteAutor: builder.mutation({
      query: (id) => ({
        url: `autores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Autor', id },
        { type: 'Autor', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetAutoresQuery,
  useGetAutorByIdQuery,
  useGetByAcuerdoDistribQuery, // ← el que usarás en el orquestador
  useGetByUnidadQuery,
  useGetByPersonaQuery,
  useCreateAutorMutation,
  usePatchAutorMutation,
  useDeleteAutorMutation,
} = autoresApi;
