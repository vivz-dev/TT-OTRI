/**
 * PagosPage
 * ----------------
 * El título del Card será el código de la resolución
 * y la descripción original pasa a `descripcion`.
 */
import './PagosPage.css';
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



const PagosPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetResolutionsQuery();

  console.log('PagosPage data:', data, 'error:', error);

  // const dummyData = useMemo(
  //   () =>
  //     (error ? [] : data).map((r) => ({
  //       id:          r.id,
  //       estado:      r.estado,
  //       completed:   r.completed,
  //       titulo:      r.codigo || 'Sin título',          // ← título = número/código
  //       descripcion: r.descripcion || 'Sin descripción',    // ← cuerpo = descripción
  //       fecha:       fmtFecha(r.fechaResolucion),
  //       usuario:     r.idUsuario || 'Usuario no disponible',
  //     })),
  //   [data, error]
  // );

  const dummyData = [
    {
      id: 1,
      estado: 'Realizado',
      completed: true,
      titulo: 'Tecnología: Sentify',
      descripcion: 'Monto del Pago: $55000.00',
      fecha: fmtFecha('2025-08-13T05:22:19.359508'),
      usuario: 98110
    },
    {
      id: 2,
      estado: 'Realizado',
      completed: true,
      titulo: 'Tecnología: ioT Smart',
      descripcion: 'Monto del Pago: $20000.00',
      fecha: fmtFecha('2025-08-14T05:22:19.359508'),
      usuario: 98110
    },
  ]

  const [filter, setFilter]     = useState('todas');
  const [searchText, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);


  if (isLoading) return <p>Cargando…</p>;

  const filterOptions = [
    { label: 'Todas',    value: 'todas'   },
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
        title="Pagos"
        subtitle="Gestiona y consulta todas las pagos realizados por Transferencia Tecnológica."
      />

      <ActionBar
        filter={filter}
        setFilter={setFilter}
        // options={filterOptions}
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

export default PagosPage;
