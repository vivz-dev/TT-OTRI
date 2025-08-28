// RTK Query para /tecnologias/{tecId}/cotitularidad y /cotitularidades
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cotitularidadesApi = createApi({
  reducerPath: 'cotitularidadesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5196/api' }),
  tagTypes: ['Cotitularidad'],
  endpoints: (builder) => ({
    getByTechnology: builder.query({
      query: (tecId) => `tecnologias/${tecId}/cotitularidad`,
      providesTags: (result, err, tecId) => [{ type: 'Cotitularidad', id: `TEC_${tecId}` }],
    }),
    createForTechnology: builder.mutation({
      // body: { technologyId } — el controller lo sobrescribe con tecId
      query: ({ tecId, ...body }) => ({
        url: `tecnologias/${tecId}/cotitularidad`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, err, { tecId }) => [{ type: 'Cotitularidad', id: `TEC_${tecId}` }],
    }),
  }),
});

export const {
  useGetByTechnologyQuery,
  useCreateForTechnologyMutation,
} = cotitularidadesApi;
