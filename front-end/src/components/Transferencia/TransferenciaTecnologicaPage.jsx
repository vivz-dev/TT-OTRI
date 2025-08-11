/**
 * TransferenciaTecnologicaPage
 * ----------------------------
 * Lista las transferencias disponibles.  El Card muestra:
 *   • título  -> codigoTransferencia
 *   • descripción -> descripcion
 */
import './TransferenciaTecnologicaPage.css';              // crea si lo necesitas
import React, { useState, useMemo } from 'react';
import { PageHeader, ActionBar, CardScroll } from '../layouts/components';
import { useGetTransfersQuery } from '../../services/transfersApi';

/* --- Datos de ejemplo -------------------------------------------------- */
const dummyTransfers = [
  {
    id: 1,
    titulo: 'TT-24-001',
    descripcion: 'Acuerdo de licencia con ACME Corp.',
    estado: 'Vigente',
    completed: false,
    fechaInicio: '2025-08-01',
    usuario: 'Viviana Vera',
  },
  {
    id: 2,
    titulo: 'TT-23-015',
    descripcion: 'Licencia exclusiva de patente XYZ.',
    estado: 'Finalizada',
    completed: true,
    fechaInicio: '2024-01-15',
    usuario: 'Juan Pérez',
  },
  /* ➕  agrega más objetos si lo necesitas */
];

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const TransferenciaTecnologicaPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetTransfersQuery();


  /* Mapeo al formato que usa CardScroll */
  const dummyData = useMemo(
    () =>
      dummyTransfers.map((t) => ({
        id: t.id,
        estado: t.estado,
        completed: t.completed,
        titulo: t.titulo,
        descripcion: t.descripcion,
        fecha: fmtFecha(t.fechaInicio),
        usuario: t.usuario,
      })),
    []
  );
    

  const [filter, setFilter]     = useState('todas');
  const [searchText, setSearch] = useState('');

  if (isLoading) return <p>Cargando…</p>;

  /* Filtros iguales a Resoluciones */
  const filterOptions = [
    { label: 'Todas',      value: 'todas' },
    { label: 'Vigentes',   value: 'Vigente' },
    { label: 'Finalizadas', value: 'Finalizada' },
  ];

  return (
    <main className="page-container">
      <PageHeader
        title="Transferencias Tecnológicas"
        subtitle="Consulta todas las TT registradas."
      />

      {/* ActionBar sin botón Registrar */}
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

export default TransferenciaTecnologicaPage;
