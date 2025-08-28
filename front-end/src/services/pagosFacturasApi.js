/**
 * RTK Query – RegistroPago / Facturas (JS + App JWT + reauth)
 * -----------------------------------------------------------
 *  • GET    /facturas?idRegistroPago=:id   (filtrado en transformResponse)
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';

/* Helpers para IDs que pueden venir camelCase o PascalCase */
const pickRegistroPagoId = (x) =>
  x?.id ?? x?.idRegistroPago ?? x?.IdRegistroPago;

/* ✅ NUEVO: detectar FK idRegistroPago dentro de una factura (distintas variantes) */
const pickFkRegistroPagoId = (f) =>
  f?.idRegistroPago ?? f?.IdRegistroPago ?? f?.registroPagoId ?? f?.RegistroPagoId ?? f?.id_registro_pago;

/* Si necesitas también IDs de factura */
const pickFacturaId = (x) =>
  x?.id ?? x?.idFactura ?? x?.IdFactura;

export const pagosFacturasApi = createApi({
  reducerPath: 'pagosFacturasApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RegistroPago', 'Factura'],
  endpoints: (builder) => ({

    /* ---------- REGISTROS DE PAGO ---------- */
    getRegistrosPago: builder.query({
      query: () => '/registros-pago',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'RegistroPago', id: pickRegistroPagoId(x) })),
              { type: 'RegistroPago', id: 'LIST' },
            ]
          : [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    getRegistroPagoById: builder.query({
      query: (id) => `/registros-pago/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'RegistroPago', id }],
    }),

    createRegistroPago: builder.mutation({
      query: (body) => ({
        url: '/registros-pago',
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
        url: `/registros-pago/${id}`,
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
      query: () => '/facturas',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Factura', id: pickFacturaId(x) })),
              { type: 'Factura', id: 'LIST' },
            ]
          : [{ type: 'Factura', id: 'LIST' }],
    }),

    getFacturaById: builder.query({
      query: (id) => `/facturas/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Factura', id }],
    }),

    createFactura: builder.mutation({
      query: (body) => ({
        url: '/facturas',
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
        url: `/facturas/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Factura', id },
        { type: 'Factura', id: 'LIST' },
      ],
    }),

    /* ---------- NUEVO: FACTURAS POR REGISTRO DE PAGO ---------- */
/* ---------- NUEVO: FACTURAS POR REGISTRO DE PAGO (FILTRADO CLIENTE) ---------- */
    getFacturasByRegistroPagoId: builder.query({
      // Endpoint tipo: /facturas?idRegistroPago=:id (aunque el backend ignore el filtro)
      query: (idRegistroPago) => {
        // console.log('[getFacturasByRegistroPagoId] query → idRegistroPago =', idRegistroPago);
        return `/facturas?idRegistroPago=${encodeURIComponent(idRegistroPago)}`;
      },
      transformResponse: (response, meta, arg) => {
        const objetivo = Number(arg);
        const lista = Array.isArray(response) ? response : [];

        // console.log('[getFacturasByRegistroPagoId] transformResponse → arg(id):', arg, 'status:', meta?.response?.status);
        // console.log('[getFacturasByRegistroPagoId] transformResponse → payload (raw):', response);

        // ✅ Filtro lado cliente por idRegistroPago (tolerante a tipos/keys)
        const filtradas = lista.filter((f) => {
          const fk = Number(pickFkRegistroPagoId(f));
          const ok = Number.isFinite(fk) && fk === objetivo;
          if (!ok) {
            // Log de depuración por cada factura descartada
            // console.log('[getFacturasByRegistroPagoId] descartada (fk!=id):', {
            //   facturaId: pickFacturaId(f),
            //   fkRegistroPago: fk,
            //   esperado: objetivo,
            // });
          }
          return ok;
        });

        // console.log('[getFacturasByRegistroPagoId] transformResponse → filtradas:', filtradas);
        return filtradas;
      },
      providesTags: (result) => {
        // console.log('[getFacturasByRegistroPagoId] providesTags → result length:', Array.isArray(result) ? result.length : 0);
        return result
          ? [
              ...result.map((x) => ({ type: 'Factura', id: pickFacturaId(x) })),
              { type: 'Factura', id: 'LIST' },
            ]
          : [{ type: 'Factura', id: 'LIST' }];
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        // console.log('[getFacturasByRegistroPagoId] onQueryStarted → idRegistroPago =', arg);
        try {
          const { data, meta } = await queryFulfilled;
          // console.log('[getFacturasByRegistroPagoId] onQueryStarted → fulfilled. status:', meta?.response?.status);
          // console.log('[getFacturasByRegistroPagoId] onQueryStarted → data (filtradas):', data);
        } catch (error) {
          // console.log('[getFacturasByRegistroPagoId] onQueryStarted → error:', error);
        }
      },
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
  /* NUEVO HOOK: */
  useGetFacturasByRegistroPagoIdQuery,
} = pagosFacturasApi;
