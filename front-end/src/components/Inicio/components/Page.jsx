import React from "react";
import "./Page.css";
import ResolucionesPage from "../../Resoluciones/ResolucionesPage";
import RegistrarResolucionPage from "../../Resoluciones/RegistrarResolucionPage";
import TecnologiasPage from "../../Tecnologias/TecnologiasPage";
import RegistrarTecnologiasPage from "../../Tecnologias/RegistrarTecnologiasPage";
import TransferenciaTecnologicaPage from "../../Transferencia/TransferenciaTecnologicaPage";
import RegistrarTransferenciaPage from "../../Transferencia/RegistrarTransferenciaPage";
import PagosPage from "../../Pagos/PagosPage";
import Ajustes from "../../Ajustes/Ajustes"; // Asegúrate de que la ruta sea correcta
import Roles from "../../Roles/Roles";

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
        return <Roles onBack={() => setActiveSection("ajustes")} />;
     case "ajustes":
        return <Ajustes setActiveSection={setActiveSection} />;
      default:
        return <ResolucionesPage />;
    }
  };

  return <main className="app-page">{renderContent()}</main>;
};

export default Page;
