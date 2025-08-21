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
import CompletarRegistro from '../layouts/components/CompletarRegistro';

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Sin fecha';

const ResolucionesPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetResolutionsQuery();

  console.log('ResolucionesPage data:', data, 'error:', error);

  const dummyData = useMemo(
    () =>
      (error ? [] : data).map((r) => ({
        id:          r.id,
        estado:      r.estado,
        completed:   r.completed,
        titulo:      r.codigo || 'Sin título',          // ← título = número/código
        descripcion: r.descripcion || 'Sin descripción',    // ← cuerpo = descripción
        fecha:       fmtFecha(r.fechaResolucion),
        usuario:     r.idUsuario || 'Usuario no disponible',
      })),
    [data, error]
  );

  const [filter, setFilter]     = useState('todas');
  const [searchText, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);


  if (isLoading) return <p>Cargando…</p>;

  const filterOptions = [
    { label: 'Todas',    value: 'todas'   },
    { label: 'Vigentes', value: 'Vigente' },
    { label: 'Derogadas', value: 'Derogada' },
  ];

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };
  

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
        onCardClick={handleCardClick}
      />

      {showModal && (
        <CompletarRegistro
          item={selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
};

export default ResolucionesPage;
