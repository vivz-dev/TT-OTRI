import React from 'react';
import './Page.css';
import ResolucionesPage from '../../Resoluciones/ResolucionesPage'
import TecnologiasPage from '../../Tecnologias/TecnologiasPage'

// Componentes de páginas individuales
// const ResolucionesPage = () => (
//   <div className="page-content">
//     <h2>Resoluciones</h2>
//     <p>Contenido de resoluciones...</p>
//   </div>
// );

// const TecnologiasPage = () => (
//   <div className="page-content">
//     <h2>Tecnologías/Know-how</h2>
//     <p>Contenido de tecnologías...</p>
//   </div>
// );

const TransferenciaTecnologicaPage = () => (
  <div className="page-content">
    <h2>Transferencia Tecnológica</h2>
    <p>Contenido de transferencia tecnológica...</p>
  </div>
);

const PagosPage = () => (
  <div className="page-content">
    <h2>Pagos</h2>
    <p>Contenido de pagos...</p>
  </div>
);

const RolesPermisosPage = () => (
  <div className="page-content">
    <h2>Roles y Permisos</h2>
    <p>Contenido de roles y permisos...</p>
  </div>
);

const AjustesPage = () => (
  <div className="page-content">
    <h2>Ajustes</h2>
    <p>Contenido de ajustes...</p>
  </div>
);

const Page = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'resoluciones':
        return <ResolucionesPage />;
      case 'tecnologias':
        return <TecnologiasPage />;
      case 'transferencia-tecnologica':
        return <TransferenciaTecnologicaPage />;
      case 'pagos':
        return <PagosPage />;
      case 'roles-permisos':
        return <RolesPermisosPage />;
      case 'ajustes':
        return <AjustesPage />;
      default:
        return <ResolucionesPage />;
    }
  };

  return (
    <main className="app-page">
      {renderContent()}
    </main>
  );
};

export default Page;