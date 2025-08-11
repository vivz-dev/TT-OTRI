/**
 * ResolucionesPage
 * ----------------
 * El título del Card será el código de la resolución
 * y la descripción original pasa a `descripcion`.
 */
import './ResolucionesPage.css';
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetResolutionsQuery } from '../../services/resolutionsApi';

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const ResolucionesPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetResolutionsQuery();

  const dummyData = useMemo(
    () =>
      (error ? [] : data).map((r) => ({
        id:          r.id,
        estado:      r.estado,
        completed:   r.completed,
        titulo:      r.codigo,          // ← título = número/código
        descripcion: r.descripcion,     // ← cuerpo = descripción
        fecha:       fmtFecha(r.fechaResolucion),
        usuario:     r.usuarioRegistrador,
      })),
    [data, error]
  );

  const [filter, setFilter]     = useState('todas');
  const [searchText, setSearch] = useState('');

  if (isLoading) return <p>Cargando…</p>;

  const filterOptions = [
    { label: 'Todas',    value: 'todas'   },
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
        setSearchText={setSearch}
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
