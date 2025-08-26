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
import { ModalProvider } from "../layouts/components/ModalProvider";


const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Sin fecha';

const ResolucionesPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetResolutionsQuery();

  const items = useMemo(
    () =>
      (error ? [] : data).map((r) => ({
        id:          r.id,
        estado:      r.estado,
        completed:   r.completed,
        titulo:      r.codigo || 'Sin título',
        descripcion: r.descripcion || 'Sin descripción',
        fecha:       fmtFecha(r.fechaResolucion),
        usuario:     r.idUsuario || 'Usuario no disponible',
        tipo:        'resolucion',                 // 👈 importante
      })),
    [data, error]
  );

  const [filter, setFilter]       = useState('todas');
  const [searchText, setSearch]   = useState('');
  const filterOptions = [
    { label: 'Todas',    value: 'todas'   },
    { label: 'Vigentes', value: 'Vigente' },
    { label: 'Derogadas', value: 'Derogada' },
  ];
  if (isLoading) return <p>Cargando…</p>;

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

      
      <ModalProvider>
         <CardScroll
        filter={filter}
        searchText={searchText}
        dummyData={items}
        cardButtons={['ver-resolucion', 'editar-resolucion']}            // botón específico
        />
      </ModalProvider>
    </main>
  );
};

export default ResolucionesPage;
