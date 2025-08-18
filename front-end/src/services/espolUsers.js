// Servicio específico para /espol-users (idPersona por email, etc.)

import { api } from "./http.service";
import { getAppUser, getIdPersonaFromAppJwt } from "./auth/auth";

const CACHE_KEY_PREFIX = "idPersona:";
function cacheKey(email) {
  return `${CACHE_KEY_PREFIX}${(email || "").toLowerCase()}`;
}

export async function getPersonaIdByEmail(email) {
  if (!email || !email.includes("@")) {
    throw new Error("Email inválido.");
  }

  // 1) cache local (sessionStorage) por email
  const ck = cacheKey(email);
  const cached = sessionStorage.getItem(ck);
  if (cached) {
    const n = Number(cached);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // 2) request a /api/espol-users/id?email=...
  const { data } = await api.get("/espol-users/id", { params: { email } });
  const id = Number(data?.idPersona ?? data?.IdPersona ?? data);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Respuesta inválida del endpoint /espol-users/id.");
  }

  // cache
  sessionStorage.setItem(ck, String(id));
  return id;
}

/** Conveniencia: resolver idPersona usando el email del App JWT */
export async function getPersonaIdFromJwtOrFetch() {
  // a) ¿ya viene en el JWT?
  const direct = getIdPersonaFromAppJwt();
  if (Number.isFinite(direct) && direct > 0) return direct;

  // b) sino, derivamos por email
  const { email } = getAppUser();
  if (!email) throw new Error("No se pudo determinar el email del usuario.");
  return getPersonaIdByEmail(email);
}

/** Limpia caché para un email */
export function purgePersonaIdCache(email) {
  sessionStorage.removeItem(cacheKey(email));
}
