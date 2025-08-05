// src/components/AdjuntarArchivo.jsx
import React from 'react';
import './AdjuntarArchivo.css';

const AdjuntarArchivo = ({ descripcion, file, onChange }) => {
  return (
    <div className="adjuntar-container">
      <h4>Adjuntar documento</h4>

      <p className="descripcion">
        {descripcion}
      </p>

      <label className="archivo-input">
        <input
          type="file"
          accept=".pdf"
          onChange={onChange}
          hidden
        />
        <div className="file-wrapper">
          <span>Examinar…</span>
          <span className="file-name">
            {file ? file.name : 'Seleccionar archivo...'}
          </span>
        </div>
      </label>

      <div className="requisitos">
        <p><strong>Requerimientos para subir archivo</strong></p>
        <p>Límite de 6MB.<br />
        Tipos de archivos permitidos: <span className="pdf-tag">.pdf</span></p>
      </div>
    </div>
  );
};

export default AdjuntarArchivo;