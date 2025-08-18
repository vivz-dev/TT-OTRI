// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import App from './App';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { Provider } from 'react-redux';
import { store } from './store';
import { msalConfig, loginRequest } from './components/Auth/authConfig';
import './index.css';
import { ensureAppJwt, decodeAppJwt, getAppUser, getAppJwt, clearSelectedRole } from './services/api'; // <-- añade helpers

const msalInstance = new PublicClientApplication(msalConfig);
const ROOT_EL = document.getElementById("root");

async function bootstrap() {
  const authResult = await msalInstance.handleRedirectPromise().catch(() => null);
  if (authResult?.account) msalInstance.setActiveAccount(authResult.account);

  let account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) {
    await msalInstance.loginRedirect(loginRequest);
    return;
  }
  msalInstance.setActiveAccount(account);

  if (!getAppJwt()) {
    clearSelectedRole();
  }

  try {
    const appJwt = await ensureAppJwt();              // ⬅️ ahora capturamos el token
    const user = getAppUser(appJwt);                  // ⬅️ y sacamos usuario/roles
    console.log("%c[App User]", "color:#06c;font-weight:bold", user);
  } catch (e) {
    clearSelectedRole();
    // throw e;
    if (e instanceof InteractionRequiredAuthError) return; // redirige
    console.error(e);
  }

  ReactDOM.createRoot(ROOT_EL).render(
    <React.StrictMode>
      <Provider store={store}>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </Provider>
    </React.StrictMode>
  );
}

bootstrap();
