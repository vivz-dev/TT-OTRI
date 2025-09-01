import React, { useState, useEffect } from 'react';
import { LuClockAlert } from 'react-icons/lu';
import { FaCheckCircle } from 'react-icons/fa';
import './Card.css';
import { getPersonaNameById } from '../../../services/espolUsers';
import CardStatus from './CardStatus';
import CardFooter from './CardFooter';

const Card = ({
  estado,
  titulo,
  descripcion,
  textoFecha,
  textoRegistrado,
  protecciones = [],
  completed,
  cardButtons = [],
  item,                // 👈 el item completo para pasar a los botones
}) => {
  const esTecnologia = protecciones.length > 0;
  const [nombrePersona, setNombrePersona] = useState(textoRegistrado || 'Usuario no disponible');

  useEffect(() => {
    const fetchPersonaName = async () => {
      const id = parseInt(textoRegistrado);
      if (!isNaN(id) && id > 0) {
        try {
          const nombre = await getPersonaNameById(id);
          setNombrePersona(nombre);
        } catch (error) {
          console.error('Error al obtener nombre de persona:', error);
          setNombrePersona(textoRegistrado || 'Usuario no disponible');
        }
      } else {
        setNombrePersona(textoRegistrado || 'Usuario no disponible');
      }
    };

    fetchPersonaName();
  }, [textoRegistrado]);

  const iconoExtra = completed
    ? <FaCheckCircle color="#6edc68" title="Completo" />
    : <LuClockAlert color="#909090ff" title="Incompleto" />;

  return (
    <div
      className="custom-card"
    >
      <div className="card-header">
        {titulo && <h3 className="card-title ellipsis-3">{titulo || '—'}</h3>}
        <CardStatus estado={estado} iconoExtra={iconoExtra} completed={completed}/>
      </div>

      {descripcion && <p className="card-description ellipsis-3">{descripcion}</p>}
      {!descripcion && <p className="card-description">—</p>}

      <CardFooter
        esTecnologia={esTecnologia}
        protecciones={protecciones}
        textoFecha={textoFecha}
        nombrePersona={nombrePersona}
        botones={cardButtons}
        item={item}
      />
    </div>
  );
};

export default Card;
