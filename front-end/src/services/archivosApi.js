/**
 * RTK Query – Archivos
 * --------------------
 *  • GET    /archivos
 *  • GET    /archivos/:id
 *  • POST   /archivos
 *  • PATCH  /archivos/:id
 *
 *  TagType: Archivo
 *
 *  Backend espera JSON:
 *  {
 *    tamano: number | null,
 *    idTEntidad: number | string | null, // admite placeholder en el plan
 *    nombre: string | null,
 *    formato: string | null,
 *    url: string | null
 *  }
 *
 *  NOTA: Este servicio SOLO registra metadatos. No sube bytes.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

/* ==============================
   Config base
   ============================== */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ==============================
   Base query con App JWT y reauth
   ============================== */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt();
    headers.set('Authorization', `Bearer ${appToken}`);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && [401, 403].includes(result.error.status)) {
    try {
      await ensureAppJwt(); // reintenta con token renovado
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }
  return result;
};

/* ==============================
   Helpers públicos
   ============================== */

/** Sanitiza un nombre manteniendo la extensión. */
export const sanitizeFileName = (fileName) => {
  const idx = fileName.lastIndexOf('.');
  const base = idx >= 0 ? fileName.slice(0, idx) : fileName;
  const ext  = idx >= 0 ? fileName.slice(idx) : '';
  const safeBase = base
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  const stamp = Date.now();
  return `${safeBase}-${stamp}${ext}`;
};

/**
 * Construye el body para POST /api/archivos a partir de un File del navegador.
 * - Guarda la URL pública en /archivos/<file>
 * - idTEntidad: id de la resolución (u otra entidad). Acepta número o string (placeholder).
 */
export const buildArchivoPayload = ({ file, idTEntidad }) => {
  if (!(file instanceof File)) {
    console.warn('[buildArchivoPayload] "file" no es File válido:', file);
    return null;
  }
  const safeName = sanitizeFileName(file.name);
  const publicUrlPath = `/archivos/${safeName}`;

  return {
    tamano: file.size ?? null,
    idTEntidad: (typeof idTEntidad === 'number' || typeof idTEntidad === 'string')
      ? idTEntidad
      : null,
    nombre: safeName,
    formato: file.type || 'application/pdf',
    url: publicUrlPath,
  };
};

/* ==============================
   API RTK Query
   ============================== */
export const archivosApi = createApi({
  reducerPath: 'archivosApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Archivo'],
  endpoints: (builder) => ({

    /* ---------- LISTAR TODO ---------- */
    getArchivos: builder.query({
      query: () => `/archivos`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Archivo', id: x.id })),
              { type: 'Archivo', id: 'LIST' },
            ]
          : [{ type: 'Archivo', id: 'LIST' }],
    }),

    /* ---------- OBTENER POR ID ---------- */
    getArchivoById: builder.query({
      query: (id) => `/archivos/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Archivo', id }],
    }),

    /* ---------- CREAR ---------- */
    createArchivo: builder.mutation({
      query: (body) => ({
        url: `/archivos`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Archivo', id: 'LIST' }],
    }),

    /* ---------- PATCH ---------- */
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

  }),
});

/* Hooks auto-generados */
export const {
  useGetArchivosQuery,
  useGetArchivoByIdQuery,
  useCreateArchivoMutation,
  usePatchArchivoMutation,
} = archivosApi;
