// CardScroll.jsx
import React from 'react';
import './CardScroll.css'
import Card from './Card';
import { FaCalendarAlt, FaUser, FaShieldAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { LuClockAlert } from "react-icons/lu";
import { Lock, User, CalendarCheck } from 'lucide-react';     // iconos



const CardScroll = ({ filter, searchText, dummyData }) => {
  const search = searchText.toLowerCase();
  const filtered = dummyData.filter(item => {
    const matchEstado = filter === 'todas' || item.estado === filter;
    const matchTexto =
    (item.titulo ?? '').toLowerCase().includes(search) ||
    (item.subtitulo ?? '').toLowerCase().includes(search) ||
    (item.descripcion ?? '').toLowerCase().includes(search) ||
    (item.numero ?? '').toLowerCase().includes(search);

    return matchEstado && matchTexto;
  });

  const iconMap = {
    calendar: <CalendarCheck size={16}/>,
    user: <User size={16}/>,
    shield: <FaShieldAlt color="#6edc68" />,
    check: <FaCheckCircle color="#6edc68" />,
  };

  return (
  <div className="card-scroll">
    {filtered.map((item) => {
      const iconoExtra = item.completed
        ? <FaCheckCircle color="#6edc68" title="Completo" />
        : <LuClockAlert color="#909090ff" title="En espera" />;

      // -------- tarjeta de Tecnología / Know-how --------
      if (item.protecciones) {
        return (
          <Card
            key={item.id}
            estado={item.estado}
            estadoColor={item.estadoColor}
            titulo={item.titulo}
            descripcion={item.descripcion}
            textoRegistrado={`${item.usuario}`}
            protecciones={item.protecciones}
            iconoExtra={iconoExtra}
          />
        );
      }

      // -------- tarjeta de Resolución (caso anterior) --------
      return (
        <Card
          key={item.id}
          number={item.numero}
          estado={item.estado}
          estadoColor={item.estadoColor}
          titulo={item.titulo}
          descripcion={item.descripcion}
          iconoFecha={iconMap.calendar}
          textoFecha={item.fecha}
          iconoRegistrado={iconMap.user}
          textoRegistrado={item.usuario}
          iconoExtra={iconoExtra}
        />
      );
    })}
  </div>
);

};

export default CardScroll;
