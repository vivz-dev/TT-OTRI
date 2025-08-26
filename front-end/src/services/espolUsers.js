// Servicio específico para /espol-users (idPersona por email, etc.)
import { api } from "./api";
import { getAppUser, getIdPersonaFromAppJwt } from "./auth/auth";

const CACHE_KEY_PREFIX = "idPersona:";
const PERSONA_DATA_PREFIX = "personaData:";

function cacheKey(email) {
  return `${CACHE_KEY_PREFIX}${(email || "").toLowerCase()}`;
}

function personaDataKey(id) {
  return `${PERSONA_DATA_PREFIX}${id}`;
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

/** Obtener datos completos de una persona por ID */
export async function getPersonaById(id) {
  if (!id || id <= 0) {
    throw new Error("ID de persona inválido.");
  }

  // 1) Verificar si está en caché
  const cacheKey = personaDataKey(id);
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Error al parsear datos cacheados de persona", e);
    }
  }

  // 2) Hacer la petición al servidor
  try {
    const { data } = await api.get(`/espol-users/${id}`);

    // Guardar en caché
    if (data) {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error("Error al obtener datos de persona por ID:", error);
    throw new Error("No se pudieron obtener los datos de la persona.");
  }
}

/** Obtener datos completos de una persona por email */
export async function getPersonaByEmail(email) {
  const id = await getPersonaIdByEmail(email);
  return await getPersonaById(id);
}

/** Búsqueda de usuarios por prefijo de email */
export async function searchUsersByEmail(query, limit = 8) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const { data } = await api.get("/espol-users/search", {
      params: { q: query, limit },
    });

    return data.items || [];
  } catch (error) {
    console.error("Error en búsqueda de usuarios:", error);
    return [];
  }
}

const capitalizeWords = (s = "") =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Obtener nombre completo de una persona por ID */
export async function getPersonaNameById(id) {
  try {
    const persona = await getPersonaById(id);

    console.log("PERSONA BY ID -->", persona)

    if (persona && persona.apellidos && persona.nombres) {
      return `${capitalizeWords(persona.nombres)} ${capitalizeWords(
        persona.apellidos
      )}`.trim();
    }

    return "Usuario no disponible";
  } catch (error) {
    console.error("Error al obtener nombre de persona:", error);
    return "Usuario no disponible";
  }
}

/** Obtener nombre completo de una persona por email */
export async function getPersonaNameByEmail(email) {
  try {
    const id = await getPersonaIdByEmail(email);
    return await getPersonaNameById(id);
  } catch (error) {
    console.error("Error al obtener nombre de persona por email:", error);
    return "Usuario no disponible";
  }
}

/** Limpia caché para un email */
export function purgePersonaIdCache(email) {
  sessionStorage.removeItem(cacheKey(email));
}

/** Limpia datos de persona por ID */
export function purgePersonaDataCache(id) {
  sessionStorage.removeItem(personaDataKey(id));
}

/** Limpia todo el caché de usuarios */
export function purgeAllUserCache() {
  // Eliminar todas las entradas relacionadas con usuarios
  Object.keys(sessionStorage).forEach((key) => {
    if (
      key.startsWith(CACHE_KEY_PREFIX) ||
      key.startsWith(PERSONA_DATA_PREFIX)
    ) {
      sessionStorage.removeItem(key);
    }
  });
}
