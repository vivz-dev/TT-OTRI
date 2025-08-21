import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import TipoProteccion from './TipoProteccion';
import './DatosTecnologia.css';
import * as Components from '../../layouts/components/index';
import { useGetTiposQuery } from '../../../services/tiposProteccionApi';

const ID_NO_APLICA = 8;
const ESTADO_DISPONIBLE = 'D';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;
const isValidISODate = (v) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

const DatosTecnologia = forwardRef((_, ref) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [tiposProteccion, setTiposProteccion] = useState({});
  const [cotitularidad, setCotitularidad] = useState(null);

  const [archivosPorProteccion, setArchivosPorProteccion] = useState({});
  const [fechasConcesion, setFechasConcesion] = useState({});

  const [errores, setErrores] = useState({
    nombre: false, descripcion: false, tipoProteccion: false,
    archivos: false, cotitularidad: false, fecha: false,
  });
  const [shake, setShake] = useState({
    nombre: false, descripcion: false, tipoProteccion: false,
    archivos: false, cotitularidad: false,
  });

  const { data: tiposData, isLoading, isError } = useGetTiposQuery();

  useEffect(() => {
    console.log('[Step0] State snapshot =>', {
      nombre, descripcion, tiposProteccion, cotitularidad,
      archivosPorProteccion: mapArchivosToLog(archivosPorProteccion),
      fechasConcesion
    });
  }, [nombre, descripcion, tiposProteccion, cotitularidad, archivosPorProteccion, fechasConcesion]);

  const mapArchivosToLog = (mapa) =>
    Object.fromEntries(
      Object.entries(mapa).map(([k, arr]) => [
        k,
        (arr || []).map((a, i) => {
          const f = (typeof File !== 'undefined' && a instanceof File) ? a : a?.file;
          return {
            idx: i,
            hasFile: !!f,
            fileName: f?.name ?? null,
            fecha: a?.fecha ?? null,
          };
        }),
      ])
    );

  const handleFechaChange = (tipoId, fecha) =>
    setFechasConcesion((p) => ({ ...p, [tipoId]: fecha }));

  const handleCheckboxChange = (tipoId, checked) => {
    setTiposProteccion((prev) => {
      const nuevo = { ...prev };

      if (tipoId === ID_NO_APLICA) {
        if (checked) {
          setArchivosPorProteccion({});
          setFechasConcesion({});
          console.log('[Step0] Seleccionó solo "No aplica" (8). Limpiando archivos/fechas.');
          return { [ID_NO_APLICA]: true };
        }
        return {};
      }

      if (checked) {
        delete nuevo[ID_NO_APLICA];
        nuevo[tipoId] = true;
      } else {
        delete nuevo[tipoId];
        setArchivosPorProteccion((p) => {
          const n = { ...p }; delete n[tipoId]; return n;
        });
        setFechasConcesion((p) => {
          const n = { ...p }; delete n[tipoId]; return n;
        });
      }
      return nuevo;
    });
  };

  const handleArchivoChange = (tipoId, archivos) =>
    setArchivosPorProteccion((p) => ({ ...p, [tipoId]: archivos }));

  useImperativeHandle(ref, () => ({
    validate: () => {
      const seleccionoAlMenosUno = Object.keys(tiposProteccion).length > 0;
      const seleccionoNoAplica = !!tiposProteccion[ID_NO_APLICA];

      const nombreOk = isNonEmpty(nombre);
      const descripcionOk = isNonEmpty(descripcion);
      const cotitularidadOk = cotitularidad !== null;

      const tiposSeleccionados = Object.keys(tiposProteccion).map(Number).filter(id => id !== ID_NO_APLICA);

      // Detectar presencia de archivo de forma muy tolerante
      const hasSomeFile = (it) => {
        if (!it) return false;
        if (typeof File !== 'undefined' && it instanceof File) return true;
        if (it.file) {
          if (typeof File !== 'undefined' && it.file instanceof File) return true;
          if (it.file?.name) return true;
        }
        // Algunos componentes envían { name, size, type, ... } sin ser File real
        if (it.name && typeof it.size !== 'undefined') return true;
        return false;
      };

      const tiposSinArchivo = !seleccionoNoAplica
        ? tiposSeleccionados.filter((id) => {
            const arr = archivosPorProteccion[id] || [];
            return arr.length === 0 || !arr.some(hasSomeFile);
          })
        : [];

      const tiposSinFecha = !seleccionoNoAplica
        ? tiposSeleccionados.filter((id) => !isValidISODate(fechasConcesion[id]))
        : [];

      const archivosOk = seleccionoNoAplica ? true : tiposSinArchivo.length === 0;
      const fechasOk   = seleccionoNoAplica ? true : tiposSinFecha.length === 0;

      const canAdvance = nombreOk && descripcionOk && seleccionoAlMenosUno && archivosOk && cotitularidadOk && fechasOk;

      console.log('[Step0] Validate =>', {
        nombreOk, descripcionOk, seleccionoAlMenosUno, seleccionoNoAplica,
        archivosOk, fechasOk, cotitularidadOk,
        tiposSinArchivo, tiposSinFecha,
        canAdvance,
        payloadPreview: {
          idUsuario: 1,
          titulo: nombre,
          descripcion,
          estado: ESTADO_DISPONIBLE,
          completed: false,
          cotitularidad: !!cotitularidad,
          tiposSeleccionados: Object.keys(tiposProteccion).map(Number),
          fechasConcesion,
          archivosPorProteccion: mapArchivosToLog(archivosPorProteccion),
        }
      });

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
      setTimeout(() => setShake({ nombre:false, descripcion:false, tipoProteccion:false, archivos:false, cotitularidad:false }), 500);

      return canAdvance;
    },

    getCotitularidad: () => cotitularidad,

    getPayload: () => ({
      idUsuario: 1, // TODO: reemplazar por IdPersona real desde token
      titulo: nombre,
      descripcion,
      estado: ESTADO_DISPONIBLE,
      completed: false,
      cotitularidad: !!cotitularidad,
      tiposSeleccionados: Object.keys(tiposProteccion).map(Number),
      archivosPorProteccion,
      fechasConcesion,
    }),

    getDraftPayload: () => ({
      titulo: nombre || '',
      descripcion: descripcion || '',
      estado: ESTADO_DISPONIBLE,
      cotitularidad: cotitularidad ?? null,
      tiposSeleccionados: Object.keys(tiposProteccion).map(Number),
      archivosPorProteccion,
      fechasConcesion,
      completed: false,
    }),
  }));

  const renderTipos = () => {
    if (isLoading) return <p style={{ opacity: 0.7 }}>Cargando tipos de protección…</p>;
    if (isError || !Array.isArray(tiposData) || tiposData.length === 0) {
      return <p style={{ color: '#a00' }}>No se pudieron cargar los tipos de protección.</p>;
    }
    const tipos = [...tiposData].sort((a, b) => a.id - b.id);
    return tipos.map((tipo) => (
      <TipoProteccion
        key={tipo.id}
        label={`${tipo.id}. ${tipo.nombre}`}
        index={tipo.id}
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
        <p className="subtitulo-form">Complete la información sobre su tecnología o conocimiento especializado</p>
      </div>

      <div className="form-fieldsets">
        <div className={`form-card ${errores.nombre || errores.descripcion ? 'error' : ''} ${shake.nombre || shake.descripcion ? 'shake' : ''}`}>
          <h2 className="form-card-header">Información básica</h2>
          <div className="input-row">
            <label className="input-group">
              <Components.GrowTextArea
                id="tec-nombre" name="nombre" label="Nombre de la tecnología"
                placeholder="Escribe el nombre…" value={nombre}
                onChange={(e) => setNombre(e.target.value)} maxLength={100} rows={1} kind="text" required
              />
            </label>
            <label className="input-group">
              <Components.GrowTextArea
                id="tec-descripcion" name="descripcion" label="Descripción"
                placeholder="Describe brevemente…" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)} maxLength={200} rows={2} kind="alphanumeric" required
              />
            </label>
          </div>
        </div>

        <div className={`form-card ${errores.tipoProteccion || errores.archivos || errores.fecha ? 'error' : ''} ${shake.tipoProteccion || shake.archivos ? 'shake' : ''}`}>
          <h2 className="form-card-header">Tipo(s) de protección</h2>
          {renderTipos()}
        </div>

        <div className={`form-card ${errores.cotitularidad ? 'error' : ''} ${shake.cotitularidad ? 'shake' : ''}`}>
          <h2 className="form-card-header">¿Existe cotitularidad?</h2>
          <div className="checkboxs-cotitularidad">
            <label>
              <input type="radio" name="cotitularidad" value="si" checked={cotitularidad === true} onChange={() => setCotitularidad(true)} />
              Sí
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input type="radio" name="cotitularidad" value="no" checked={cotitularidad === false} onChange={() => setCotitularidad(false)} />
              No
            </label>
          </div>
        </div>
      </div>
    </form>
  );
});

export default DatosTecnologia;
