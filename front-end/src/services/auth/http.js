// Axios cliente con interceptor que inyecta tu App JWT y reintenta en 401/403

import axios from "axios";
import { API_BASE_URL, ensureAppJwt } from "./auth";

export const api = axios.create({ baseURL: API_BASE_URL });

let refreshing = false;

api.interceptors.request.use(async (config) => {
  const t = await ensureAppJwt();
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${t}`;
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      if (refreshing) throw error;
      try {
        refreshing = true;
        original._retry = true;
        // fuerza refresh del App JWT mediante ensureAppJwt()
        const t = await ensureAppJwt();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${t}`;
        return api(original);
      } finally {
        refreshing = false;
      }
    }
    throw error;
  }
);
