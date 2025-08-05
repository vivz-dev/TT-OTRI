import React from 'react';
import { Lock, User } from 'lucide-react';     // iconos
import './Card.css';

const Card = ({
  number,
  estado,
  estadoColor = '#22c55e',
  titulo,
  subtitulo,
  descripcion,
  iconoFecha,
  textoFecha,
  iconoRegistrado,
  textoRegistrado,
  iconoExtra,
  protecciones = [],          // ← NUEVO
}) => {
  /* ------- helpers ------- */
  const esTecnologia = protecciones.length > 0;

  return (
    <div className="custom-card">
      {/* ---------- Encabezado ---------- */}
      <div className="card-header">
        {titulo && <h3 className="card-title">{titulo}</h3>}

        <div className="card-status" style={{ backgroundColor: estadoColor }}>
          {estado}
        </div>
      </div>

      {number && !esTecnologia && <p className="card-number">No. {number}</p>}
      {subtitulo && <h4 className="card-subtitle">{subtitulo}</h4>}
      {descripcion && <p className="card-description">{descripcion}</p>}

      {/* ---------- Pie ---------- */}
      <div className="card-footer">
        {/* --- caso Tecnologías: candado + protecciones --- */}
        {esTecnologia ? (
          <>
            <div className="footer-item">
              <span className="icon">
                <Lock size={16} />
              </span>
              <span className="footer-text">
                {/* Tipo de protección:&nbsp; */}
                {protecciones.join(', ')}
              </span>
            </div>

            <div className="footer-item">
              <span className="icon">
                {iconoRegistrado ?? <User size={16} />}
              </span>
              <span className="footer-text">{textoRegistrado}</span>
            </div>
          </>
        ) : (
          /* --- caso Resoluciones (fecha + usuario) --- */
          <>
            <div className="footer-item">
              {iconoFecha && <span className="icon">{iconoFecha}</span>}
              <span className="footer-text">{textoFecha}</span>
            </div>

            <div className="footer-item">
              {iconoRegistrado && (
                <span className="icon">{iconoRegistrado}</span>
              )}
              <span className="footer-text">{textoRegistrado}</span>
            </div>
          </>
        )}

        {iconoExtra && <div className="footer-extra">{iconoExtra}</div>}
      </div>
    </div>
  );
};

export default Card;