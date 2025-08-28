// RTK Query — Unidades API
// ------------------------
// Endpoints disponibles en backend:
//  • GET /unidades
//  • GET /unidades/{id:int}
//
// Nota: El API base de tu app suele incluir "/api" en REACT_APP_API_BASE_URL,
// por eso aquí usamos rutas sin el prefijo "/api": "/unidades", "/unidades/:id"

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

/* Helpers internos */
const pickFirst = (obj, keys, fallback = undefined) =>
  keys.reduce((acc, k) => (acc !== undefined ? acc : obj?.[k]), undefined) ?? fallback;

const getIdUnidad = (item) =>
  pickFirst(item, ['idUnidad', 'IdUnidad', 'id', 'Id']);

const getNombreUnidad = (item) =>
  pickFirst(item, ['nombreUnidad', 'NombreUnidad', 'nombre', 'Nombre', 'titulo', 'Titulo'], '—');

export const unidadesApi = createApi({
  reducerPath: 'unidadesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Unidad'],
  endpoints: (builder) => ({

    /* ====== GET: listado de unidades activas ====== */
    getUnidades: builder.query({
      query: () => ({ url: '/unidades', method: 'GET' }),
      transformResponse: (res) => Array.isArray(res) ? res : [],
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((u) => {
                const id = getIdUnidad(u);
                return id != null ? ({ type: 'Unidad', id }) : ({ type: 'Unidad', id: 'UNKNOWN' });
              }),
              { type: 'Unidad', id: 'LIST' },
            ]
          : [{ type: 'Unidad', id: 'LIST' }],
    }),

    /* ====== GET: unidad por id ====== */
    getUnidad: builder.query({
      query: (id) => ({ url: `/unidades/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Unidad', id }],
    }),

    /* ====== Helper: solo el nombre por id (string) ====== */
    getNombreUnidadById: builder.query({
      // Devuelve string: nombre | '—'
      async queryFn(id, _api, _extraOptions, baseQuery) {
        // 1) intento directo por id
        const byId = await baseQuery({ url: `/unidades/${id}`, method: 'GET' });
        if (!byId.error && byId.data) {
          return { data: getNombreUnidad(byId.data) };
        }

        // 2) fallback: traer todas y filtrar
        const all = await baseQuery({ url: '/unidades', method: 'GET' });
        if (all.error) return { data: '—' };

        const list = Array.isArray(all.data) ? all.data : [];
        const found =
          list.find((u) => String(getIdUnidad(u)) === String(id)) ?? null;

        return { data: found ? getNombreUnidad(found) : '—' };
      },
      providesTags: (_res, _err, id) => [{ type: 'Unidad', id }],
    }),

  }),
});

export const {
  useGetUnidadesQuery,
  useGetUnidadQuery,
  useGetNombreUnidadByIdQuery,
} = unidadesApi;
