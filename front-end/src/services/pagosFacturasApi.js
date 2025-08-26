/**
 * RTK Query – RegistroPago / Facturas (JS + App JWT + reauth)
 * -----------------------------------------------------------
 *  • GET    /api/registros-pago
 *  • GET    /api/registros-pago/:id
 *  • POST   /api/registros-pago        -> transformResponse => { id }
 *  • PATCH  /api/registros-pago/:id
 *
 *  • GET    /api/facturas
 *  • GET    /api/facturas/:id
 *  • POST   /api/facturas              -> transformResponse => { id }
 *  • PATCH  /api/facturas/:id
 *
 *  TagTypes: RegistroPago | Factura
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';

/* Helpers para IDs que pueden venir camelCase o PascalCase */
const pickRegistroPagoId = (x) =>
  x?.id ?? x?.idRegistroPago ?? x?.IdRegistroPago;

const pickFacturaId = (x) =>
  x?.id ?? x?.idFactura ?? x?.IdFactura;

/* ---------------- API ---------------- */
export const pagosFacturasApi = createApi({
  reducerPath: 'pagosFacturasApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RegistroPago', 'Factura'],
  endpoints: (builder) => ({

    /* ---------- REGISTROS DE PAGO ---------- */
    getRegistrosPago: builder.query({
      query: () => '/api/registros-pago',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'RegistroPago', id: pickRegistroPagoId(x) })),
              { type: 'RegistroPago', id: 'LIST' },
            ]
          : [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    getRegistroPagoById: builder.query({
      query: (id) => `/api/registros-pago/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'RegistroPago', id }],
    }),

    createRegistroPago: builder.mutation({
      query: (body) => ({
        url: '/api/registros-pago',
        method: 'POST',
        body,
      }),
      // normaliza la respuesta a { id }
      transformResponse: (response, meta) => {
        const id = normalizeId(response);
        return { id, raw: response, status: meta?.response?.status };
      },
      invalidatesTags: [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    patchRegistroPago: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/registros-pago/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'RegistroPago', id },
        { type: 'RegistroPago', id: 'LIST' },
      ],
    }),

    /* ---------- FACTURAS ---------- */
    getFacturas: builder.query({
      query: () => '/api/facturas',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Factura', id: pickFacturaId(x) })),
              { type: 'Factura', id: 'LIST' },
            ]
          : [{ type: 'Factura', id: 'LIST' }],
    }),

    getFacturaById: builder.query({
      query: (id) => `/api/facturas/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Factura', id }],
    }),

    createFactura: builder.mutation({
      query: (body) => ({
        url: '/api/facturas',
        method: 'POST',
        body,
      }),
      // normaliza { id } ya sea que venga entidad completa / {id} / escalar
      transformResponse: (response, meta) => {
        const id = normalizeId(response);
        return { id, raw: response, status: meta?.response?.status };
      },
      invalidatesTags: [{ type: 'Factura', id: 'LIST' }],
    }),

    patchFactura: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/facturas/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Factura', id },
        { type: 'Factura', id: 'LIST' },
      ],
    }),

  }),
});

/* Hooks auto-generados -------------------------------------------------- */
export const {
  useGetRegistrosPagoQuery,
  useGetRegistroPagoByIdQuery,
  useCreateRegistroPagoMutation,
  usePatchRegistroPagoMutation,
  useGetFacturasQuery,
  useGetFacturaByIdQuery,
  useCreateFacturaMutation,
  usePatchFacturaMutation,
} = pagosFacturasApi;
