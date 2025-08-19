// src/services/resolutionsApi.js
import { createApiAuth } from './baseApi';

const normalizeId = (resp) => {
  if (resp == null) return null;
  if (typeof resp === 'number') return resp;
  if (typeof resp === 'string') {
    const n = Number(resp);
    return Number.isFinite(n) ? n : null;
  }
  return resp.id ?? resp.Id ?? resp.idResolucion ?? resp.IdResolucion ?? null;
};
