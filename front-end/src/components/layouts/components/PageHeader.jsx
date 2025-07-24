import React from 'react';
import './PageHeader.css'

const PageHeader = ({ title, subtitle }) => (
  <section className="page-header">
    <h1 className="page-header-title">{title}</h1>
    <p className='page-header-subtitle'>{subtitle}</p>
  </section>
);

export default PageHeader;