/**
 * Card
 * ----
 * Muestra solo:
 *   • Título  → número/código de resolución
 *   • Descripción
 * Mantiene iconos de estado, fechas y usuario.
 */
import React from 'react';
import { Lock, User, CalendarCheck } from 'lucide-react';
import { LuClockAlert } from 'react-icons/lu';
import { FaCheckCircle } from 'react-icons/fa';
import './Card.css';

const Card = ({
  estado,
  titulo,
  descripcion,
  textoFecha,
  textoRegistrado,
  protecciones = [],
  completed,
}) => {
  const esTecnologia = protecciones.length > 0;

  const iconoExtra = completed
    ? <FaCheckCircle color="#6edc68" title="Completo" />
    : <LuClockAlert color="#909090ff" title="En espera" />;

  return (
    <div className="custom-card">
      <div className="card-header">
        {titulo && <h3 className="card-title">{titulo || '—'}</h3>}
        <div className={`card-status ${estado.toLowerCase().replace(/\s+/g, '-')}`}>
          {estado}
        </div>
      </div>

      {/* Ya no se renderiza número ni subtítulo */}
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
              <span className="footer-text">{textoRegistrado}</span>
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
              <span className="footer-text">{textoRegistrado}</span>
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
