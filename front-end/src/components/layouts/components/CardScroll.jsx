import React from 'react';
import './CardScroll.css';
import Card from './Card';

const CardScroll = ({ filter, searchText, dummyData }) => {
  const search = searchText.toLowerCase();

  const filtered = dummyData.filter((item) => {
    const matchEstado = filter === 'todas' || item.estado === filter;
    const matchTexto =
      (item.titulo ?? '').toLowerCase().includes(search) ||
      (item.descripcion ?? '').toLowerCase().includes(search) ||
      (item.numero ?? '').toLowerCase().includes(search);
    return matchEstado && matchTexto;
  });

  /* ➜  Si no hay nada que mostrar */
  if (filtered.length === 0) {
    return (
      <div className="card-scroll empty">
        <p className="empty-msg">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="card-scroll">
      {filtered.map((item) => {
        return (
          <Card
            key={item.id}
            number={item.numero}
            estado={item.estado}
            titulo={item.titulo}
            subtitulo={item.subtitulo}
            descripcion={item.descripcion}
            textoFecha={item.fecha}
            textoRegistrado={item.usuario}
            protecciones={item.protecciones}
            completed={item.completed}
          />
        );
      })}
    </div>
  );
};

export default CardScroll;
