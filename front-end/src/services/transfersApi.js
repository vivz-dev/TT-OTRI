/**
 * RTK Query – Transferencias Tecnológicas
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    /* ---------- GET (Todas las transferencias) ---------- */
    getTransfers: builder.query({
      query: () => '/transfers',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transfer', id })),
              { type: 'Transfer', id: 'LIST' },
            ]
          : [{ type: 'Transfer', id: 'LIST' }],
    }),

    /* ---------- GET (Transferencia por ID) ---------- */
    getTransferById: builder.query({
      query: (id) => `/transfers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transfer', id }],
    }),

    /* ---------- POST (Crear transferencia) ---------- */
    createTransfer: builder.mutation({
      query: (body) => ({
        url: '/transfers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transfer', id: 'LIST' }],
    }),

    /* ---------- PATCH (Actualizar parcialmente) ---------- */
    updateTransfer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/transfers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transfer', id }],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useGetTransferByIdQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
} = transfersApi;