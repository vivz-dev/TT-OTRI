import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Cotitularidad.css';
import { AdjuntarArchivo } from '../../layouts/components';
import ESPOLCotitularRow from './ESPOLCotitularRow';
import GeneralCotitularRow from './GeneralCotitularRow';
import * as Buttons from "../../layouts/buttons/buttons_index";


const NUEVA_FILA = {
  institucion: '',
  ruc: '',
  correo: '',
  representante: { nombre: '', username: '', porcentaje: '', correo: '' },
  esEspol: false,
};

const Cotitularidad = forwardRef((_, ref) => {
  const [filas, setFilas] = useState([
    {
      institucion: 'ESPOL',
      ruc: '0967486931',
      correo: 'espol@espol.edu.ec',
      representante: { nombre: '', username: '', porcentaje: '', correo: '' },
      esEspol: true,
    },
  ]);

  const [errorPorcentaje, setErrorPorcentaje] = useState(false);
  const [archivoAcuerdo, setArchivoAcuerdo] = useState(null);

  const handleArchivoChange = (fileOrFiles) => {
    const file =
      Array.isArray(fileOrFiles) ? fileOrFiles[0]
      : fileOrFiles?.target?.files?.[0] ?? fileOrFiles ?? null;
    setArchivoAcuerdo(file || null);
  };

  const updateFila = (idx, path, value) =>
    setFilas(prev =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const clone = structuredClone(f);
        const keys = path.split('.');
        let ref = clone;
        keys.slice(0, -1).forEach(k => (ref = ref[k]));
        ref[keys.at(-1)] = value;
        return clone;
      }),
    );

  const validarTotal = lista => {
    const sum = lista.reduce(
      (acc, f) => acc + Number(f.representante.porcentaje || 0),
      0,
    );
    setErrorPorcentaje(sum !== 100);
    return sum === 100;
  };

  const handleSelectUsuarioESPOL = (usuario, idx) => {
    updateFila(idx, 'representante.nombre', usuario.nombre);
    updateFila(idx, 'representante.username', usuario.username);
    updateFila(idx, 'representante.correo', `${usuario.username}@espol.edu.ec`);
  };

  const handlePorcentajeChange = (idx, value) => {
    if (value === '' || /^(100|[1-9]?\d)$/.test(value)) {
      updateFila(idx, 'representante.porcentaje', value);
      validarTotal(
        filas.map((f, i) =>
          i === idx ? { ...f, representante: { ...f.representante, porcentaje: value } } : f,
        ),
      );
    }
  };

  const handleAddFila = () => {
    const nuevaLista = [...filas, structuredClone(NUEVA_FILA)];
    setFilas(nuevaLista);
    validarTotal(nuevaLista);
  };

  const handleRemoveFila = idx => {
    const lista = filas.filter((_, i) => i !== idx);
    setFilas(lista);
    validarTotal(lista);
  };

  const filaCompleta = (f) => {
    const porcOk = f.representante.porcentaje !== '' && Number(f.representante.porcentaje) >= 0;
    if (f.esEspol) return !!f.representante.username && porcOk;
    const reqText = (t) => typeof t === 'string' && t.trim().length > 0;
    return (
      reqText(f.institucion) &&
      reqText(f.ruc) &&
      reqText(f.correo) &&
      reqText(f.representante.nombre) &&
      reqText(f.representante.correo) &&
      porcOk
    );
  };

useImperativeHandle(ref, () => ({
  validate: () => {
    const totalOk = validarTotal(filas);
    const filasOk = filas.every(filaCompleta);
    const archivoOk = !!archivoAcuerdo; // requerido para tu validación
    return totalOk && filasOk && archivoOk;
  },
  getPayload: () => ({
    filas: filas.map(f => ({
      esEspol: f.esEspol,
      institucion: f.institucion,
      ruc: f.ruc,
      correo: f.correo,
      representante: { ...f.representante },
    })),
    acuerdoArchivoNombre: archivoAcuerdo?.name ?? null,
    acuerdoArchivoTipo: archivoAcuerdo?.type ?? null,
    acuerdoArchivoFile: archivoAcuerdo ?? null, 
  }),
}));


  const total = filas.reduce((acc, f) => acc + Number(f.representante.porcentaje || 0), 0);
  const totalOk = total === 100;

  return (
    <form className="coti-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-header">
        <h1 className="titulo-principal-form">Cotitularidad</h1>
        <p className="subtitulo-form">Complete los datos de las instituciones cotitulares según el acuerdo.</p>
      </div>
      <section className="card coti-card">
        <div className="table-wrap">
          <table className="coti-table">
            <thead>
              <tr className="th-group">
                <th colSpan={3}>Institución cotitular</th>
                <th colSpan={3}>Representante cotitular</th>
                <th />
              </tr>
              <tr>
                <th>Nombre</th>
                <th>RUC</th>
                <th>Correo institucional</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>% titularidad</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filas.map((fila, idx) =>
                fila.esEspol ? (
                  <ESPOLCotitularRow
                    key={idx}
                    fila={fila}
                    index={idx}
                    onSelectUsuario={handleSelectUsuarioESPOL}
                    onPorcentajeChange={handlePorcentajeChange}
                  />
                ) : (
                  <GeneralCotitularRow
                    key={idx}
                    fila={fila}
                    index={idx}
                    onChange={(path, val) => updateFila(idx, path, val)}
                    onPorcentajeChange={handlePorcentajeChange}
                    onDelete={() => handleRemoveFila(idx)}
                  />
                ),
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={6} className="tfoot-label">Total de cotitularidad</td>
                <td className="tfoot-badge">
                  <span className={`badge-total ${totalOk ? 'ok' : 'warn'}`}>{total}%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {errorPorcentaje && (
          <p className="coti-error">El total debe sumar exactamente 100%.</p>
        )}

        <Buttons.RegisterButton
          onClick={handleAddFila}
          text={' +  Añadir cotitular'}
        />
      </section>

      <section className="card attach-card">
        <AdjuntarArchivo
          descripcion="Documento(s) con especificaciones acerca de la cotitularidad."
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

export default Cotitularidad;
