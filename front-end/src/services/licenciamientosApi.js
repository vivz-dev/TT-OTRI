/**
 * RTK Query – Licenciamientos
 *
 * Campos (camelCase por ASP.NET):
 * {
 *   id, idTransferTecnologica, subLicenciamiento, licenciaExclusiva,
 *   fechaLimite, createdAt, updatedAt
 * }
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const licenciamientosApi = createApi({
  reducerPath: 'licenciamientosApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Licenciamiento'],
  endpoints: (builder) => ({
    /* ---------- GET (Todos) ---------- */
    getLicenciamientos: builder.query({
      query: () => '/licenciamientos',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Licenciamiento', id })),
              { type: 'Licenciamiento', id: 'LIST' },
            ]
          : [{ type: 'Licenciamiento', id: 'LIST' }],
    }),

    /* ---------- GET (por ID) ---------- */
    getLicenciamientoById: builder.query({
      query: (id) => `/licenciamientos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Licenciamiento', id }],
    }),

    /* ---------- POST (Crear) ---------- */
    createLicenciamiento: builder.mutation({
      query: (body) => ({
        url: '/licenciamientos',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Licenciamiento', id: 'LIST' }],
    }),

    /* ---------- PATCH (Actualizar parcialmente) ---------- */
    updateLicenciamiento: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/licenciamientos/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Licenciamiento', id }],
    }),

    /* ---------- DELETE ---------- */
    deleteLicenciamiento: builder.mutation({
      query: (id) => ({
        url: `/licenciamientos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Licenciamiento', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLicenciamientosQuery,
  useGetLicenciamientoByIdQuery,
  useCreateLicenciamientoMutation,
  useUpdateLicenciamientoMutation,
  useDeleteLicenciamientoMutation,
} = licenciamientosApi;
