// src/services/baseQuery.js
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureAppJwt } from './api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt();
    if (appToken) headers.set('Authorization', `Bearer ${appToken}`);
    // No seteamos Content-Type: fetchBaseQuery lo añade si hay body
    return headers;
  },
});

/** Reintenta 1 vez tras 401/403 volviendo a asegurar el App JWT */
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && [401, 403].includes(result.error.status)) {
    try {
      await ensureAppJwt();
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      // devolvemos el error original
    }
  }
  return result;
};

/** Normaliza distintas formas de Id devueltas por el backend */
export const normalizeId = (resp) => {
  if (resp == null) return null;
  if (typeof resp === 'number') return resp;
  if (typeof resp === 'string') {
    const n = Number(resp);
    return Number.isFinite(n) ? n : null;
  }
  return (
    resp.id ??
    resp.Id ??
    resp.idResolucion ??
    resp.IdResolucion ??
    null
  );
};
