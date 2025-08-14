// src/pages/Resoluciones/components/AcuerdoDistribucion.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import './AcuerdoDistribucion.css';
import { AdjuntarArchivo } from '../../layouts/components';

import AutorInventorRow from './AutorInventorRow';

/* ============================
   MOCKS (puedes moverlos a otro archivo)
   ============================ */
const MOCK_ESPOL_USERS = [
  {
    username: 'vivvfalcon',
    correo: 'vivvfalcon@espol.edu.ec',
    identificacion: '0999999999',
    nombreCompleto: 'Viviana Yolanda Vera Falconí',
    unidad: 'FIEC',
  },
  {
    username: 'jperez',
    correo: 'jperez@espol.edu.ec',
    identificacion: '0912345678',
    nombreCompleto: 'Juan Pérez González',
    unidad: 'FIMCP',
  },
  {
    username: 'mlopez',
    correo: 'mlopez@espol.edu.ec',
    identificacion: '0987654321',
    nombreCompleto: 'María López Andrade',
    unidad: 'FCNM',
  },
  {
    username: 'rquiroz',
    correo: 'rquiroz@espol.edu.ec',
    identificacion: '0970010020',
    nombreCompleto: 'Roberto Quiroz',
    unidad: 'ESPAE',
  },
];

const MOCK_UNIDADES = ['FIEC','FIMCP','FCNM','ESPAE','FICT','FCSH','CELEX','COPSI','VICINN','OTRI'];

/* ============================
   Estado base de una fila
   ============================ */
const NUEVO_AUTOR = {
  correo: '',
  identificacion: '',
  nombreCompleto: '',
  unidad: '',
  pctAutor: '',
  pctUnidad: '',
};

const AcuerdoDistribucion = forwardRef((_, ref) => {
  const [filas, setFilas] = useState([{ ...NUEVO_AUTOR }]);
  const [archivoAcuerdo, setArchivoAcuerdo] = useState(null);
  const [errorAutor, setErrorAutor] = useState(false);
  const [errorUnidad, setErrorUnidad] = useState(false);

  // Totales (cada columna debe sumar 100)
  const totalAutor = useMemo(
    () => filas.reduce((acc, f) => acc + Number(f.pctAutor || 0), 0),
    [filas]
  );
  const totalUnidad = useMemo(
    () => filas.reduce((acc, f) => acc + Number(f.pctUnidad || 0), 0),
    [filas]
  );

  const totalAutorOK = totalAutor === 100;
  const totalUnidadOK = totalUnidad === 100;

  const setErroresTotales = (list) => {
    const tAutor = list.reduce((acc, f) => acc + Number(f.pctAutor || 0), 0);
    const tUnidad = list.reduce((acc, f) => acc + Number(f.pctUnidad || 0), 0);
    setErrorAutor(tAutor !== 100);
    setErrorUnidad(tUnidad !== 100);
    return { tAutorOK: tAutor === 100, tUnidadOK: tUnidad === 100 };
  };

  const updateFila = (index, patch) => {
    setFilas(prev => {
      const next = prev.map((f, i) => (i === index ? { ...f, ...patch } : f));
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

  const handleArchivoChange = (fileOrFiles) => {
    const file =
      Array.isArray(fileOrFiles) ? fileOrFiles[0]
      : fileOrFiles?.target?.files?.[0] ?? fileOrFiles ?? null;
    setArchivoAcuerdo(file || null);
  };

  // Validaciones simples
  const reqText = (t) => typeof t === 'string' && t.trim().length > 0;
  const pctOk = (v) => v === '' ? false : /^(100|[1-9]?\d)$/.test(String(v));

  const filaCompleta = (f) =>
    reqText(f.correo) &&
    reqText(f.identificacion) &&
    reqText(f.nombreCompleto) &&
    reqText(f.unidad) &&
    pctOk(f.pctAutor) &&
    pctOk(f.pctUnidad);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const filasOk = filas.every(filaCompleta);
      const { tAutorOK, tUnidadOK } = setErroresTotales(filas);
      const archivoOk = !!archivoAcuerdo;
      return filasOk && tAutorOK && tUnidadOK && archivoOk;
    },
    getPayload: () => ({
      autores: filas.map(f => ({
        correo: f.correo,
        identificacion: f.identificacion,
        nombreCompleto: f.nombreCompleto,
        unidad: f.unidad,
        pctAutor: Number(f.pctAutor),
        pctUnidad: Number(f.pctUnidad),
      })),
      totales: { autor: totalAutor, unidad: totalUnidad },
      acuerdoArchivoNombre: archivoAcuerdo?.name ?? null,
      acuerdoArchivoTipo: archivoAcuerdo?.type ?? null,
    }),
  }));

  return (
    <form className="acuerdo-form">
      <div className="form-header">
        <h1 className="titulo-principal-form">Acuerdo de distribución</h1>
        <p className="subtitulo-form">
          Complete los datos del acuerdo de distribución de los beneficiarios Autores/Inventores e Institucionales.
        </p>
      </div>

      <section className="card acuerdo-card">
        <div className="tabla-wrapper">
          <table className="acuerdo-table">
            <thead>
              <tr className="th-group">
                <th colSpan={4}>Datos del autor/inventor</th>
                <th colSpan={2}>% distribución</th>
                <th />
              </tr>
              <tr>
                <th>Correo Institucional</th>
                <th>No. de Identificación</th>
                <th>Nombre Completo</th>
                <th>Unidad o Centro</th>
                <th>Autor/inventor</th>
                <th>Unidad/Centro</th>
                <th aria-label="acciones" />
              </tr>
            </thead>

            <tbody>
              {filas.map((fila, idx) => (
                <AutorInventorRow
                  key={idx}
                  index={idx}
                  data={fila}
                  users={MOCK_ESPOL_USERS}
                  unidades={MOCK_UNIDADES}
                  onChange={(patch) => updateFila(idx, patch)}
                  onDelete={() => removeFila(idx)}
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

        <button type="button" className="btn-outline btn-add" onClick={addFila}>
          <PlusCircle size={18} /> Añadir autor/inventor
        </button>
      </section>

      <section className="card attach-card">
        <AdjuntarArchivo
          descripcion="Documento(s) con especificaciones acerca del acuerdo de distribución."
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
