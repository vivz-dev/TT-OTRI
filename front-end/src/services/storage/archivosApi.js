// src/services/storage/archivosApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';

/**
 * DTO para tu backend:
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

export const archivosApi = createApi({
  reducerPath: 'archivosApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /** Proxy/consumo directo del WS de DSpace */
    uploadToDspace: builder.mutation({
      query: (body) => ({
        url: 'https://wsarchivos.espol.edu.ec/api/DspaceFile/SubirArchivo',
        method: 'POST',
        body,
      }),
    }),

    /** Crea el registro del archivo en tu backend */
    createArchivo: builder.mutation({
      query: (body) => ({
        url: '/archivos',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useUploadToDspaceMutation, useCreateArchivoMutation } = archivosApi;
