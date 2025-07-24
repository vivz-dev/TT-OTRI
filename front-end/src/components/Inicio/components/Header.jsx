import React from 'react';
import { User } from 'lucide-react';
import './Header.css';

const Header = ({ userName, userRole }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container">
          <img className="logo-img" src="./LogoOTRI2.png" alt="Logo de la OTRI" />
        </div>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">{userRole}</span>
        </div>
        <div className="user-avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;