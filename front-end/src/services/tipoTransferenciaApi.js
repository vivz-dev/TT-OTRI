// src/services/tipoTransferenciaApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt();
    headers.set('Authorization', `Bearer ${appToken}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && [401, 403].includes(result.error.status)) {
    await ensureAppJwt();
    result = await rawBaseQuery(args, api, extraOptions);
  }
  return result;
};

export const tipoTransferenciaApi = createApi({
  reducerPath: 'tipoTransferenciaApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TipoTransferencia'],
  endpoints: (builder) => ({
    getTiposTransferencia: builder.query({
      query: () => '/api/tipos-transferencia',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TipoTransferencia', id })),
              { type: 'TipoTransferencia', id: 'LIST' },
            ]
          : [{ type: 'TipoTransferencia', id: 'LIST' }],
    }),

    getTipoTransferenciaById: builder.query({
      query: (id) => `/api/tipos-transferencia/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TipoTransferencia', id }],
    }),

    createTipoTransferencia: builder.mutation({
      query: (body) => ({
        url: '/api/tipos-transferencia',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TipoTransferencia', id: 'LIST' }],
    }),

    updateTipoTransferencia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/tipos-transferencia/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'TipoTransferencia', id },
        { type: 'TipoTransferencia', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTiposTransferenciaQuery,
  useGetTipoTransferenciaByIdQuery,
  useCreateTipoTransferenciaMutation,
  useUpdateTipoTransferenciaMutation,
} = tipoTransferenciaApi;