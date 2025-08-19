// src/services/tiposProteccionApi.js
import { createApi} from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';


export const tiposProteccionApi = createApi({
  reducerPath: 'tiposProteccionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TipoProteccion'],
  endpoints: (builder) => ({
    getTipos: builder.query({
      query: () => 'tipos-proteccion',
      providesTags: [{ type: 'TipoProteccion', id: 'LIST' }],
    }),
  }),
});

export const { useGetTiposQuery } = tiposProteccionApi;



