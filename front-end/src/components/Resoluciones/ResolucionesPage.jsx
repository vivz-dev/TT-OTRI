import './ResolucionesPage.css';
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetResolutionsQuery } from '../../services/resolutionsApi';

/* --- helpers locales --- */
const estadoToColor = (estado) =>
  estado === 'Vigente' ? '#4ade80' : '#f87171';

/* Formatea fecha ISO a “16 de septiembre de 2025” */
const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const ResolucionesPage = ({ onRegister }) => {
  /* 1️⃣  Hook generado por RTK Query */
  const { data: apiData = [], isLoading, error } = useGetResolutionsQuery();

  /* 2️⃣  Mapea propiedades que solo el front necesita */
  const dummyData = useMemo(
    () =>
      apiData.map((r) => ({
        ...r,
        estadoColor: estadoToColor(r.estado),
        fecha: fmtFecha(r.fechaResolucion),
        iconoFecha: 'calendar',
        usuario: r.usuarioRegistrador,
      })),
    [apiData]
  );

  /* 3️⃣  Filtros locales (no van al store) */
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');

  if (isLoading) return <p>Cargando…</p>;
  if (error)     return <p>Error 😢</p>;

  console.log(apiData)

  const filterOptions = [
    { label: 'Todas',     value: 'todas'   },
    { label: 'Vigentes',  value: 'Vigente' },
    { label: 'Derogadas', value: 'Derogada'},
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

      <CardScroll
        filter={filter}
        searchText={searchText}
        dummyData={dummyData}
      />
    </main>
  );
};

export default ResolucionesPage;
