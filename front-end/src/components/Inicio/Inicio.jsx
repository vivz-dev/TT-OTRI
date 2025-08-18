// src/components/Inicio/Inicio.jsx
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Page from './components/Page';
import './Inicio.css';

import {
  ensureAppJwt,
  getAppJwt,
  getAppUser,
  getSelectedRole,
} from '../../services/api';

const Inicio = () => {
  const { accounts } = useMsal();
  const account = accounts?.[0];
  const fallbackName = account?.name || 'Usuario';

  const [userName, setUserName] = useState(fallbackName);
  const [userRole, setUserRole] = useState(getSelectedRole() || '—');
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState('resoluciones');

  useEffect(() => {
    (async () => {
      await ensureAppJwt();
      const jwt = getAppJwt();
      const user = getAppUser(jwt);
      setUserName(user?.name || fallbackName);
      const role = getSelectedRole() || '—';
      setUserRole(role);

      // 🔊 Como pediste: console.log en pantalla de inicio
      console.log("%c[INICIO] Sesión activa", "color:#0a0;font-weight:bold");
      console.log({ jwt, nombreCompleto: user.name, email: user.email, rolElegido: role });

      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuSelect = (sectionId) => {
    setActiveSection(sectionId);
  };

  if (!ready) {
    return (
      <div className="app-container">
        <div className="app-body" style={{ padding: 24 }}>Cargando inicio…</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        userName={userName}
        userRole={userRole}
      />

      <div className="app-body">
        <Sidebar onMenuSelect={handleMenuSelect} />
        <Page activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>
    </div>
  );
};

export default Inicio;
