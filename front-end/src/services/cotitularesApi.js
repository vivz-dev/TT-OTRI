// RTK Query para /api/cotitularidades/{cotId}/cotitulares
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cotitularesApi = createApi({
  reducerPath: 'cotitularesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api' }),
  tagTypes: ['Cotitular'],
  endpoints: (builder) => ({
    listByCotitularidad: builder.query({
      query: (cotId) => `cotitularidades/${cotId}/cotitulares`,
      providesTags: (result, err, cotId) => [{ type: 'Cotitular', id: `COT_${cotId}` }],
    }),
    createUnderCotitularidad: builder.mutation({
      // body: { cotitularidadId, cotitularInstitId, idUsuario, porcCotitularidad }
      query: ({ cotId, ...body }) => ({
        url: `cotitularidades/${cotId}/cotitulares`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, err, { cotId }) => [{ type: 'Cotitular', id: `COT_${cotId}` }],
    }),
  }),
});

export const {
  useListByCotitularidadQuery,
  useCreateUnderCotitularidadMutation,
} = cotitularesApi;
