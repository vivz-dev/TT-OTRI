import './TecnologiasPage.css';
import React, { useState } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';

const TecnologiasPage = ({ onRegister }) => {
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Disponibles', value: 'Disponible' },
    { label: 'No Disponibles', value: 'No Disponible' }
  ];

  const dummyData = [
  {
    id: 1,
    estado: 'Disponible',
    titulo: 'SENTIFY',
    descripcion:
      'Supongamos que es una descripción muy larga… También puede ser el título del documento.',
    usuario: 'Viviana Yolanda Vera Falconí',
    protecciones: ['Derecho de autor', 'Secreto empresarial'],
    completed: true,
  },
  {
    id: 2,
    estado: 'No Disponible',
    titulo: 'INVENTORY AI',
    descripcion:
      'Tecnología ya licenciada a tercero — actualmente no disponible.',
    usuario: 'Juan Pérez',
    protecciones: ['Patente de invención'],
    completed: false,
  },
  {
    id: 3,
    estado: 'Disponible',
    titulo: 'SMART-AGRO',
    descripcion:
      'Plataforma de monitoreo agrícola basada en IoT y analítica.',
    usuario: 'María López',
    protecciones: ['Modelo de utilidad', 'Secreto empresarial'],
    completed: true,
  },
];


  return (
    <main className="page-container">
      <PageHeader
        title={
          <span>
            Tecnologías/<em>Know-how</em>
          </span>
        }
        subtitle={
          <span>
            Gestiona y consulta todas las tecnologías/<em>know-how</em>.
          </span>
        }
      />
      <ActionBar
              filter={filter}
              setFilter={setFilter}
              options={filterOptions}
              searchText={searchText}
              setSearchText={setSearchText}
              onRegister={onRegister}
      />
      <CardScroll
        filter={filter}
        searchText={searchText}
        dummyData={dummyData}
      />
    </main>
  );
}


export default TecnologiasPage;