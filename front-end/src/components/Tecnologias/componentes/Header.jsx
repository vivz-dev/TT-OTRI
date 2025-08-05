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
                  Registrar tecnologías/<em>know-how</em>
                </span>
              }
              subtitle={
                <span>
                  Registra nuevas tecnologías/<em>know-how</em>.
                </span>
              }
      />
    </div>
  );
};

export default Header;
