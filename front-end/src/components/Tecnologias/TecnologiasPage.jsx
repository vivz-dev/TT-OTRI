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

  const { data = [], isLoading, error } = useGetTechnologiesQuery();

  // Si quisieras re-mapear o formatear fechas aquí, puedes:
  const mapped = useMemo(() => data, [data]);

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
          dummyData={mapped}
        />
      )}
    </main>
  );
};

export default TecnologiasPage;
