import { LogLevel } from "@azure/msal-browser";

// ⚠️ Reemplaza estos valores por los reales
const SPA_CLIENT_ID  = "8dd6b24d-8e9b-4597-993e-4718fba81300"; // App Registration (SPA)
const TENANT_ID      = "b7af8caf-83d8-4644-85ae-317c545223c1";
const API_CLIENT_ID  = "8dd6b24d-8e9b-4597-993e-4718fba81300"; // App Registration (API)
const API_SCOPE_NAME = "access_as_user"; // el que expusiste en la API

export const msalConfig = {
  auth: {
    clientId: SPA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
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

// ✅ Scope de TU API (NO Graph, NO SPA)
const API_SCOPE = `api://${API_CLIENT_ID}/${API_SCOPE_NAME}`;

export const loginRequest = {
  scopes: [API_SCOPE], // MSAL añadirá openid/profile/email automáticamente
};

// (Opcional) Graph si algún día lo usas
export const graphRequest = { scopes: ["User.Read"] };
export const graphConfig  = { graphMeEndpoint: "https://graph.microsoft.com/v1.0/me" };
