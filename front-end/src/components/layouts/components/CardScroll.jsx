import React from 'react';
import './CardScroll.css';
import Card from './Card';

const CardScroll = ({
  filter,
  searchText,
  dummyData,
  cardButtons = [],
}) => {
  const search = (searchText || '').toLowerCase();

  const filtered = (dummyData || []).filter((item) => {
    const matchEstado = filter === 'todas' || item.estado === filter;
    const matchTexto  =
      (item.titulo ?? '').toLowerCase().includes(search) ||
      (item.descripcion ?? '').toLowerCase().includes(search);
    return matchEstado && matchTexto;
  });

  if (filtered.length === 0)
    return (
      <div className="card-scroll empty">
        <p className="empty-msg">No hay datos para mostrar</p>
      </div>
    );

  return (
    <div className="card-scroll">
      {filtered.map((item) => (
        <Card
          key={item.id}
          estado={item.estado}
          titulo={item.titulo}
          descripcion={item.descripcion}
          textoFecha={item.fecha}
          textoRegistrado={item.usuario}
          protecciones={item.protecciones}
          completed={item.completed}
          cardButtons={cardButtons}
          item={item}                       // 👈 pasa el item completo
        />
      ))}
    </div>
  );
};

export default CardScroll;
