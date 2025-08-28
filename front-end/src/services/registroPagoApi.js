/**
 * RTK Query – Registros de Pago
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const registroPagoApi = createApi({
  reducerPath: 'registroPagoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RegistroPago'],
  endpoints: (builder) => ({
    // Obtener todos los registros de pago
    getRegistrosPago: builder.query({
      query: () => '/registros-pago',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idRegistroPago }) => ({ 
                type: 'RegistroPago', 
                id: idRegistroPago 
              })),
              { type: 'RegistroPago', id: 'LIST' },
            ]
          : [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    // Obtener registro de pago por ID
    getRegistroPagoById: builder.query({
      query: (id) => `/registros-pago/${id}`,
      providesTags: (result, error, id) => [{ 
        type: 'RegistroPago', 
        id 
      }],
    }),

    // Crear nuevo registro de pago
    createRegistroPago: builder.mutation({
      query: (body) => ({
        url: '/registros-pago',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    // Actualizar registro de pago (PATCH)
    updateRegistroPago: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/registros-pago/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ 
        type: 'RegistroPago', 
        id 
      }],
    }),
  }),
});

// Exportar hooks automáticamente generados
export const {
  useGetRegistrosPagoQuery,
  useGetRegistroPagoByIdQuery,
  useCreateRegistroPagoMutation,
  useUpdateRegistroPagoMutation,
} = registroPagoApi;