// RTK Query — Benef Instituciones API
// -----------------------------------
// Endpoints backend:
//  • GET    /api/benef-instituciones
//  • GET    /api/benef-instituciones/:id
//  • POST   /api/benef-instituciones { nombre }
//  • DELETE /api/benef-instituciones/:id
//
// Requisitos previos:
//  - Tener creado src/services/api.js con `ensureAppJwt()` (MSAL -> /auth/exchange) y helpers getAppJwt/clearAppJwt.
//  - Añadir este slice a tu store de Redux (ver snippet al final).

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

// Base query "con reauth": asegura que haya JWT antes de cada request
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Content negotiation por defecto; los métodos pueden sobreescribirlo
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // 1) Garantiza que exista App JWT
  const token = await ensureAppJwt();

  // 2) Inyecta Authorization header
  if (!args.headers) args.headers = new Headers();
  if (token) args.headers.set('Authorization', `Bearer ${token}`);

  // 3) Ejecuta request
  let result = await rawBaseQuery(args, api, extraOptions);

  // 4) (Opcional) Manejo centralizado de 401/403 para limpiar token
  if (result?.error && [401, 403].includes(result.error.status)) {
    // Podrías intentar un re-exchange aquí si aplica
    // await refreshOrExchange()
    // Por ahora, devolvemos el error tal cual
  }

  return result;
};

export const benefInstitucionesApi = createApi({
  reducerPath: 'benefInstitucionesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BenefInstitucion'],
  endpoints: (builder) => ({
    // GET /benef-instituciones
    getBenefInstituciones: builder.query({
      query: () => ({ url: '/benef-instituciones', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'BenefInstitucion', id })),
              { type: 'BenefInstitucion', id: 'LIST' },
            ]
          : [{ type: 'BenefInstitucion', id: 'LIST' }],
      transformResponse: (response) => response, // deja pasar tal cual (array)
    }),

    // GET /benef-instituciones/:id
    getBenefInstitucion: builder.query({
      query: (id) => ({ url: `/benef-instituciones/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'BenefInstitucion', id }],
    }),

    // POST /benef-instituciones { nombre }
    createBenefInstitucion: builder.mutation({
      query: (body) => ({
        url: '/benef-instituciones',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BenefInstitucion', id: 'LIST' }],
    }),

    // DELETE /benef-instituciones/:id
    deleteBenefInstitucion: builder.mutation({
      query: (id) => ({ url: `/benef-instituciones/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'BenefInstitucion', id },
        { type: 'BenefInstitucion', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBenefInstitucionesQuery,
  useGetBenefInstitucionQuery,
  useCreateBenefInstitucionMutation,
  useDeleteBenefInstitucionMutation,
} = benefInstitucionesApi;