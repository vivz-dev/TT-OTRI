// src/services/api.js
import axios from "axios";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../components/Auth/authConfig";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
const APP_JWT_KEY = "app_jwt";
export const SELECTED_ROLE_KEY = "selectedRole";

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

  const roles = extractRoleNamesFromPayload(p);

  // Normaliza email: si viene como array, toma el primero
  let email = p.email;
  if (Array.isArray(email)) {
    email = email.find(e => typeof e === 'string' && e.includes('@')) || email[0];
  }
  email = email
    || (p.unique_name && p.unique_name.includes("@") ? p.unique_name : null)
    || p.upn
    || (p.emails && Array.isArray(p.emails) ? p.emails[0] : null)
    || "";

  return {
    name: p.name || p.unique_name || p.upn || (typeof email === 'string' ? email : "") || "",
    upn: p.unique_name || p.upn || (typeof email === 'string' ? email : "") || "",
    email: typeof email === 'string' ? email : "",
    roles,              // <-- ahora son strings "bonitos"
    sub: p.sub,
    iss: p.iss,
    aud: p.aud,
    expIso: p?.exp ? new Date(p.exp * 1000).toISOString() : null,
    raw: p,
  };
}

/* ---------- Catálogo: Roles válidos SOLO de tu sistema ---------- */
/** Nombres exactos (case-insensitive) permitidos para renderizar en UI */
export const SYSTEM_ROLES = [
  "Administrador de sistema OTRI",
  "Administrador de contrato de TT",
  "Autor",
  "Autoridad OTRI",
  "Director de la OTRI",
  "Gerencia Jurídica",
  "Financiero",
];

/** Alias opcionales -> nombre canónico (por si tu backend emite variantes) */
const ROLE_ALIASES = {
  "admin sistema otri": "Administrador de sistema OTRI",
  "administrador de sistema": "Administrador de sistema OTRI",
  "admin contrato tt": "Administrador de contrato de TT",
  "administrador de contrato tt": "Administrador de contrato de TT",
  "autor(a)": "Autor",
  "autor/inventor": "Autor",
  "autoridad": "Autoridad OTRI",
  "director otri": "Director de la OTRI",
  "dirección otri": "Director de la OTRI",
  "jurídico": "Gerencia Jurídica",
  "gerencia juridica": "Gerencia Jurídica",
  "finanzas": "Financiero",
};

// --- util: ¿parece JSON? ---
function looksLikeJson(s) {
  return typeof s === 'string' && /^[\[{].*[\]}]$/.test(s.trim());
}

// --- util: convierte a array de strings ---
function toStringArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String);
  return [String(x)];
}

// --- EXTRAER ROLES desde payload, robusto a variantes ---
function extractRoleNamesFromPayload(p) {
  const roleUri  =process.env.REACT_APP_API_BASE_URI;

  // 1) candidatos crudos
  let rawRoles = [];
  if (Array.isArray(p.roles)) rawRoles = p.roles;
  else if (p.roles) rawRoles = [p.roles];
  else if (Array.isArray(p.role)) rawRoles = p.role;
  else if (p.role) rawRoles = [p.role];
  else if (p[roleUri]) rawRoles = Array.isArray(p[roleUri]) ? p[roleUri] : [p[roleUri]];

  // 2) expandir posibles JSON stringificados
  const expanded = [];
  for (const item of rawRoles) {
    if (typeof item === 'string' && looksLikeJson(item)) {
      try {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          // puede ser array de strings u objetos { idRol, nombre }
          for (const el of parsed) {
            if (typeof el === 'string') expanded.push(el);
            else if (el && typeof el === 'object') {
              if (el.nombre) expanded.push(String(el.nombre));
              else if (el.Name) expanded.push(String(el.Name));
              else if (el.rol) expanded.push(String(el.rol));
            }
          }
          continue;
        } else if (parsed && typeof parsed === 'object') {
          if (parsed.nombre) { expanded.push(String(parsed.nombre)); continue; }
          if (parsed.Name)   { expanded.push(String(parsed.Name));   continue; }
          if (parsed.rol)    { expanded.push(String(parsed.rol));    continue; }
        }
      } catch {
        // si falla el parse, cae al push normal
      }
    }
    // fallback: tratar como string plano
    expanded.push(String(item));
  }

  // 3) limpiar duplicados y vacíos
  return Array.from(new Set(expanded.map(s => s.trim()).filter(Boolean)));
}


/** Normaliza un rol a su forma canónica si aplica */
function normalizeRoleName(name) {
  if (!name) return null;
  const clean = String(name).trim();
  const lower = clean.toLowerCase();

  // catálogo oficial
  const SYSTEM_ROLES = [
    "Administrador de sistema OTRI",
    "Administrador de contrato de TT",
    "Autor",
    "Autoridad OTRI",
    "Director de la OTRI",
    "Gerencia Jurídica",
    "Financiero",
  ];

  const ROLE_ALIASES = {
    "admin sistema otri": "Administrador de sistema OTRI",
    "administrador de sistema": "Administrador de sistema OTRI",
    "admin contrato tt": "Administrador de contrato de TT",
    "administrador de contrato tt": "Administrador de contrato de TT",
    "autor(a)": "Autor",
    "autor/inventor": "Autor",
    "autoridad": "Autoridad OTRI",
    "director otri": "Director de la OTRI",
    "dirección otri": "Director de la OTRI",
    "jurídico": "Gerencia Jurídica",
    "gerencia juridica": "Gerencia Jurídica",
    "finanzas": "Financiero",
  };

  if (ROLE_ALIASES[lower]) return ROLE_ALIASES[lower];
  const exact = SYSTEM_ROLES.find(r => r.toLowerCase() === lower);
  return exact ?? null;
}

/** Reemplaza getSystemRolesFromJwt por esta versión */
export function getSystemRolesFromJwt(token = getAppJwt()) {
  const { roles } = getAppUser(token);
  const set = new Set();
  roles.forEach(r => {
    const norm = normalizeRoleName(r);
    if (norm) set.add(norm);
  });
  return Array.from(set);
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

  return token;
}

/** Asegura que existe un App JWT válido en sessionStorage. */
export async function ensureAppJwt() {
  let t = getAppJwt();
  if (!isValid(t)) {
    const aad = await acquireApiAccessToken();
    t = await doExchange(aad);
  }
  return t;
}

/* ---------- Persistencia del rol elegido ---------- */
export function setSelectedRole(roleName) {
  if (!roleName) return;
  localStorage.setItem(SELECTED_ROLE_KEY, roleName);
}
export function getSelectedRole() {
  return localStorage.getItem(SELECTED_ROLE_KEY) || null;
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
