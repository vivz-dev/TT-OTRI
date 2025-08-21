// src/components/CompletarRegistro.jsx
import React from 'react';
import { X } from 'lucide-react';
import './CompletarRegistro.css';

const CompletarRegistro = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="completar-registro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Completar Registro</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-section">
            <h3>Información General</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Título:</span>
                <span className="detail-value">{item.titulo || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Descripción:</span>
                <span className="detail-value">{item.descripcion || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span className={`detail-value status-${item.estado?.toLowerCase()}`}>
                  {item.estado || '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">{item.fecha || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registrado por:</span>
                <span className="detail-value">{item.usuario || '—'}</span>
              </div>
              {item.protecciones && item.protecciones.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Protecciones:</span>
                  <span className="detail-value">{item.protecciones.join(', ') || '—'}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Completado:</span>
                <span className="detail-value">
                  {item.completed ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Aquí puedes agregar más secciones según sea necesario */}
          {/* <div className="form-section">
            <h3>Completar Información</h3>
            <p>Formularios para completar la información faltante...</p>
          </div> */}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletarRegistro;