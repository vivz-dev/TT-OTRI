import React from 'react';
import './Card.css';

const Card = ({
  number,
  estado,
  estadoColor = '#22c55e', // verde por defecto
  titulo,
  subtitulo,
  descripcion,
  iconoEstado,
  iconoFecha,
  textoFecha,
  iconoRegistrado,
  textoRegistrado,
  iconoExtra,
}) => {
  return (
    <div className="custom-card">
      <div className="card-header">
        {titulo && <h3 className="card-title">{titulo}</h3>}

        <div className="card-status" style={{ backgroundColor: estadoColor }}>
          {estado}
        </div>
      </div>

      {number && <p className="card-number">No. {number}</p>}

      {subtitulo && <h4 className="card-subtitle">{subtitulo}</h4>}

      {descripcion && <p className="card-description">{descripcion}</p>}

      <div className="card-footer">
        <div className="footer-item">
          {iconoFecha && <span className="icon">{iconoFecha}</span>}
          <span className="footer-text">{textoFecha}</span>
        </div>

        <div className="footer-item">
          {iconoRegistrado && <span className="icon">{iconoRegistrado}</span>}
          <span className="footer-text">{textoRegistrado}</span>
        </div>

        {iconoExtra && <div className="footer-extra">{iconoExtra}</div>}
      </div>
    </div>
  );
};

export default Card;
