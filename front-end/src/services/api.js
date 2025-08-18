// Mantén compatibilidad con imports existentes.
// Re-exporta la instancia axios autenticada y utilidades de auth.

export { api } from "./auth/http";
export {
  API_BASE_URL,
  getAppJwt,
  clearAppJwt,
  ensureAppJwt,
  decodeAppJwt,
  getAppUser,
  getSystemRolesFromJwt,
  getSelectedRole,
  setSelectedRole,
  getIdPersonaFromAppJwt,
  SYSTEM_ROLES,
  clearSelectedRole,
} from "./auth/auth";
