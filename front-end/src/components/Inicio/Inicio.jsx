import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Page from './components/Page';
import './Inicio.css';

const Inicio = () => {
  const { accounts } = useMsal();
  const account = accounts[0];

  console.log(account)
  
  // Obtener el rol del localStorage
  const userRole = localStorage.getItem('selectedRole') || 'Admin de Sistema';
  const userName = account?.name || 'Viviana Yolanda Vera Falconi';
  
  // Estado para la sección activa
  const [activeSection, setActiveSection] = useState('resoluciones');
  
  const handleMenuSelect = (sectionId) => {
    setActiveSection(sectionId);
  };
  
  return (
    <div className="app-container">
      <Header 
        userName={userName}
        userRole={userRole}
      />
      
      <div className="app-body">
        <Sidebar onMenuSelect={handleMenuSelect} />
        <Page activeSection={activeSection} setActiveSection={setActiveSection}/>
      </div>
    </div>
  );
};

export default Inicio;