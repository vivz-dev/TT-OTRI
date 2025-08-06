// src/pages/Resoluciones/components/Cotitularidad.jsx
import React, { useState } from 'react';
import './Cotitularidad.css';
import { AdjuntarArchivo } from '../../layouts/components';
import ESPOLCotitularRow from './ESPOLCotitularRow';
import GeneralCotitularRow from './GeneralCotitularRow';

const NUEVA_FILA = {
  institucion: '',
  ruc: '',
  correo: '',
  representante: { nombre: '', username: '', telefono: '', porcentaje: '', correo: '' },
  esEspol: false,
};

const Cotitularidad = () => {
  /* ───────── estado ───────── */
  const [filas, setFilas] = useState([
    {
      institucion: 'ESPOL',
      ruc: '0967486931',
      correo: 'espol@espol.edu.ec',
      representante: { nombre: '', username: '', telefono: '', porcentaje: '', correo: '' },
      esEspol: true,
    },
  ]);
  const [errorPorcentaje, setErrorPorcentaje] = useState(false);

  /* ───────── helper ───────── */
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
  };

  /* ───────── handlers ───────── */
  const handleSelectUsuarioESPOL = (usuario, idx) => {
    updateFila(idx, 'representante.nombre', usuario.nombre);
    updateFila(idx, 'representante.username', usuario.username);
    updateFila(idx, 'representante.telefono', usuario.telefono);
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

  /* ───────── render ───────── */
  return (
    <form className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Cotitularidad</h1>
        <p className="subtitulo-form">
          Complete los datos de las instituciones cotitulares según lo establecido en el acuerdo de
          cotitularidad.
        </p>
      </div>

      <div className="form-card">
        <div className="tabla-cotitular-scroll">
          <table className="cotitular-table">
            <thead>
              <tr>
                <th colSpan={3}>Institución cotitular</th>
                <th colSpan={4}>Representante cotitular</th>
              </tr>
              <tr>
                <th>Nombre</th>
                <th>RUC</th>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Correo institucional</th>
                <th>Teléfono de contacto</th>
                <th>% titularidad</th>
                <th /> {/* columna icono */}
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
                <td colSpan={7} style={{ textAlign: 'right' }}>
                  <strong>Total de cotitularidad</strong>
                </td>
                <td>
                  <strong>
                    {filas.reduce(
                      (acc, f) => acc + Number(f.representante.porcentaje || 0),
                      0,
                    )}
                    %
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {errorPorcentaje && (
          <p className="error-msg">El total de % de titularidad debe sumar exactamente 100.</p>
        )}

        <button type="button" className="btn-add-cotitular" onClick={handleAddFila}>
          Añadir cotitular
        </button>
      </div>

      <div className="form-card">
        <AdjuntarArchivo
          descripcion="Documento(s) con especificaciones acerca de la cotitularidad."
          file={null}
          onChange={() => {}}
        />
      </div>
    </form>
  );
};

export default Cotitularidad;
