import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import App from './App';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig, loginRequest } from './components/Auth/authConfig';
import './index.css';

/**
 * Initialize a PublicClientApplication instance which is provided to the MsalProvider component
 * We recommend initializing this outside of your root component to ensure it is not re-initialized on re-renders
 */
const msalInstance = new PublicClientApplication(msalConfig);
const rootEl = document.getElementById("root")
// const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * We recommend wrapping most or all of your components in the MsalProvider component. It's best to render the MsalProvider as close to the root as possible.
 */
async function bootstrap() {
    //
    const authResult = await msalInstance.handleRedirectPromise();
    console.log(authResult)

    if(authResult){
        msalInstance.setActiveAccount(authResult.account);
    }

    let account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

    if(!account){
        msalInstance.loginRedirect(loginRequest);
        return
        // const all = msalInstance.getAllAccounts();
        // console.log(all)
        // if (all.length){
        //     account = all[0];
        //     msalInstance.setActiveAccount(account);
        // }
    }

    await msalInstance.acquireTokenSilent({...loginRequest, account })
    try {
        await msalInstance.acquireTokenSilent(loginRequest);
    } catch (err) {
        if( err instanceof InteractionRequiredAuthError){
            msalInstance.loginRedirect(loginRequest);
            return;
        }
        console.error(err);
    }

    ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>

    )
    
}
// root.render(
//     <React.StrictMode>
//         <MsalProvider instance={msalInstance}>
//             <App />
//         </MsalProvider>
//     </React.StrictMode>
// );

bootstrap();