// src/pages/Resoluciones/components/DatosTecnologia.jsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import TipoProteccion from './TipoProteccion';
import './DatosTecnologia.css';
import * as Components from '../../layouts/components/index';
import { useGetTiposQuery } from '../../../services/tiposProteccionApi';

// ⚠️ Dejar la lista mocked, pero comentada:
// const opcionesProteccion = [
//   '1. Secreto empresarial o información no divulgada',
//   '2. Derecho de autor',
//   '3. Patente de invención',
//   '4. Modelo de utilidad',
//   '5. Diseño industrial',
//   '6. Nuevas obtenciones de variedad vegetal',
//   '7. Signos distintivos',
//   '8. No aplica',
// ];

const ID_NO_APLICA = 8; // según el backend

const DatosTecnologia = forwardRef((_, ref) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Clave → id del tipo de protección (ej: {1:true, 3:true, 8:true})
  const [tiposProteccion, setTiposProteccion] = useState({});
  const [cotitularidad, setCotitularidad] = useState(null);

  // Archivos y fechas por tipoId (no por índice)
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
    cotitularidad: false,
  });

  // 🔌 Cargar tipos desde backend
  const { data: tiposData, isLoading, isError } = useGetTiposQuery();

  const handleFechaChange = (tipoId, fecha) => {
    setFechasConcesion((prev) => ({ ...prev, [tipoId]: fecha }));
  };

  const handleCheckboxChange = (tipoId, checked) => {
    setTiposProteccion((prev) => {
      const nuevo = { ...prev };
      // Si marca "No aplica" -> solo ese
      if (tipoId === ID_NO_APLICA) return checked ? { [ID_NO_APLICA]: true } : {};
      if (checked) {
        delete nuevo[ID_NO_APLICA];
        nuevo[tipoId] = true;
      } else {
        delete nuevo[tipoId];
      }
      return nuevo;
    });
  };

  const handleArchivoChange = (tipoId, archivos) => {
    setArchivosPorProteccion((prev) => ({ ...prev, [tipoId]: archivos }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const nombreOk = nombre.trim() !== '';
      const descripcionOk = descripcion.trim() !== '';
      const seleccionoAlMenosUno = Object.keys(tiposProteccion).length > 0;
      const seleccionoNoAplica = !!tiposProteccion[ID_NO_APLICA];

      let archivosOk = true;
      if (!seleccionoNoAplica) {
        for (const id of Object.keys(tiposProteccion)) {
          const archivos = archivosPorProteccion[id] || [];
          if (archivos.length === 0 || !archivos.some((a) => a.file)) {
            archivosOk = false;
            break;
          }
        }
      }

      let fechasOk = true;
      if (!seleccionoNoAplica) {
        for (const id of Object.keys(tiposProteccion)) {
          const archivos = archivosPorProteccion[id] || [];
          const fecha = fechasConcesion[id];
          if (archivos.length === 0 || !archivos.some((a) => a.file) || !fecha) {
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

      setShake({
        nombre: !nombreOk,
        descripcion: !descripcionOk,
        tipoProteccion: !seleccionoAlMenosUno,
        archivos: !archivosOk,
        cotitularidad: !cotitularidadOk,
      });

      setTimeout(() => {
        setShake({
          nombre: false,
          descripcion: false,
          tipoProteccion: false,
          archivos: false,
          cotitularidad: false,
        });
      }, 500);

      return nombreOk && descripcionOk && seleccionoAlMenosUno && archivosOk && cotitularidadOk;
    },

    getCotitularidad: () => cotitularidad,

    // Devuelve el payload para crear la tecnología
    getPayload: () => ({
      idUsuario: 1, // TODO: reemplaza por el userId real (token/estado global)
      titulo: nombre,
      descripcion,
      estado: 'Disponible',
      completed: false,
      cotitularidad: !!cotitularidad,
      // → ahora son IDs reales del backend
      tiposSeleccionados: Object.keys(tiposProteccion).map(Number),
      archivosPorProteccion,
      fechasConcesion,
    }),
  }));

  // UI de lista de tipos
  const renderTipos = () => {
    if (isLoading) return <p style={{ opacity: 0.7 }}>Cargando tipos de protección…</p>;
    if (isError || !Array.isArray(tiposData) || tiposData.length === 0) {
      // Fallback opcional: si falla backend, mostramos nada (o puedes reactivar el mocked)
      return <p style={{ color: '#a00' }}>No se pudieron cargar los tipos de protección.</p>;
      // O bien usar el mocked comentado arriba (descomentándolo).
    }

    // Ordenar por id para mantener 1..8
    const tipos = [...tiposData].sort((a, b) => a.id - b.id);

    return tipos.map((tipo) => (
      <TipoProteccion
        key={tipo.id}
        label={`${tipo.id}. ${tipo.nombre}`}
        index={tipo.id} // usamos "index" como id del tipo
        checked={!!tiposProteccion[tipo.id]}
        disabled={!!tiposProteccion[ID_NO_APLICA] && tipo.id !== ID_NO_APLICA}
        onChange={(checked) => handleCheckboxChange(tipo.id, checked)}
        onArchivoChange={(archivos) => handleArchivoChange(tipo.id, archivos)}
        onFechaChange={(fecha) => handleFechaChange(tipo.id, fecha)}
        fechaConcesion={fechasConcesion[tipo.id]}
      />
    ));
  };

  return (
    <form className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la tecnología/know-how</h1>
        <p className="subtitulo-form">
          Complete la información sobre su tecnología o conocimiento especializado
        </p>
      </div>

      <div className="form-fieldsets">
        <div
          className={`form-card ${errores.nombre || errores.descripcion ? 'error' : ''} ${
            shake.nombre || shake.descripcion ? 'shake' : ''
          }`}
        >
          <h2 className="form-card-header">Información básica</h2>
          <div className="input-row">
            <label className="input-group">
              <Components.GrowTextArea
                id="tec-nombre"
                name="nombre"
                label="Nombre de la tecnología"
                placeholder="Escribe el nombre…"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                rows={1}
                kind="text"
                required
              />
            </label>

            <label className="input-group">
              <Components.GrowTextArea
                id="tec-descripcion"
                name="descripcion"
                label="Descripción"
                placeholder="Describe brevemente…"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                maxLength={200}
                rows={2}
                kind="alphanumeric"
                required
              />
            </label>
          </div>
        </div>

        <div
          className={`form-card ${errores.tipoProteccion || errores.archivos ? 'error' : ''} ${
            shake.tipoProteccion || shake.archivos ? 'shake' : ''
          }`}
        >
          <h2 className="form-card-header">Tipo(s) de protección</h2>
          {renderTipos()}
        </div>

        <div className={`form-card ${errores.cotitularidad ? 'error' : ''} ${shake.cotitularidad ? 'shake' : ''}`}>
          <h2 className="form-card-header">¿Existe cotitularidad?</h2>
          <div className="checkboxs-cotitularidad">
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
