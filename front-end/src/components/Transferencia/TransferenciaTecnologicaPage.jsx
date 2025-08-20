/**
 * TransferenciaTecnologicaPage
 * ----------------------------
 * Lista las transferencias disponibles. El Card muestra:
 *   • título  -> codigoTransferencia
 *   • descripción -> descripcion
 */
import './TransferenciaTecnologicaPage.css';
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetTransfersQuery } from '../../services/transfersApi';

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Sin fecha';

const TransferenciaTecnologicaPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetTransfersQuery();

  // Mapeo de datos reales de la API al formato que usa CardScroll
  const transfersData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((transfer) => ({
      id: transfer.id,
      estado: transfer.estado,
      completed: transfer.completed || false,
      titulo: transfer.titulo || 'Sin título',
      descripcion: transfer.descripcion || 'Sin descripción',
      fecha: fmtFecha(transfer.fechaInicio),
      usuario: transfer.usuarioRegistrador || 'Usuario no disponible',
    }));
  }, [data]);

  console.log('Transferencias cargadas:', transfersData);

  const [filter, setFilter] = useState('todas');
  const [searchText, setSearch] = useState('');

  if (isLoading) return <p>Cargando…</p>;
  if (error) return <p>Error al cargar las transferencias: {error.message}</p>;

  const filterOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Vigentes', value: 'Vigente' },
    { label: 'Finalizadas', value: 'Finalizada' },
  ];

  return (
    <main className="page-container">
      <PageHeader
        title="Transferencias Tecnológicas"
        subtitle="Consulta todas las TT registradas."
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
        dummyData={transfersData}
      />
    </main>
  );
};

export default TransferenciaTecnologicaPage;