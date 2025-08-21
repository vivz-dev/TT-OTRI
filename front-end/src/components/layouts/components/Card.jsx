import React, { useState, useEffect } from 'react';
import { Lock, User, CalendarCheck } from 'lucide-react';
import { LuClockAlert } from 'react-icons/lu';
import { FaCheckCircle } from 'react-icons/fa';
import './Card.css';
import { getPersonaNameById } from '../../../services/espolUsers';

const Card = ({
  estado,
  titulo,
  descripcion,
  textoFecha,
  textoRegistrado,
  protecciones = [],
  completed,
  onClick, // Cambiado de onCardClick a onClick
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
    : <LuClockAlert color="#909090ff" title="En espera" />;

  // Verificar si onClick es una función antes de asignarla
  const handleClick = typeof onClick === 'function' ? onClick : undefined;

  return (
    <div 
      className="custom-card" 
      onClick={handleClick}
      style={{ cursor: handleClick ? 'pointer' : 'default' }}
    >
      <div className="card-header">
        {titulo && <h3 className="card-title">{titulo || '—'}</h3>}
        <div className={`card-status ${estado.toLowerCase().replace(/\s+/g, '-')}`}>
          {estado}
        </div>
      </div>

      {descripcion && <p className="card-description">{descripcion}</p>}
      {!descripcion && <p className="card-description">—</p>}

      <div className="card-footer">
        {esTecnologia ? (
          <>
            <div className="footer-item">
              <span className="icon"><Lock size={16} /></span>
              <span className="footer-text">{protecciones.join(', ')}</span>
            </div>
            <div className="footer-item">
              <span className="icon"><User size={16} /></span>
              <span className="footer-text">{nombrePersona}</span>
            </div>
          </>
        ) : (
          <>
            <div className="footer-item">
              <span className="icon"><CalendarCheck size={16} /></span>
              <span className="footer-text">{textoFecha}</span>
            </div>
            <div className="footer-item">
              <span className="icon"><User size={16} /></span>
              <span className="footer-text">{nombrePersona}</span>
            </div>
          </>
        )}

        <div className="footer-extra tooltip-wrapper">
          {iconoExtra}
          <span className="tooltip-text">
            {completed
              ? 'El registro de este documento está completo.'
              : 'Faltan datos para terminar de registrar este documento.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;