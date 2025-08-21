import React from "react";
import "./Page.css";
import ResolucionesPage from "../../Resoluciones/ResolucionesPage";
import RegistrarResolucionPage from "../../Resoluciones/RegistrarResolucionPage";
import TecnologiasPage from "../../Tecnologias/TecnologiasPage";
import RegistrarTecnologiasPage from "../../Tecnologias/RegistrarTecnologiasPage";
import TransferenciaTecnologicaPage from "../../Transferencia/TransferenciaTecnologicaPage";
import RegistrarTransferenciaPage from "../../Transferencia/RegistrarTransferenciaPage";
import PagosPage from "../../Pagos/PagosPage";

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

const Page = ({ activeSection, setActiveSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case "registrar-resolucion":
        return (
          <RegistrarResolucionPage
            onBack={() => setActiveSection("resoluciones")}
            onSuccess={() => setActiveSection("resoluciones")} // 👈 redirección interna
          />
        );

      case "resoluciones":
        return (
          <ResolucionesPage
            onRegister={() => setActiveSection("registrar-resolucion")}
          />
        );
      case "tecnologias":
        return (
          <TecnologiasPage
            onRegister={() => setActiveSection("registrar-tecnologia")}
          />
        );
      case "registrar-tecnologia":
        return (
          <RegistrarTecnologiasPage
            onBack={() => setActiveSection("tecnologias")}
          />
        );
      case "transferencia-tecnologica":
        return (
          <TransferenciaTecnologicaPage
            onRegister={() => setActiveSection("registrar-transferencia")}
          />
        );
      case "registrar-transferencia":
        return (
          <RegistrarTransferenciaPage
            onBack={() => setActiveSection("transferencia-tecnologica")}
          />
        );
      case "pagos":
        return <PagosPage />;
      case "roles-permisos":
        return <RolesPermisosPage />;
      case "ajustes":
        return <AjustesPage />;
      default:
        return <ResolucionesPage />;
    }
  };

  return <main className="app-page">{renderContent()}</main>;
};

export default Page;
