// RTK Query – Acuerdos de Distribución de Autores
// Endpoints backend base: /api/acuerdos-distrib-autores

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const acuerdosDistribAutoresApi = createApi({
  reducerPath: 'acuerdosDistribAutoresApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AcuerdoDistribAutor', 'AcuerdoAutores'],
  endpoints: (builder) => ({
    getAcuerdos: builder.query({
      query: () => ({ url: 'acuerdos-distrib-autores', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'AcuerdoDistribAutor', id: x.id })),
              { type: 'AcuerdoDistribAutor', id: 'LIST' },
            ]
          : [{ type: 'AcuerdoDistribAutor', id: 'LIST' }],
    }),

    getAcuerdoById: builder.query({
      query: (id) => ({ url: `acuerdos-distrib-autores/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'AcuerdoDistribAutor', id }],
    }),

    // <-- NUEVO: autores asociados a un acuerdo (idPersona, porcAutor, etc.)
    getAutoresByAcuerdoId: builder.query({
      query: (acuerdoId) => ({
        url: `acuerdos-distrib-autores/${acuerdoId}/autores`,
        method: 'GET',
      }),
      providesTags: (_res, _err, acuerdoId) => [
        { type: 'AcuerdoAutores', id: `ACU-${acuerdoId}` },
      ],
    }),

    createAcuerdo: builder.mutation({
      query: (body) => ({ url: 'acuerdos-distrib-autores', method: 'POST', body }),
      invalidatesTags: [{ type: 'AcuerdoDistribAutor', id: 'LIST' }],
    }),

    patchAcuerdo: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `acuerdos-distrib-autores/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'AcuerdoDistribAutor', id },
        { type: 'AcuerdoDistribAutor', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAcuerdosQuery,
  useGetAcuerdoByIdQuery,
  useGetAcuerdoByTecnologiaIdQuery, // <-- NUEVO
  useGetAutoresByAcuerdoIdQuery,    // <-- NUEVO
  useCreateAcuerdoMutation,
  usePatchAcuerdoMutation,
} = acuerdosDistribAutoresApi;
