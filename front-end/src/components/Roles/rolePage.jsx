// src/components/Roles/rolePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Network, Scale, BookType, CircleDollarSign, Lightbulb, School } from 'lucide-react';

import './RoleSelection.css';

import {
  ensureAppJwt,
  getAppUser,
  getSystemRolesFromJwt,
  setSelectedRole,
  SYSTEM_ROLES
} from '../../services/api';

// Mapa de "nombre de rol del sistema" -> metadatos de tarjeta
const ROLE_CARD_MAP = {
  "Administrador de sistema OTRI": {
    id: 'admin-sistema-otri',
    title: 'Admin de',
    subtitle: 'Sistema OTRI',
    icon: Settings,
  },
  "Administrador de contrato de TT": {
    id: 'admin-contrato-tt',
    title: 'Admin de',
    subtitle: 'Contrato de TT',
    icon: User,
  },
  "Autor": {
    id: 'autor-inventor',
    title: 'Autor(a)/',
    subtitle: 'Inventor(a)',
    icon: Lightbulb,
  },
  "Autoridad OTRI": {
    id: 'autoridad-otri',
    title: 'Autoridad',
    subtitle: 'OTRI',
    icon: BookType,
  },
  "Director de la OTRI": {
    id: 'director-otri',
    title: 'Director(a)',
    subtitle: 'de la OTRI',
    icon: School,
  },
  "Gerencia Jurídica": {
    id: 'gerencia-juridica',
    title: 'Gerencia',
    subtitle: 'Jurídica',
    icon: Scale,
  },
  "Financiero": {
    id: 'financiero',
    title: 'Financiero',
    subtitle: '',
    icon: CircleDollarSign,
  },
};

const RoleSelection = () => {
  const [cards, setCards] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [hoveredRoleId, setHoveredRoleId] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const allowedNames = useMemo(() => new Set(SYSTEM_ROLES), []);

  useEffect(() => {
    (async () => {
      try {
        await ensureAppJwt();
        const appUser = getAppUser();
        setUserName(appUser?.name || "");

        // Roles del JWT filtrados solo a los de tu sistema
        const rolesInSystem = getSystemRolesFromJwt();

        // Construye tarjetas solo para los roles presentes
        const cardsToShow = rolesInSystem
          .filter(r => allowedNames.has(r)) // seguridad extra
          .map(r => {
            const meta = ROLE_CARD_MAP[r];
            if (!meta) return null;
            return {
              ...meta,
              displayName: r, // nombre canónico exacto que guardarás
            };
          })
          .filter(Boolean);

        setCards(cardsToShow);
      } finally {
        setLoading(false);
      }
    })();
  }, [allowedNames]);

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    const role = cards.find(c => c.id === roleId);
    if (!role) return;

    // Guarda el nombre canónico del rol elegido
    setSelectedRole(role.displayName);

    // Navega a /inicio tras un breve feedback
    setTimeout(() => {
      navigate('/inicio');
    }, 250);
  };

  if (loading) {
    return (
      <div className="role-selection-container">
        <div className="content-wrapper">
          <div className="header">
            <h1>Cargando opciones de rol…</h1>
            <p>Estamos leyendo tu token y preparando tus permisos.</p>
          </div>
        </div>
      </div>
    );
  }

  const empty = !cards || cards.length === 0;

  return (
    <div className="role-selection-container">
      <div className="content-wrapper">
        <div className="header">
          <h1>Hola{userName ? `, ${userName}` : ""} 👋</h1>
          {!empty ? (
            <>
              <h1>Por favor, elija su rol</h1>
              <p>Elija el rol con el que navegará dentro del sistema.</p>
            </>
          ) : (
            <>
              <h2>No tienes roles de OTRI asignados</h2>
              <p>Contacta al administrador.</p>
            </>
          )}
        </div>

        {!empty && (
          <div className="roles-grid">
            {cards.map((card) => {
              const IconComponent = card.icon;
              const isSelected = selectedRoleId === card.id;
              const isHovered = hoveredRoleId === card.id;

              return (
                <div
                  key={card.id}
                  className={`role-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => handleRoleSelect(card.id)}
                  onMouseEnter={() => setHoveredRoleId(card.id)}
                  onMouseLeave={() => setHoveredRoleId(null)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-content">
                    <div className={`icon-wrapper ${isSelected || isHovered ? 'active' : ''}`}>
                      <IconComponent size={24} />
                    </div>

                    <div className="role-text">
                      <div className="role-title">{card.title}</div>
                      {card.subtitle && (
                        <div className="role-subtitle">{card.subtitle}</div>
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
        )}
      </div>
    </div>
  );
};

export default RoleSelection;
