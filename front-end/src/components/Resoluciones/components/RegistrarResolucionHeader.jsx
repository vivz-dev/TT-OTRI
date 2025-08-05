// src/components/RegistrarResolucionHeader.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader }  from '../../layouts/components/index';
import './RegistrarResolucionHeader.css';

const RegistrarResolucionHeader = ({ onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="registrar-resolucion-header">
      <button
        className="back-btn"
        type="button"
        onClick={onBack}
        aria-label="Regresar"
      >
        <ArrowLeft size={24} />
      </button>

      <PageHeader
        title="Registrar resolución"
        description="Registra una nueva resolución en el sistema."
      />
    </div>
  );
};

export default RegistrarResolucionHeader;
