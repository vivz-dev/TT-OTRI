// src/pages/Resoluciones/components/DatosTecnologia.jsx
import React, { useState } from 'react';
import TipoProteccion from './TipoProteccion'; // cada uno es el mismo componente reutilizado con props
import './DatosTecnologia.css';

const opcionesProteccion = [
  '1. Secreto empresarial o información no divulgada',
  '2. Derecho de autor',
  '3. Patente de invención',
  '4. Modelo de utilidad',
  '5. Diseño industrial',
  '6. Nuevas obtenciones de variedad vegetal',
  '7. Signos distintivos',
  '8. No aplica',
];

const DatosTecnologia = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiposProteccion, setTiposProteccion] = useState({});
  const [cotitularidad, setCotitularidad] = useState(null); // true/false/null

  const handleCheckboxChange = (key, checked) => {
    setTiposProteccion(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  return (
    <form className="datos-tecnologia-form">
      <div className="datos-tecnologia-header">
        <h1 className="titulo-principal">Datos de la tecnología/know-how</h1>
        <p className="subtitulo">Complete la información sobre su tecnología o conocimiento especializado</p>
      </div>
      <div className='fieldsets'>
        <div className="form-card">
          <h2 className="card-header">Información básica</h2>
          <div className="input-row">
            <label className="input-group">
              Nombre
              <input
                type="text"
                placeholder="Ingrese el nombre de la tecnología"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>

            <label className="input-group">
              Descripción
              <input
                type="text"
                placeholder="Describa la tecnología o conocimiento especializado"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="form-card">
          <h2 className="card-header">Tipo(s) de protección</h2>
          {opcionesProteccion.map((texto, index) => (
            <TipoProteccion
              key={index}
              label={texto}
              checked={!!tiposProteccion[index]}
              onChange={(checked) => handleCheckboxChange(index, checked)}
            />
          ))}
        </div>
        <div className='form-card'>
          <h2 className="card-header">¿Existe cotitularidad?</h2>
          <div className='checkboxs-cotitularidad'>
          <label>
            <input
              type="radio"
              name="cotitularidad"
              value="si"
              checked={cotitularidad === true}
              onChange={() => setCotitularidad(true)}
            />
            Sí
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              name="cotitularidad"
              value="no"
              checked={cotitularidad === false}
              onChange={() => setCotitularidad(false)}
            />
            No
          </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DatosTecnologia;
