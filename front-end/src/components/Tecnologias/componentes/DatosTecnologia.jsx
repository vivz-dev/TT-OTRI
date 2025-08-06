// src/pages/Resoluciones/components/DatosTecnologia.jsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import TipoProteccion from './TipoProteccion';
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

const DatosTecnologia = forwardRef((_, ref) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiposProteccion, setTiposProteccion] = useState({});
  const [cotitularidad, setCotitularidad] = useState(null);
  const [archivosPorProteccion, setArchivosPorProteccion] = useState({});
  const [fechasConcesion, setFechasConcesion] = useState({});
  const [errores, setErrores] = useState({
    nombre: false,
    descripcion: false,
    tipoProteccion: false,
    archivos: false,
    cotitularidad: false,
  });
  const [shake, setShake] = useState({
    nombre: false,
    descripcion: false,
    tipoProteccion: false,
    archivos: false,
    cotitularidad: false
  });
  const handleFechaChange = (index, fecha) => {
    setFechasConcesion((prev) => ({
      ...prev,
      [index]: fecha
    }));
  };

  const handleCheckboxChange = (index, checked) => {
    setTiposProteccion((prev) => {
      const nuevoEstado = { ...prev };
      if (index === 7) return checked ? { 7: true } : {};
      if (checked) {
        delete nuevoEstado[7];
        nuevoEstado[index] = true;
      } else {
        delete nuevoEstado[index];
      }
      return nuevoEstado;
    });
  };

  const handleArchivoChange = (index, archivos) => {
    setArchivosPorProteccion((prev) => ({
      ...prev,
      [index]: archivos,
    }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const nombreOk = nombre.trim() !== '';
      const descripcionOk = descripcion.trim() !== '';
      const seleccionoAlMenosUno = Object.keys(tiposProteccion).length > 0;
      const seleccionoNoAplica = tiposProteccion[7] === true;

      let archivosOk = true;
      if (!seleccionoNoAplica) {
        for (const idx of Object.keys(tiposProteccion)) {
          const archivos = archivosPorProteccion[idx] || [];
          if (archivos.length === 0 || !archivos.some(a => a.file)) {
            archivosOk = false;
            break;
          }
        }
      }

      let fechasOk = true;
      if (!seleccionoNoAplica) {
        for (const idx of Object.keys(tiposProteccion)) {
          const archivos = archivosPorProteccion[idx] || [];
          const fecha = fechasConcesion[idx];
          if (
            archivos.length === 0 || !archivos.some(a => a.file) || !fecha
          ) {
            fechasOk = false;
            break;
          }
        }
      }

      const cotitularidadOk = cotitularidad !== null;

      setErrores({
        nombre: !nombreOk,
        descripcion: !descripcionOk,
        tipoProteccion: !seleccionoAlMenosUno,
        archivos: !archivosOk,
        cotitularidad: !cotitularidadOk,
        fecha: !fechasOk,
      });

      // Agitar sólo los bloques con error
      setShake({
        nombre: !nombreOk,
        descripcion: !descripcionOk,
        tipoProteccion: !seleccionoAlMenosUno,
        archivos: !archivosOk,
        cotitularidad: !cotitularidadOk
      });

      // Quitar shake después de la animación
      setTimeout(() => {
        setShake({
          nombre: false,
          descripcion: false,
          tipoProteccion: false,
          archivos: false,
          cotitularidad: false
        });
      }, 500);

      return (
        nombreOk &&
        descripcionOk &&
        seleccionoAlMenosUno &&
        archivosOk &&
        cotitularidadOk
      );
    },
    getCotitularidad: () => cotitularidad
  }));

  return (
    <form className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la tecnología/know-how</h1>
        <p className="subtitulo-form">Complete la información sobre su tecnología o conocimiento especializado</p>
      </div>
      <div className='form-fieldsets'>
        <div className={`form-card ${errores.nombre || errores.descripcion ? 'error' : ''} ${shake.nombre || shake.descripcion ? 'shake' : ''}`}>
          <h2 className="form-card-header">Información básica</h2>
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
        <div className={`form-card ${errores.tipoProteccion || errores.archivos ? 'error' : ''} ${shake.tipoProteccion || shake.archivos ? 'shake' : ''}`}>
          <h2 className="form-card-header">Tipo(s) de protección</h2>
          {opcionesProteccion.map((texto, index) => (
            <TipoProteccion
              key={index}
              label={texto}
              index={index}
              checked={!!tiposProteccion[index]}
              disabled={tiposProteccion[7] && index !== 7}
              onChange={(checked) => handleCheckboxChange(index, checked)}
              onArchivoChange={(archivos) => handleArchivoChange(index, archivos)}
              onFechaChange={(fecha) => handleFechaChange(index, fecha)}
              fechaConcesion={fechasConcesion[index]}
            />
          ))}
        </div>
        <div className={`form-card ${errores.cotitularidad ? 'error' : ''} ${shake.cotitularidad ? 'shake' : ''}`}>
          <h2 className="form-card-header">¿Existe cotitularidad?</h2>
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
});

export default DatosTecnologia;
