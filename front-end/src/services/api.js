// src/services/api.js
import axios from "axios";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../components/Auth/authConfig";

const API_BASE_URL = "http://localhost:8080/api";
const APP_JWT_KEY = "app_jwt";

const msalInstance = new PublicClientApplication(msalConfig);

/* ---------- helpers de tu App JWT ---------- */
export function getAppJwt() {
  return sessionStorage.getItem(APP_JWT_KEY);
}
function setAppJwt(t) {
  sessionStorage.setItem(APP_JWT_KEY, t);
}
function parseExpMs(token) {
  try {
    const [, b64] = token.split(".");
    const json = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.exp ? json.exp * 1000 : 0;
  } catch { return 0; }
}
function isValid(token) {
  if (!token) return false;
  return parseExpMs(token) - Date.now() > 30_000; // margen 30s
}

/** Decodifica cualquier JWT (sin validar firma; solo DEBUG) */
export function decodeAppJwt(token) {
  try {
    const [, b64] = token.split(".");
    const json = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    return json || {};
  } catch { return {}; }
}

/** Extrae datos amigables (usuario/roles/correo/exp) desde tu App JWT */
export function getAppUser(token = getAppJwt()) {
  const p = decodeAppJwt(token);

  // roles: soporta 'roles', 'role' y el claim con URI de .NET
  const roleUri = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const roles =
    Array.isArray(p.roles) ? p.roles
    : p.roles ? [p.roles]
    : Array.isArray(p.role) ? p.role
    : p.role ? [p.role]
    : p[roleUri] ? (Array.isArray(p[roleUri]) ? p[roleUri] : [p[roleUri]])
    : [];

  // email: varios orígenes posibles (servidor emite 'email' y 'unique_name')
  const email =
    p.email
    || (p.unique_name && p.unique_name.includes("@") ? p.unique_name : null)
    || p.upn
    || (p.emails && Array.isArray(p.emails) ? p.emails[0] : null);

  return {
    name: p.name || p.unique_name || p.upn || p.email || "",
    upn: p.unique_name || p.upn || p.email || "",
    email: email || "",
    roles,
    sub: p.sub,
    iss: p.iss,
    aud: p.aud,
    expIso: p?.exp ? new Date(p.exp * 1000).toISOString() : null,
    raw: p,
  };
}

/* ---------- MSAL access token + exchange ---------- */
async function acquireApiAccessToken() {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) {
    await msalInstance.loginRedirect(loginRequest);
    throw new Error("No active account");
  }
  try {
    const res = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    // DEBUG: imprime claims clave del access_token
    const p = decodeAppJwt(res.accessToken);
    const exp = p?.exp ? new Date(p.exp * 1000).toISOString() : "n/a";
    console.log("[AAD access_token] aud=", p.aud, "scp=", p.scp, "iss=", p.iss, "exp=", exp);
    return res.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      await msalInstance.loginRedirect(loginRequest);
    }
    throw e;
  }
}

async function doExchange(aadAccessToken) {
  const res = await axios.post(`${API_BASE_URL}/auth/exchange`, {}, {
    headers: { Authorization: `Bearer ${aadAccessToken}` },
  });
  const token = res?.data?.token;
  if (!token) throw new Error("Respuesta inválida de /auth/exchange");

  // Guardar y LOGUEAR el App JWT (usuario + correo + roles)
  setAppJwt(token);
  const payload = getAppUser(token);
  console.log(
    "%c[App JWT]",
    "color:#0a0;font-weight:bold",
    { name: payload.name, email: payload.email, roles: payload.roles, exp: payload.expIso, iss: payload.iss, aud: payload.aud }
  );

  // (Opcional) acceso rápido por consola
  // window.__APP_JWT__ = token;
  // window.__APP_CLAIMS__ = payload;

  return token;
}

/**
 * Asegura que existe un App JWT válido en sessionStorage.
 * - Si no está o expiró: MSAL → /auth/exchange → guarda App JWT
 * - Devuelve el App JWT listo para usar
 */
export async function ensureAppJwt() {
  let t = getAppJwt();
  if (!isValid(t)) {
    const aad = await acquireApiAccessToken();
    t = await doExchange(aad);
  }
  return t;
}

/* ---------- cliente Axios con interceptor ---------- */
export const api = axios.create({ baseURL: API_BASE_URL });

let refreshing = false;

api.interceptors.request.use(async (config) => {
  const t = await ensureAppJwt(); // asegura App JWT antes de cada request
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
    const original = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      if (refreshing) throw error;
      try {
        refreshing = true;
        original._retry = true;
        const aad = await acquireApiAccessToken();
        const t = await doExchange(aad);
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
