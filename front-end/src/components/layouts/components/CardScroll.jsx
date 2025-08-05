import React from 'react';
import './CardScroll.css';
import Card from './Card';
import { LuClockAlert } from 'react-icons/lu';
import { CalendarCheck, User } from 'lucide-react';
import { FaCheckCircle } from 'react-icons/fa';

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
        const iconoExtra = item.completed ? (
          <FaCheckCircle color="#6edc68" title="Completo" />
        ) : (
          <LuClockAlert color="#909090ff" title="En espera" />
        );

        return (
          <Card
            key={item.id}
            number={item.numero}
            estado={item.estado}
            estadoColor={item.estadoColor}
            titulo={item.titulo}
            descripcion={item.descripcion}
            iconoFecha={<CalendarCheck size={16} />}
            textoFecha={item.fecha}
            iconoRegistrado={<User size={16} />}
            textoRegistrado={item.usuario}
            iconoExtra={iconoExtra}
          />
        );
      })}
    </div>
  );
};

export default CardScroll;
