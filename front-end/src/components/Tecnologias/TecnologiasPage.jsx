// import './TecnologiasPage.css'; // ya lo tienes
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetTechnologiesQuery } from '../../services/technologiesApi';

const TecnologiasPage = ({ onRegister }) => {
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Disponibles', value: 'Disponible' },
    { label: 'No Disponibles', value: 'No Disponible' },
  ];

  // 1) Trae datos desde la API
  const { data: apiData = [], isLoading, error } = useGetTechnologiesQuery();

  // 2) (opcional) normaliza aquí si necesitas mapear campos
  const data = useMemo(() => apiData ?? [], [apiData]);

  return (
    <main className="page-container">
      <PageHeader
        title={<span> Tecnologías/<em>Know-how</em> </span>}
        subtitle={<span>Gestiona y consulta todas las tecnologías/<em>know-how</em>.</span>}
      />

      <ActionBar
        filter={filter}
        setFilter={setFilter}
        options={filterOptions}
        searchText={searchText}
        setSearchText={setSearchText}
        onRegister={onRegister}
      />

      {/* Estados de carga/errores simples */}
      {isLoading && (
        <div className="card-scroll empty">
          <p className="empty-msg">Cargando tecnologías…</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="card-scroll empty">
          <p className="empty-msg">Ocurrió un error al cargar. Intenta nuevamente.</p>
        </div>
      )}

      {!isLoading && !error && (
        <CardScroll
          filter={filter}
          searchText={searchText}
          dummyData={data}    // ahora viene de la API
        />
      )}
    </main>
  );
};

export default TecnologiasPage;
