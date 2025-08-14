// RTK Query para /api/cotitular-instit
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cotitularInstitApi = createApi({
  reducerPath: 'cotitularInstitApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5196/api' }),
  tagTypes: ['CotitularInstit'],
  endpoints: (builder) => ({
    listInstit: builder.query({
      query: () => 'cotitular-instit',
      providesTags: [{ type: 'CotitularInstit', id: 'LIST' }],
    }),
    createInstit: builder.mutation({
      // body: { nombre, ruc?, correo? }
      query: (body) => ({
        url: 'cotitular-instit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CotitularInstit', id: 'LIST' }],
    }),
    resolveInstit: builder.mutation({
      // body: { nombre, ruc?, correo? }
      query: (body) => ({
        url: 'cotitular-instit/resolve',
        method: 'POST',
        body,
      }),
      // no invalidamos lista por ser lookup idempotente
    }),
  }),
});

export const {
  useListInstitQuery,
  useCreateInstitMutation,
  useResolveInstitMutation,
} = cotitularInstitApi;
