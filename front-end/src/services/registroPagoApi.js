/**
 * RTK Query – Registros de Pago
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ⬇️ IMPORTA tu servicio existente (ajusta la ruta si es necesario)
import { getPersonaNameById } from './espolUsers'; // <-- cambia a la ruta real si difiere

// Helper local: añade nombrePersona a 1 registro
async function withNombrePersonaOne(rec) {
  if (!rec || rec.nombrePersona) return rec;
  const id = Number(rec?.idPersona);
  if (Number.isFinite(id) && id > 0) {
    try {
      const nombre = await getPersonaNameById(id);
      return { ...rec, nombrePersona: nombre };
    } catch {
      return { ...rec, nombrePersona: 'Usuario no disponible' };
    }
  }
  return { ...rec, nombrePersona: 'Usuario no disponible' };
}

// Helper local: añade nombrePersona a arreglo
async function withNombrePersonaMany(list) {
  const arr = Array.isArray(list) ? list : [];
  return Promise.all(arr.map(withNombrePersonaOne));
}

export const registroPagoApi = createApi({
  reducerPath: 'registroPagoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RegistroPago'],
  endpoints: (builder) => ({

    /* =========================
     * ENDPOINTS ORIGINALES
     * ========================= */
    // Obtener todos los registros de pago
    getRegistrosPago: builder.query({
      query: () => '/registros-pago',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idRegistroPago }) => ({
                type: 'RegistroPago',
                id: idRegistroPago,
              })),
              { type: 'RegistroPago', id: 'LIST' },
            ]
          : [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    // Obtener registro de pago por ID
    getRegistroPagoById: builder.query({
      query: (id) => `/registros-pago/${id}`,
      providesTags: (result, error, id) => [{ type: 'RegistroPago', id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'RegistroPago', id }],
    }),

    /* =========================================
     * NUEVOS ENDPOINTS "ENRIQUECIDOS" (opcionales)
     * ========================================= */
    // Lista enriquecida con nombrePersona
    getRegistrosPagoWithPersona: builder.query({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const res = await baseQuery('/registros-pago');
        if (res.error) return { error: res.error };
        const data = Array.isArray(res.data) ? res.data : [];
        try {
          const enriched = await withNombrePersonaMany(data);
          return { data: enriched };
        } catch (e) {
          return { data }; // fallback sin romper
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idRegistroPago }) => ({
                type: 'RegistroPago',
                id: idRegistroPago,
              })),
              { type: 'RegistroPago', id: 'LIST' },
            ]
          : [{ type: 'RegistroPago', id: 'LIST' }],
    }),

    // Detalle por ID enriquecido con nombrePersona
    getRegistroPagoByIdWithPersona: builder.query({
      async queryFn(id, _api, _extraOptions, baseQuery) {
        const res = await baseQuery(`/registros-pago/${id}`);
        if (res.error) return { error: res.error };
        try {
          const enriched = await withNombrePersonaOne(res.data);
          return { data: enriched };
        } catch (e) {
          return { data: res.data }; // fallback sin romper
        }
      },
      providesTags: (result, error, id) => [{ type: 'RegistroPago', id }],
    }),
  }),
});

// Exportar hooks automáticamente generados
export const {
  // originales
  useGetRegistrosPagoQuery,
  useGetRegistroPagoByIdQuery,
  useCreateRegistroPagoMutation,
  useUpdateRegistroPagoMutation,

  // nuevos (enriquecidos)
  useGetRegistrosPagoWithPersonaQuery,
  useGetRegistroPagoByIdWithPersonaQuery,
} = registroPagoApi;
