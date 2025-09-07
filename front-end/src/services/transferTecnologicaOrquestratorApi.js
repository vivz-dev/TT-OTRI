// src/services/transferTecnologicaOrquestratorApi.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { runTransferTecnologicaFlow } from './transferTecnologicaOrquestrator';

export const transferTecnologicaOrquestratorApi = createApi({
  reducerPath: 'transferTecnologicaOrquestratorApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['TransferTecnologicaFlow'],
  endpoints: (builder) => ({
    run: builder.mutation({
      async queryFn(arg) {
        try {
          const { payload, finalize = false, debug = true } = arg || {};
          const data = await runTransferTecnologicaFlow(payload, { finalize, debug });
          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: [{ type: 'TransferTecnologicaFlow', id: 'RUN' }],
    }),
  }),
});

export const {
useRunMutation: useRunTransferTecnologicaFlowMutation
} = transferTecnologicaOrquestratorApi;