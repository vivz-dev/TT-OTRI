import React, { useState } from 'react';
import { 
  FileText, 
  Waypoints, 
  Banknote,
  ArrowRightLeft,
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  Microscope
} from 'lucide-react';
import MenuItem from './atoms/MenuItem';
import './Sidebar.css';

const Sidebar = ({ onMenuSelect }) => {
  const [activeItem, setActiveItem] = useState('resoluciones');
  const [expandedSections, setExpandedSections] = useState({});

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    onMenuSelect(itemId);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const menuStructure = [
    {
      id: 'documentos',
      label: 'Documentos',
      type: 'section'
    },
    {
      id: 'resoluciones',
      label: 'Resoluciones',
      icon: <FileText size={18} />,
      parent: 'documentos'
    },
    {
      id: 'tecnologias',
      label: (
        <>
          Tecnologías/<br />
          <em>Know-how</em>
        </>
      ),
      icon: <Waypoints size={18} />,
      parent: 'documentos'
    },
    {
      id: 'transferencia',
      label: 'Transferencia',
      type: 'section'
    },
    {
      id: 'transferencia-tecnologica',
      label: 'Transferencia Tecnológica',
      icon: <ArrowRightLeft size={18} />,
      parent: 'transferencia'
    },
    {
      id: 'pagos',
      label: 'Pagos',
      icon: <Banknote size={18} />,
      parent: 'transferencia'
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      type: 'section'
    },
    {
      id: 'roles-permisos',
      label: 'Roles y permisos',
      icon: <Users size={18} />,
      parent: 'configuracion'
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      icon: <Settings size={18} />,
      parent: 'configuracion'
    }
  ];

  const sections = menuStructure.filter(item => item.type === 'section');
  
  return (
    <aside className="app-sidebar">
      {sections.map(section => {
        const sectionItems = menuStructure.filter(item => item.parent === section.id);
        
        return (
          <div key={section.id} className="menu-section">
            <div className="menu-section-header">
              <span className="menu-section-title">{section.label}</span>
            </div>
            <div className="menu-section-items">
              {sectionItems.map(item => (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeItem === item.id}
                  onClick={() => handleItemClick(item.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;