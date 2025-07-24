import React from 'react';
import './MenuItem.css';

const MenuItem = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false, 
  hasSubmenu = false,
  isExpanded = false 
}) => {
  return (
    <div 
      className={`menu-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="menu-item-content">
        {icon && <span className="menu-item-icon">{icon}</span>}
        <span className="menu-item-label">{label}</span>
        {hasSubmenu && (
          <span className={`menu-item-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▶
          </span>
        )}
      </div>
    </div>
  );
};

export default MenuItem;