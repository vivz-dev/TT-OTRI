import React from 'react';
import { Shield } from 'lucide-react';
import './Ajustes.css'; // Asumiendo que tendrás estilos específicos

const Ajustes = ({ setActiveSection }) => {
  return (
    <div className="page-content">
      <h2>Ajustes</h2>
      
      <div className="ajustes-grid">
        <div className="ajuste-card">
          <div className="ajuste-icono">
            <Shield size={32} />
          </div>
          <h3>Gestión de Roles</h3>
          <p>Administra los roles y permisos de los usuarios del sistema</p>
          <button 
            className="btn-gestionar-roles"
            onClick={() => setActiveSection('roles-permisos')}
          >
            <Shield size={16} />
            <span>Gestionar Roles</span>
          </button>
        </div>
        
        {/* Puedes agregar más tarjetas de ajustes aquí en el futuro */}
      </div>
    </div>
  );
};

export default Ajustes;