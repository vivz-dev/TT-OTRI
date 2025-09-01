// src/pages/Acuerdos/AcuerdoDistribucion.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import './AcuerdoDistribucion.css';
import { AdjuntarArchivo } from '../../layouts/components';
import AutorInventorRow from './AutorInventorRow';

// ⬇️ RTK Query – Unidades
import { useGetUnidadesQuery } from '../../../services/unidadesApi';

/* ============================
   Estado base de una fila
   ============================ */
const NUEVO_AUTOR = {
  idPersona: null,       // 👈 requerido para payload
  correo: '',
  identificacion: '',
  nombreCompleto: '',
  unidad: '',            // nombre/sigla visible
  idUnidad: null,        // id numérico
  pctAutor: '',
  pctUnidad: '',
};

/* ============================
   Helpers usuario
   ============================ */
const getIdPersonaFromRaw = (raw) =>
  raw?.id ?? raw?.Id ?? raw?.idPersona ?? raw?.IdPersona ?? raw?.personaId ?? raw?.PersonaId ?? null;

const pickNombre = (u) =>
  u?.nombre ?? u?.displayName ?? u?.fullName ?? u?.nombreCompleto ?? u?.Name ?? u?.Nombre ?? '';

const pickIdentificacion = (u) =>
  u?.identificacion ?? u?.cedula ?? u?.dni ?? u?.idCard ?? u?.ID ?? '';

const pickCorreo = (u) => {
  const direct = u?.email ?? u?.correo ?? u?.Email ?? u?.Correo ?? '';
  if (direct) return String(direct).toLowerCase();
  const username = u?.username || '';
  return username ? `${username}@espol.edu.ec` : '';
};

/* ============================
   Helpers Unidades (nombre & id)
   ============================ */
const getIdUnidad = (item) =>
  item?.idUnidad ?? item?.IdUnidad ?? item?.id ?? item?.Id ?? null;

const getNombreUnidad = (item) =>
  item?.nombreUnidad ?? item?.NombreUnidad ?? item?.nombre ?? item?.Nombre ?? item?.titulo ?? item?.Titulo ?? '—';

const findUnidadByName = (list, name) => {
  if (!name) return null;
  const target = String(name).trim().toLowerCase();
  return list.find(u => String(u.nombre).trim().toLowerCase() === target) || null;
};

const findUnidadById = (list, id) => {
  if (id == null) return null;
  return list.find(u => String(u.id) === String(id)) || null;
};

/* ============================
   Helper: porcentaje [0..100] -> ratio [0..1]
   ============================ */
const toRatio = (v) => {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  const bounded = Math.min(Math.max(n, 0), 100);
  // redondeo a 4 decimales
  return Math.round((bounded / 100 + Number.EPSILON) * 1e4) / 1e4;
};

const AcuerdoDistribucion = forwardRef((_, ref) => {
  const [filas, setFilas] = useState([{ ...NUEVO_AUTOR }]);
  const [archivoAcuerdo, setArchivoAcuerdo] = useState(null);
  const [errorAutor, setErrorAutor] = useState(false);
  const [errorUnidad, setErrorUnidad] = useState(false);

  // Unidades desde servicio
  const { data: unidadesRaw = [], isLoading: isLoadingUnidades, isError: isErrorUnidades } = useGetUnidadesQuery();

  // Normalizar a { id, nombre }
  const unidades = useMemo(() => {
    if (!Array.isArray(unidadesRaw)) return [];
    return unidadesRaw
      .map(u => ({ id: getIdUnidad(u), nombre: getNombreUnidad(u) }))
      .filter(u => u.id != null && u.nombre && u.nombre !== '—');
  }, [unidadesRaw]);

  // Totales en porcentaje (UI)
  const totalAutor = useMemo(() => filas.reduce((acc, f) => acc + Number(f.pctAutor || 0), 0), [filas]);
  const totalUnidad = useMemo(() => filas.reduce((acc, f) => acc + Number(f.pctUnidad || 0), 0), [filas]);
  const totalAutorOK = totalAutor === 100;
  const totalUnidadOK = totalUnidad === 100;

  const setErroresTotales = (list) => {
    const tAutor = list.reduce((acc, f) => acc + Number(f.pctAutor || 0), 0);
    const tUnidad = list.reduce((acc, f) => acc + Number(f.pctUnidad || 0), 0);
    setErrorAutor(tAutor !== 100);
    setErrorUnidad(tUnidad !== 100);
    return { tAutorOK: tAutor === 100, tUnidadOK: tUnidad === 100 };
  };

  // Actualizador central con consistencia nombre/id unidad
  const updateFila = (index, patch) => {
    setFilas(prev => {
      const current = prev[index] || {};
      let nextPatch = { ...patch };

      // Si el hijo solo manda nombre (unidad), buscamos su id
      if ('unidad' in patch && !('idUnidad' in patch)) {
        const found = findUnidadByName(unidades, patch.unidad);
        if (found) nextPatch.idUnidad = found.id;
      }
      // Si solo manda idUnidad, resolvemos el nombre
      if ('idUnidad' in patch && !('unidad' in patch)) {
        const found = findUnidadById(unidades, patch.idUnidad);
        if (found) nextPatch.unidad = found.nombre;
      }
      // Normalizar si ya hay uno sin el otro
      if (!('unidad' in patch) && !('idUnidad' in patch)) {
        if (current.unidad && !current.idUnidad) {
          const found = findUnidadByName(unidades, current.unidad);
          if (found) nextPatch.idUnidad = found.id;
        } else if (current.idUnidad && !current.unidad) {
          const found = findUnidadById(unidades, current.idUnidad);
          if (found) nextPatch.unidad = found.nombre;
        }
      }

      const next = prev.map((f, i) => (i === index ? { ...f, ...nextPatch } : f));
      setErroresTotales(next);
      return next;
    });
  };

  const addFila = () => {
    setFilas(prev => {
      const next = [...prev, { ...NUEVO_AUTOR }];
      setErroresTotales(next);
      return next;
    });
  };

  const removeFila = (index) => {
    setFilas(prev => {
      const next = prev.filter((_, i) => i !== index);
      setErroresTotales(next);
      return next;
    });
  };

  // Igual que en Cotitularidad, pero mapeado al shape de Acuerdo
  const handleSelectUsuarioESPOL = (usuarioSeleccionado, idx) => {
    const nombreCompleto = pickNombre(usuarioSeleccionado);
    const identificacion = pickIdentificacion(usuarioSeleccionado);
    const correo = pickCorreo(usuarioSeleccionado);
    const idPersona = getIdPersonaFromRaw(usuarioSeleccionado?.raw);

    // Si trae unidad legible, intentar casarla
    const unidadInferidaNombre =
      usuarioSeleccionado?.unidad?.sigla ||
      usuarioSeleccionado?.unidad ||
      usuarioSeleccionado?.facultad ||
      '';

    const patch = { idPersona: idPersona ?? null, nombreCompleto, identificacion, correo };

    if (unidadInferidaNombre) {
      const found = findUnidadByName(unidades, unidadInferidaNombre);
      if (found) {
        patch.unidad = found.nombre;
        patch.idUnidad = found.id;
      }
    }

    updateFila(idx, patch);
  };

  const handleArchivoChange = (fileOrFiles) => {
    const file =
      Array.isArray(fileOrFiles) ? fileOrFiles[0]
      : fileOrFiles?.target?.files?.[0] ?? fileOrFiles ?? null;
    setArchivoAcuerdo(file || null);
  };

  // Validaciones (UI)
  const reqText = (t) => typeof t === 'string' && t.trim().length > 0;
  const pctOk = (v) => v === '' ? false : /^(100|[1-9]?\d)$/.test(String(v));

  const filaCompleta = (f) =>
    f.idPersona != null &&
    reqText(f.correo) &&
    reqText(f.nombreCompleto) &&
    reqText(f.identificacion) &&
    reqText(f.unidad) &&
    f.idUnidad != null &&
    pctOk(f.pctAutor) &&
    pctOk(f.pctUnidad);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const filasOk = filas.every(filaCompleta);
      const { tAutorOK, tUnidadOK } = setErroresTotales(filas);
      const archivoOk = !!archivoAcuerdo;
      return filasOk && tAutorOK && tUnidadOK && archivoOk;
    },
    // 👉 Devuelve el bloque listo para mezclar en el payload gigante
    getPayload: () => {
      const autores = filas.map(f => ({
        idPersona: f.idPersona,
        idUnidad: f.idUnidad,
        // ⬇️ CONVERSIÓN a ratio [0..1] para el backend
        porcAutor: toRatio(f.pctAutor),
        porcUnidad: toRatio(f.pctUnidad),
      }));

      const archivo = archivoAcuerdo
        ? {
            nombre: archivoAcuerdo.name || null,
            formato: archivoAcuerdo.type || 'application/pdf',
            tipoEntidad: 'D',     // 👈 requerido
            tamano: archivoAcuerdo.size ?? null,
            file: archivoAcuerdo, // mantiene File para el orquestador
          }
        : null;

      // (opcional) útil si quieres depurar lo que va a salir:
      // console.log('[AcuerdoDistribucion] payload ->', { acuerdoDistribAutores: { autores, archivo } });

      return { acuerdoDistribAutores: { autores, archivo } };
    },
  }));

  return (
    <form className="acuerdo-form">
      <div className="form-header">
        <h1 className="titulo-principal-form">Acuerdo de distribución</h1>
        <p className="subtitulo-form">
          Complete los datos del acuerdo de distribución de los beneficiarios Autores/Inventores e Institucionales.
        </p>

        {isLoadingUnidades && <p className="coti-hint">Cargando unidades…</p>}
        {isErrorUnidades && <p className="alert"><AlertCircle size={16}/> No se pudieron cargar las unidades.</p>}
      </div>

      <section className="card acuerdo-card">
        <div className="tabla-wrapper">
          <table className="acuerdo-table">
            <thead>
              <tr className="th-group">
                <th className="right-border porcentaje-total" colSpan={4}>Datos del autor/inventor</th>
                <th className="porcentaje-total" colSpan={2}>% distribución</th>
                <th />
              </tr>
              <tr>
                <th className="porcentaje-total">Correo Institucional</th>
                <th className="porcentaje-total">No. de Identificación</th>
                <th className="porcentaje-total">Nombre Completo</th>
                <th className="porcentaje-total right-border">Unidad o Centro</th>
                <th className="porcentaje-total">Autor/inventor</th>
                <th className="porcentaje-total">Unidad/Centro</th>
                <th aria-label="acciones" />
              </tr>
            </thead>

            <tbody>
              {filas.map((fila, idx) => (
                <AutorInventorRow
                  key={idx}
                  index={idx}
                  data={fila}
                  unidades={unidades}
                  onChange={(patch) => updateFila(idx, patch)}
                  onDelete={() => removeFila(idx)}
                  onSelectUsuario={handleSelectUsuarioESPOL}
                />
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={4} className="tfoot-label">Totales</td>
                <td className={`tfoot-badge ${totalAutorOK ? 'ok' : 'warn'}`}>
                  <span className="badge-total">{totalAutor}%</span>
                </td>
                <td className={`tfoot-badge ${totalUnidadOK ? 'ok' : 'warn'}`}>
                  <span className="badge-total">{totalUnidad}%</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {(errorAutor || errorUnidad) && (
          <div className="alerts">
            {!totalAutorOK && (
              <p className="alert">
                <AlertCircle size={16} /> El total de <b>Autor/inventor</b> debe sumar exactamente 100%.
              </p>
            )}
            {!totalUnidadOK && (
              <p className="alert">
                <AlertCircle size={16} /> El total de <b>Unidad/Centro</b> debe sumar exactamente 100%.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn-outline btn-add"
          onClick={addFila}
          disabled={isLoadingUnidades || isErrorUnidades || unidades.length === 0}
        >
          <PlusCircle size={18} /> Añadir autor/inventor
        </button>
      </section>

      <section className="card attach-card">
        <AdjuntarArchivo
          descripcion="Acuerdo de distribución de autores/inventores."
          file={archivoAcuerdo}
          onChange={handleArchivoChange}
        />
        {!archivoAcuerdo && (
          <p className="coti-hint">Adjunta al menos un archivo para continuar.</p>
        )}
      </section>
    </form>
  );
});

export default AcuerdoDistribucion;
