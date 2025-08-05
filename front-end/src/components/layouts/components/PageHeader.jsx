import React from 'react';
import './PageHeader.css'

const PageHeader = ({ title, subtitle }) => (
  <header className="page-header">
    <h2 className="page-header-title">{title}</h2>
    {subtitle && <p className="page-header-sub">{subtitle}</p>}
  </header>
);

export default PageHeader;