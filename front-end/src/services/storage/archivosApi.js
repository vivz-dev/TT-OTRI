// src/services/storage/archivosApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';

/**
 * DTOs para tu backend:
 *   Nombre (<=100), Formato (<=10), Tamano, Url (<=200), IdTEntidad, TipoEntidad (<=2)
 */
export const buildCreateArchivoDto = ({ nombre, formato, tamano, url, idTEntidad, tipoEntidad }) => ({
  Nombre: nombre,
  Formato: formato,
  Tamano: tamano,
  Url: url,
  IdTEntidad: idTEntidad,
  TipoEntidad: tipoEntidad, // 🆕
});

/** DTO parcial para PATCH */
export const buildUpdateArchivoDto = (partial) => {
  const out = {};
  if (partial?.nombre !== undefined) out.Nombre = partial.nombre;
  if (partial?.formato !== undefined) out.Formato = partial.formato;
  if (partial?.tamano !== undefined) out.Tamano = partial.tamano;
  if (partial?.url !== undefined) out.Url = partial.url;
  if (partial?.idTEntidad !== undefined) out.IdTEntidad = partial.idTEntidad;
  if (partial?.tipoEntidad !== undefined) out.TipoEntidad = partial.tipoEntidad; // 🆕
  return out;
};

export const archivosApi = createApi({
  reducerPath: 'archivosApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Archivo'],
  endpoints: (builder) => ({
    /** ---------- (ya existente) Subida a DSpace ---------- */
    uploadToDspace: builder.mutation({
      query: (body) => ({
        url: 'https://wsarchivos.espol.edu.ec/api/DspaceFile/SubirArchivo',
        method: 'POST',
        body,
      }),
    }),

    /** ---------- (ya existente) Crear registro en tu backend ---------- */
    createArchivo: builder.mutation({
      query: (body) => ({
        url: '/archivos',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res) => [{ type: 'Archivo', id: 'LIST' }],
    }),

    /** ---------- GET: todos ---------- */
    getArchivos: builder.query({
      query: () => '/archivos',
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Archivo', id: a?.id ?? a?.Id })),
              { type: 'Archivo', id: 'LIST' },
            ]
          : [{ type: 'Archivo', id: 'LIST' }],
    }),

    /** ---------- GET: por id ---------- */
    getArchivoById: builder.query({
      query: (id) => `/archivos/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Archivo', id }],
    }),

    /**
     * ---------- GET ALL y luego filtra POR entidad ----------
     * Requisito: NO crear endpoint backend extra. Hace GET /archivos y filtra en cliente.
     * arg = { idTEntidad: number, tipoEntidad: string }
     */
    getArchivosByEntidad: builder.query({
      query: () => '/archivos',
      transformResponse: (response, _meta, arg) => {
        const idTEntidad = arg?.idTEntidad ?? arg?.idEntidad ?? arg?.id; // tolerante a nombre
        const tipoEntidad = arg?.tipoEntidad ?? arg?.TipoEntidad;

        // Normalizamos nombres de propiedades (por si el backend devuelve PascalCase)
        const norm = (a) => ({
          id: a?.id ?? a?.Id,
          nombre: a?.nombre ?? a?.Nombre,
          formato: a?.formato ?? a?.Formato,
          tamano: a?.tamano ?? a?.Tamano,
          url: a?.url ?? a?.Url,
          idTEntidad: a?.idTEntidad ?? a?.IdTEntidad,
          tipoEntidad: a?.tipoEntidad ?? a?.TipoEntidad,
          fechaCreacion: a?.fechaCreacion ?? a?.FechaCreacion,
          ultimoCambio: a?.ultimoCambio ?? a?.UltimoCambio,
        });

        const list = Array.isArray(response) ? response.map(norm) : [];
        return list.filter(
          (x) =>
            (idTEntidad == null || String(x.idTEntidad) === String(idTEntidad)) &&
            (tipoEntidad == null || String(x.tipoEntidad)?.toUpperCase() === String(tipoEntidad)?.toUpperCase())
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Archivo', id: a?.id })),
              { type: 'Archivo', id: 'LIST' },
            ]
          : [{ type: 'Archivo', id: 'LIST' }],
    }),

    /** ---------- PATCH: actualización parcial ---------- */
    patchArchivo: builder.mutation({
      query: ({ id, body }) => ({
        url: `/archivos/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Archivo', id },
        { type: 'Archivo', id: 'LIST' },
      ],
    }),

    /** ---------- DELETE: eliminar ---------- */
    deleteArchivo: builder.mutation({
      query: (id) => ({
        url: `/archivos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Archivo', id },
        { type: 'Archivo', id: 'LIST' },
      ],
    }),
  }),
});

/* -------------------- Hooks exportados -------------------- */
export const {
  useUploadToDspaceMutation,
  useCreateArchivoMutation,

  useGetArchivosQuery,
  useGetArchivoByIdQuery,
  useGetArchivosByEntidadQuery,
  useLazyGetArchivosByEntidadQuery, // 👈 AÑADIDO

  usePatchArchivoMutation,
  useDeleteArchivoMutation,
} = archivosApi;


/* -----------------------------------------------------------
 * (Opcional) Helper imperativo para usar dentro de thunks/orquestadores:
 *   - Hace GET all vía RTKQ y filtra en memoria.
 *   - Requiere pasar el "api" (store) para poder dispatch->initiate.
 * Uso:
 *   const archivos = await fetchArchivosByEntidad(api, { idTEntidad: 123, tipoEntidad: 'TT' });
 * ----------------------------------------------------------- */
export async function fetchArchivosByEntidad(api, { idTEntidad, tipoEntidad }) {
  const res = await api
    .dispatch(archivosApi.endpoints.getArchivos.initiate(undefined, { forceRefetch: true }))
    .unwrap()
    .catch(() => []);

  const norm = (a) => ({
    id: a?.id ?? a?.Id,
    idTEntidad: a?.idTEntidad ?? a?.IdTEntidad,
    tipoEntidad: a?.tipoEntidad ?? a?.TipoEntidad,
  });

  const list = Array.isArray(res) ? res.map(norm) : [];

  return list.filter(
    (x) =>
      (idTEntidad == null || String(x.idTEntidad) === String(idTEntidad)) &&
      (tipoEntidad == null || String(x.tipoEntidad)?.toUpperCase() === String(tipoEntidad)?.toUpperCase())
  );
}
