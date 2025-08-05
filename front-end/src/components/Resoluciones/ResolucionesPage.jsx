import './ResolucionesPage.css';
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetResolutionsQuery } from '../../services/resolutionsApi';

/* --- helpers --- */
const estadoToColor = (e) => (e === 'Vigente' ? '#4ade80' : '#f87171');
const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const ResolucionesPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetResolutionsQuery();

  /* ➜  Mapea solo cuando hay data válida */
  const dummyData = useMemo(
    () =>
      (error ? [] : data).map((r) => ({
        ...r,
        estadoColor: estadoToColor(r.estado),
        fecha: fmtFecha(r.fechaResolucion),
        iconoFecha: 'calendar',
        usuario: r.usuarioRegistrador,
      })),
    [data, error]
  );

  /* Filtros locales */
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');

  /* Loader a pantalla completa */
  if (isLoading) return <p>Cargando…</p>;

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Vigentes', value: 'Vigente' },
    { label: 'Derogadas', value: 'Derogada' },
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
        onRegister={onRegister}
      />

      {/* CardScroll recibirá [] si hay error o lista vacía */}
      <CardScroll
        filter={filter}
        searchText={searchText}
        dummyData={dummyData}
      />
    </main>
  );
};

export default ResolucionesPage;
