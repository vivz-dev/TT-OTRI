import './ResolucionesPage.css';
import React, { useState } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';

const ResolucionesPage = () => {
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Vigentes', value: 'Vigente' },
    { label: 'Derogadas', value: 'Derogada' }
  ];

  const dummyData = [
  {
    id: 1,
    numero: '24-07-228',
    estado: 'Vigente',
    estadoColor: '#4ade80',
    titulo: 'Transferencia Tecnológica 1',
    subtitulo: 'SENTIFY',
    descripcion: 'Supongamos que es una descripción muy larga... También puede ser el título del documento de resolución.',
    fecha: '16 de septiembre de 2025',
    iconoFecha: 'calendar',
    usuario: 'Viviana Yolanda Vera Falconí',
    iconoUsuario: 'user',
    completed: true,
  },
  {
    id: 2,
    numero: '22-04-386',
    estado: 'Derogada',
    estadoColor: '#f87171',
    titulo: 'Resolución derogada',
    subtitulo: 'Distribución del caso',
    descripcion: 'Distribución cancelada. Este documento ya no se encuentra vigente.',
    fecha: '10 de enero de 2023',
    iconoFecha: 'calendar',
    usuario: 'Juan Pérez',
    iconoUsuario: 'user',
    completed: false,
  },
  {
    id: 3,
    numero: '21-12-118',
    estado: 'Vigente',
    estadoColor: '#4ade80',
    titulo: 'Convenio Internacional',
    subtitulo: 'MIT',
    descripcion: 'Documento de colaboración internacional con participación activa en investigaciones.',
    fecha: '01 de julio del 2024',
    iconoFecha: 'calendar',
    usuario: 'María López',
    iconoUsuario: 'user',
    completed: true,
  },
];


  return (
    <main className="page-container">
      <PageHeader 
      title="Resoluciones"
      subtitle="Gestiona y consulta todas las resoluciones."
    />
      <ActionBar
        filter={filter}
        setFilter={setFilter}
        options={filterOptions}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <CardScroll
        filter={filter}
        searchText={searchText}
        dummyData={dummyData}
      />
    </main>
  );
}


export default ResolucionesPage;