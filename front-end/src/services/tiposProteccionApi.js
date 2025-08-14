// src/services/tiposProteccionApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tiposProteccionApi = createApi({
  reducerPath: 'tiposProteccionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5196/api',
  }),
  tagTypes: ['TipoProteccion'],
  endpoints: (builder) => ({
    getTipos: builder.query({
      query: () => 'tipos-proteccion',
      providesTags: [{ type: 'TipoProteccion', id: 'LIST' }],
    }),
  }),
});

export const { useGetTiposQuery } = tiposProteccionApi;
