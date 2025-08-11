/**
 * RTK Query – Transferencias Tecnológicas
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:5196/api';

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    /* ---------- GET ---------- */
    getTransfers: builder.query({
      query: () => '/transferencias',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transfer', id })),
              { type: 'Transfer', id: 'LIST' },
            ]
          : [{ type: 'Transfer', id: 'LIST' }],
    }),

    /* ---------- POST ---------- */
    createTransfer: builder.mutation({
      query: (body) => ({
        url: '/transferencias',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transfer', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useCreateTransferMutation,
} = transfersApi;
