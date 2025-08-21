import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetTechnologiesQuery } from '../../services/technologiesApi';
import CompletarRegistro from '../layouts/components/CompletarRegistro';


const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Sin fecha';

const TecnologiasPage = ({ onRegister }) => {
  const [filter, setFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Disponibles', value: 'Disponible' },
    { label: 'No Disponibles', value: 'No Disponible' },
  ];

  const { data = [], isLoading, error } = useGetTechnologiesQuery();

  // Si quisieras re-mapear o formatear fechas aquí, puedes:
  // const mapped = useMemo(() => data, [data]);

  // Mapeo de datos reales de la API al formato que usa CardScroll
  const mapped = useMemo(() => {
    if (!data || data.length === 0) return [];

    console.log('TecnologiasPage data:', data, 'error:', error);
    
    return data.map((tecnologia) => ({
      id: tecnologia.id,
      estado: tecnologia.estado,
      completed: tecnologia.completed || false,
      titulo: tecnologia.titulo || 'Sin título',
      descripcion: tecnologia.descripcion || 'Sin descripción',
      fecha: fmtFecha(tecnologia.fecha),
      usuario: tecnologia.usuario || 'Usuario no disponible',
    }));
  }, [data]);

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
                onCardClick={handleCardClick}
              />
              
      )}

      {showModal && (
              <CompletarRegistro
                item={selectedItem}
                onClose={handleCloseModal}
              />
      )}
    </main>
  );
};

export default TecnologiasPage;
