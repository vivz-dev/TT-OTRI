// MSAL + App JWT (exchange) + helpers

import axios from "axios";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../../components/Auth/authConfig";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const APP_JWT_KEY = "app_jwt";
export const SELECTED_ROLE_KEY = "selectedRole";

export const msalInstance = new PublicClientApplication(msalConfig);

/* -------------------- App JWT storage -------------------- */
export function getAppJwt() {
  return sessionStorage.getItem(APP_JWT_KEY);
}
function setAppJwt(t) {
  sessionStorage.setItem(APP_JWT_KEY, t);
}
export function clearAppJwt() {
  sessionStorage.removeItem(APP_JWT_KEY);
}

/* -------------------- JWT utils -------------------- */
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

export function decodeAppJwt(token) {
  try {
    const [, b64] = token.split(".");
    return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/"))) || {};
  } catch { return {}; }
}

/* -------------------- Roles helpers -------------------- */
export const SYSTEM_ROLES = [
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

function looksLikeJson(s) {
  return typeof s === 'string' && /^[\[{].*[\]}]$/.test(s.trim());
}
function extractRoleNamesFromPayload(p) {
  const roleUri = process.env.REACT_APP_API_BASE_URI; // por si tu backend lo emite bajo una claim URI
  let rawRoles = [];
  if (Array.isArray(p.roles)) rawRoles = p.roles;
  else if (p.roles) rawRoles = [p.roles];
  else if (Array.isArray(p.role)) rawRoles = p.role;
  else if (p.role) rawRoles = [p.role];
  else if (roleUri && p[roleUri]) rawRoles = Array.isArray(p[roleUri]) ? p[roleUri] : [p[roleUri]];

  const expanded = [];
  for (const item of rawRoles) {
    if (typeof item === 'string' && looksLikeJson(item)) {
      try {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
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
      } catch { /* cae a push normal */ }
    }
    expanded.push(String(item));
  }
  return Array.from(new Set(expanded.map(s => s.trim()).filter(Boolean)));
}
function normalizeRoleName(name) {
  if (!name) return null;
  const lower = String(name).trim().toLowerCase();
  if (ROLE_ALIASES[lower]) return ROLE_ALIASES[lower];
  const exact = SYSTEM_ROLES.find(r => r.toLowerCase() === lower);
  return exact ?? null;
}

export function getAppUser(token = getAppJwt()) {
  const p = decodeAppJwt(token);
  const roles = extractRoleNamesFromPayload(p);

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
    roles,
    sub: p.sub,
    iss: p.iss,
    aud: p.aud,
    expIso: p?.exp ? new Date(p.exp * 1000).toISOString() : null,
    raw: p,
  };
}

export function getSystemRolesFromJwt(token = getAppJwt()) {
  const { roles } = getAppUser(token);
  const set = new Set();
  roles.forEach(r => {
    const norm = normalizeRoleName(r);
    if (norm) set.add(norm);
  });
  return Array.from(set);
}

/* -------------------- MSAL + Exchange flow -------------------- */
async function acquireApiAccessToken() {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) {
    await msalInstance.loginRedirect(loginRequest);
    throw new Error("No active account");
  }
  try {
    const res = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    // DEBUG opcional
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

  setAppJwt(token);
  const payload = getAppUser(token);
  console.log("%c[App JWT]", "color:#0a0;font-weight:bold",
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

/** IMPORTANTE: ahora lee de sessionStorage (antes había un bug con localStorage). */
export function getIdPersonaFromAppJwt() {
  const appJwt = getAppJwt();
  if (!appJwt) return null;
  try {
    const payload = decodeAppJwt(appJwt);
    const raw = payload?.idPersona ?? payload?.IdPersona ?? null;
    return raw ? Number(raw) : null;
  } catch { return null; }
}

/* -------------------- Rol elegido (UI) -------------------- */
export function setSelectedRole(roleName) {
  if (!roleName) return;
  localStorage.setItem(SELECTED_ROLE_KEY, roleName);
}
export function getSelectedRole() {
  return localStorage.getItem(SELECTED_ROLE_KEY) || null;
}
