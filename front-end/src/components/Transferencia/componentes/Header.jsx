import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader }  from '../../layouts/components/index';
import './Header.css';

const Header = ({ onBack }) => {

  return (
    <div className="tech-header">
      <button
        className="back-btn"
        type="button"
        onClick={onBack}
        aria-label="Regresar"
      >
        <ArrowLeft size={24} />
      </button>

      <PageHeader
              title={
                <span>
                  Registrar Transferencia Tecnológica
                </span>
              }
              subtitle={
                <span>
                  Completa o guarda como borrador los datos de la TT.
                </span>
              }
      />
    </div>
  );
};

export default Header;
