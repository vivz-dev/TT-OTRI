// CardScroll.jsx
import React from 'react';
import './CardScroll.css'
import Card from './Card';
import { FaCalendarAlt, FaUser, FaShieldAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { LuClockAlert } from "react-icons/lu";



const CardScroll = ({ filter, searchText, dummyData }) => {
  const filtered = dummyData.filter(item => {
    const matchEstado = filter === 'todas' || item.estado === filter;
    const matchTexto =
      item.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subtitulo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchText.toLowerCase());

    return matchEstado && matchTexto;
  });

  const iconMap = {
    calendar: <FaCalendarAlt />,
    user: <FaUser />,
    shield: <FaShieldAlt color="#6edc68" />,
    check: <FaCheckCircle color="#6edc68" />,
  };

  return (
    <div className="card-scroll">
      {filtered.map(item => {
        const iconoExtra = item.completed
          ? <FaCheckCircle color="#6edc68" title="Completo" />
          : <LuClockAlert color="#909090ff" title="En espera" />;

        return (
          <Card
            key={item.id}
            number={item.numero}
            estado={item.estado}
            estadoColor={item.estadoColor}
            titulo={item.titulo}
            subtitulo={item.subtitulo}
            descripcion={item.descripcion}
            iconoFecha={<FaCalendarAlt />}
            textoFecha={item.fecha}
            iconoRegistrado={<FaUser />}
            textoRegistrado={item.usuario}
            iconoExtra={iconoExtra}
          />
        );
      })}
    </div>
  );
};

export default CardScroll;
