import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Network, Scale, BookType, CircleDollarSign, Lightbulb, School } from 'lucide-react';

import './RoleSelection.css'; // Importamos el CSS

const roles = [
  {
    id: 'admin-sistema',
    title: 'Admin de',
    subtitle: 'Sistema',
    icon: Settings,
  },
  {
    id: 'admin-contrato',
    title: 'Admin de',
    subtitle: 'Contrato',
    icon: User,
  },
  {
    id: 'gestor-otri',
    title: 'Gestores de',
    subtitle: 'la OTRI',
    icon: Network,
  },
  {
    id: 'autor-inventor',
    title: 'Autor(a)/',
    subtitle: 'Inventor(a)',
    icon: Lightbulb,
  },
  {
    id: 'autoridad',
    title: 'Autoridad',
    subtitle: '',
    icon: BookType,
  },
  {
    id: 'direct-otri',
    title: 'Director(a)',
    subtitle: 'de la OTRI',
    icon: School,
  },
  {
    id: 'juridico',
    title: 'Gerencia',
    subtitle: 'Jurídica',
    icon: Scale,
  },
  {
    id: 'financiero',
    title: 'Financiero',
    subtitle: '',
    icon: CircleDollarSign,
  },
];

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    console.log(`Selected role: ${roleId}`);
    
    // Navegar a inicio después de un pequeño delay para mostrar la selección
    setTimeout(() => {
      // Si usas React Router
      // navigate('/inicio');
      
      // Si no usas React Router, puedes usar:
      window.location.href = '/inicio';
    }, 300);
  };

  return (
    <div className="role-selection-container">
      <div className="content-wrapper">
        <div className="header">
          <h1>Por favor, elija su rol</h1>
          <p>Elija el rol con el que navegará dentro del sistema.</p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            const isHovered = hoveredRole === role.id;

            return (
              <div
                key={role.id}
                className={`role-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                onClick={() => handleRoleSelect(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <div className="card-content">
                  <div className={`icon-wrapper ${isSelected || isHovered ? 'active' : ''}`}>
                    <IconComponent size={24} />
                  </div>

                  <div className="role-text">
                    <div className="role-title">{role.title}</div>
                    {role.subtitle && (
                      <div className="role-subtitle">{role.subtitle}</div>
                    )}
                  </div>
                </div>

                {(isSelected || isHovered) && (
                  <div className="selected-indicator">
                    <div className="indicator-dot"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;