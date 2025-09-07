import React, { useState, useImperativeHandle, forwardRef } from 'react';
import TipoProteccion from './TipoProteccion';
import './DatosTecnologia.css';
import * as Components from '../../layouts/components/index';
import { useGetTiposQuery } from '../../../services/tiposProteccionApi';
import { getIdPersonaFromAppJwt } from '../../../services/api';

const ID_NO_APLICA = 8;
const ESTADO_DISPONIBLE = 'D';
const DEFAULT_ID_COLECCION = 155;

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;
const isValidISODate = (v) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

const DatosTecnologia = forwardRef((_, ref) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [tiposProteccion, setTiposProteccion] = useState({});
  const [cotitularidad, setCotitularidad] = useState(null);

  // key: idTipoProteccion -> [{ file, fecha }]
  const [archivosPorProteccion, setArchivosPorProteccion] = useState({});
  // compat antigua (ya no se usa como única fecha, pero se mantiene para no romper props)
  const [fechasConcesion, setFechasConcesion] = useState({});

  /** Mapa por idTipoProteccion => { solicitud, concesion, fechaSolicitud, fechaConcesion, fechaCreacion } */
  const [proteccionMetaMap, setProteccionMetaMap] = useState({});

  const [errores, setErrores] = useState({
    nombre: false, descripcion: false, tipoProteccion: false,
    archivos: false, cotitularidad: false, fecha: false,
  });
  const [shake, setShake] = useState({
    nombre: false, descripcion: false, tipoProteccion: false,
    archivos: false, cotitularidad: false,
  });

  const { data: tiposData, isLoading, isError } = useGetTiposQuery();

  const handleFechaChange = (tipoId, fecha) =>
    setFechasConcesion((p) => ({ ...p, [tipoId]: fecha }));

  const handleProteccionChange = (payload) => {
    if (!payload?.idTipoProteccion) return;
    setProteccionMetaMap((prev) => ({
      ...prev,
      [Number(payload.idTipoProteccion)]: {
        solicitud: true, // 👈 SIEMPRE true por requerimiento
        concesion: !!payload.concesion,
        fechaSolicitud: payload.fechaSolicitud ?? null,
        fechaConcesion: payload.fechaConcesion ?? null,
        fechaCreacion: payload.fechaCreacion ?? null,
      },
    }));
    console.log("[DatosTecnologia] proteccionMetaMap:update =>", payload);
  };

  const handleCheckboxChange = (tipoId, checked) => {
    setTiposProteccion((prev) => {
      const nuevo = { ...prev };

      if (tipoId === ID_NO_APLICA) {
        if (checked) {
          setArchivosPorProteccion({});
          setFechasConcesion({});
          setProteccionMetaMap({});
          console.log('[DatosTecnologia] Seleccionó "No aplica" (8). Limpieza.');
          return { [ID_NO_APLICA]: true };
        }
        return {};
      }

      if (checked) {
        delete nuevo[ID_NO_APLICA];
        nuevo[tipoId] = true;
      } else {
        delete nuevo[tipoId];
        setArchivosPorProteccion((p) => { const n = { ...p }; delete n[tipoId]; return n; });
        setFechasConcesion((p) => { const n = { ...p }; delete n[tipoId]; return n; });
        setProteccionMetaMap((p) => { const n = { ...p }; delete n[tipoId]; return n; });
      }
      return nuevo;
    });
  };

  const handleArchivoChange = (tipoId, archivos) =>
    setArchivosPorProteccion((p) => ({ ...p, [tipoId]: archivos }));

  // Util para obtener el nombre del tipo (para título DSpace)
  const getNombreTipo = (idTipo) => {
    const t = Array.isArray(tiposData) ? tiposData.find(x => Number(x.id) === Number(idTipo)) : null;
    return t?.nombre || `Tipo ${idTipo}`;
  };

  /** Construye el payload unificado (tecnología + protecciones con archivosProteccion) */
  const buildUnifiedPayload = () => {
    let idPersona = null;
    try { idPersona = getIdPersonaFromAppJwt?.() ?? null; } catch {}

    const tiposSeleccionados = Object.keys(tiposProteccion).map(Number);
    const tiposValidos = tiposSeleccionados.filter((id) => id !== ID_NO_APLICA);

    const tecnologia = {
      idPersona,
      titulo: nombre,
      descripcion,
      estado: ESTADO_DISPONIBLE, // 'D'
      cotitularidad: !!cotitularidad,
      completed: true,           // 👈 SIEMPRE true
    };

    const protecciones = tiposValidos.map((idTipoProteccion) => {
      const meta = proteccionMetaMap?.[idTipoProteccion] || {};
      const nombreTipo = getNombreTipo(idTipoProteccion);
      const slots = archivosPorProteccion?.[idTipoProteccion] || [];

      // Archivos por protección en el shape solicitado
      const archivosProteccion = (slots || [])
        .map((it) => {
          const file =
            (typeof File !== 'undefined' && it instanceof File) ? it :
            it?.file || null;
          if (!file) return null;
          return {
            nombre: file.name || null,
            formato: 'pdf',             // 👈 requerido
            tipoEntidad: 'PI',          // 👈 requerido
            tamano: file.size ?? null,
            file,                       // mantenemos File para orquestador
            // metadata opcional para tu DSpace/orquestador
            metadataDSpace: {
              idColeccion: DEFAULT_ID_COLECCION,
              titulo: `${nombre || 'Tecnología'} - ${nombreTipo}`,
              identificacion: idPersona ?? null,
            },
          };
        })
        .filter(Boolean);

      return {
        idTipoProteccion,
        solicitud: true,                                    // 👈 SIEMPRE true
        concesion: !!meta.concesion,
        fechaSolicitud: meta.fechaSolicitud ?? fechasConcesion?.[idTipoProteccion] ?? null,
        fechaConcesion: meta.fechaConcesion ?? null,
        archivosProteccion,                                 // 👈 anidado por protección
      };
    });

    const payload = { tecnologia, protecciones };
    // Log auxiliar sin archivos binarios enormes
    console.log('[DatosTecnologia] Preview payload =>', {
      tecnologia,
      protecciones: protecciones.map(p => ({
        idTipoProteccion: p.idTipoProteccion,
        solicitud: p.solicitud,
        concesion: p.concesion,
        fechaSolicitud: p.fechaSolicitud,
        fechaConcesion: p.fechaConcesion,
        archivosProteccion: p.archivosProteccion.map((a, i) => ({
          i, nombre: a.nombre, formato: a.formato, tipoEntidad: a.tipoEntidad, tamano: a.tamano,
        })),
      })),
    });
    return payload;
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const seleccionoAlMenosUno = Object.keys(tiposProteccion).length > 0;
      const seleccionoNoAplica = !!tiposProteccion[ID_NO_APLICA];

      const nombreOk = isNonEmpty(nombre);
      const descripcionOk = isNonEmpty(descripcion);
      const cotitularidadOk = cotitularidad !== null;

      const tiposValidos = Object.keys(tiposProteccion).map(Number).filter(id => id !== ID_NO_APLICA);

      const hasSomeFile = (it) => {
        if (!it) return false;
        if (typeof File !== 'undefined' && it instanceof File) return true;
        if (it.file) {
          if (typeof File !== 'undefined' && it.file instanceof File) return true;
          if (it.file?.name) return true;
        }
        if (it.name && typeof it.size !== 'undefined') return true;
        return false;
      };

      const tiposSinArchivo = !seleccionoNoAplica
        ? tiposValidos.filter((id) => {
            const arr = archivosPorProteccion[id] || [];
            return arr.length === 0 || !arr.some(hasSomeFile);
          })
        : [];

      // fechaSolicitud (obligatoria si el tipo está marcado)
      const tiposSinFecha = !seleccionoNoAplica
        ? tiposValidos.filter((id) => {
            const meta = proteccionMetaMap?.[id];
            const fechaSol = meta?.fechaSolicitud ?? fechasConcesion?.[id];
            return !isValidISODate(fechaSol);
          })
        : [];

      const archivosOk = seleccionoNoAplica ? true : tiposSinArchivo.length === 0;
      const fechasOk   = seleccionoNoAplica ? true : tiposSinFecha.length === 0;

      const canAdvance = nombreOk && descripcionOk && seleccionoAlMenosUno && archivosOk && cotitularidadOk && fechasOk;

      console.log('[DatosTecnologia] Validate =>', {
        nombreOk, descripcionOk, seleccionoAlMenosUno, seleccionoNoAplica,
        archivosOk, fechasOk, cotitularidadOk,
        tiposSinArchivo, tiposSinFecha,
        canAdvance,
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

    // FINAL y DRAFT usan el mismo shape unificado
    getPayload: () => buildUnifiedPayload(),
    getDraftPayload: () => buildUnifiedPayload(),
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
        onProteccionChange={handleProteccionChange}
      />
    ));
  };

  return (
    <form className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la tecnología<em>/know-how</em></h1>
        <p className="subtitulo-form">Complete la información sobre la tecnología o conocimiento.</p>
      </div>

      <div className="form-fieldsets">
        <div className={`form-card ${errores.nombre || errores.descripcion ? 'error' : ''} ${shake.nombre || shake.descripcion ? 'shake' : ''}`}>
          <div className="">
            <label className="input-group ">
              <Components.GrowTextArea
                id="tec-nombre" name="nombre" label={`Nombre de la tecnología/know-how`}
                placeholder="Escribe el nombre…" value={nombre}
                onChange={(e) => setNombre(e.target.value)} maxLength={300} rows={1} kind="text" required
              />
            </label>
            <label className="input-group">
              <Components.GrowTextArea
                id="tec-descripcion" name="descripcion" label="Descripción"
                placeholder="Describe brevemente…" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)} maxLength={300} rows={2} kind="alphanumeric" required
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
          <div className="checkbox-container">
            <label className='checkbox-rounded'>
              <input type="radio" name="cotitularidad" value="si" checked={cotitularidad === true} onChange={() => setCotitularidad(true)} />
              Sí
            </label>
            <label className='checkbox-rounded'>
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
