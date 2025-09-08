// src/components/RolesHeader.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader }  from '../layouts/components/index';

const RegistrarResolucionHeader = ({ onBack }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="roles-header">
      <button
        className="back-btn"
        type="button"
        onClick={onBack}
        aria-label="Regresar"
      >
        <ArrowLeft size={24} />
      </button>

      <PageHeader
        title="Gestión de Roles"
        description="Administra los permisos y roles de los usuarios del sistema"
      />
    </div>
  );
};

export default RegistrarResolucionHeader;
