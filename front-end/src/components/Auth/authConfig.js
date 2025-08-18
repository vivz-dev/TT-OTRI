import { LogLevel } from "@azure/msal-browser";

// Lee envs
const SPA_CLIENT_ID  = process.env.REACT_APP_SPA_CLIENT_ID;
const TENANT_ID      = process.env.REACT_APP_TENANT_ID;
const API_CLIENT_ID  = process.env.REACT_APP_API_CLIENT_ID;
const API_SCOPE_NAME = process.env.REACT_APP_API_SCOPE_NAME;

function assertEnv(name, value) {
  if (!value || String(value).trim() === "") {
    throw new Error(`[MSAL] Falta variable de entorno ${name}`);
  }
}

// Si prefieres fallo duro, descomenta estas 4 líneas:
assertEnv("REACT_APP_SPA_CLIENT_ID", SPA_CLIENT_ID);
assertEnv("REACT_APP_TENANT_ID", TENANT_ID);
assertEnv("REACT_APP_API_CLIENT_ID", API_CLIENT_ID);
assertEnv("REACT_APP_API_SCOPE_NAME", API_SCOPE_NAME);

// Fallback DEV: usa "common" si no hay TENANT_ID (evita /undefined/…)
const authorityTenant = TENANT_ID && TENANT_ID !== "undefined" ? TENANT_ID : "common";

export const msalConfig = {
  auth: {
    clientId: SPA_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${authorityTenant}`,
    redirectUri: "http://localhost:3000/",
  },
  cache: { cacheLocation: "sessionStorage", storeAuthStateInCookie: false },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
        else if (level === LogLevel.Warning) console.warn(message);
        else if (level === LogLevel.Info) console.info(message);
        else console.debug(message);
      },
    },
  },
};

// Scope de TU API (NO Graph)
const API_SCOPE = API_CLIENT_ID && API_SCOPE_NAME
  ? `api://${API_CLIENT_ID}/${API_SCOPE_NAME}`
  : undefined;

export const loginRequest = {
  scopes: API_SCOPE ? [API_SCOPE] : ["openid", "profile", "email"],
};

export const graphRequest = { scopes: ["User.Read"] };
export const graphConfig  = { graphMeEndpoint: "https://graph.microsoft.com/v1.0/me" };
