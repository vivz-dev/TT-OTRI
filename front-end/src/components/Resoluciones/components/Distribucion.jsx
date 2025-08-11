/**
 * Card Distribución
 * -----------------
 * • Autor/inventores + instituciones con porcentajes.
 * • validate() comprueba campos y totales; getData() devuelve payload.
 * • Se añadió una opción placeholder en el <select> para evitar que el
 *   valor quede en '' después de seleccionar “Unidades/Centros”.
 * • Al modificar un campo se limpia showErrors si todo queda válido.
 */
import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Trash2, MinusCircle } from 'lucide-react';
import './Distribucion.css';

const Distribucion = forwardRef(({ onDelete }, ref) => {
  /* ---------------- estado ---------------- */
  const [pctAutores, setPctAutores] = useState('');
  const [centros, setCentros] = useState([{ institucion: '', porcentaje: '' }]);
  const [showErrors, setShowErrors] = useState(false);

  /* ---------------- helpers ---------------- */
  const clamp = (v) => {
    if (v === '') return '';
    const n = Number(v);
    if (Number.isNaN(n) || n < 1) return '';
    return n > 100 ? 100 : n;
  };

  const addCentro = () =>
    setCentros((p) => [...p, { institucion: '', porcentaje: '' }]);

  const removeCentro = (idx) =>
    setCentros((p) => p.filter((_, i) => i !== idx));

  const updateCentro = (idx, field, value) =>
    setCentros((p) =>
      p.map((c, i) =>
        i === idx ? { ...c, [field]: field === 'porcentaje' ? clamp(value) : value } : c
      )
    );

  /* ---------------- cálculos ---------------- */
  const subtotalAutores = pctAutores === '' ? 0 : Number(pctAutores);
  const subtotalCentros = useMemo(
    () => centros.reduce((acc, c) => acc + (c.porcentaje === '' ? 0 : Number(c.porcentaje)), 0),
    [centros]
  );
  const total = subtotalAutores + subtotalCentros;
  const totalClass = total === 100 ? 'total-ok' : 'total-error';

  /* ---------------- validación + API ---------------- */
  const isValid = () => {
    const autoresOk = pctAutores !== '';
    const centrosOk = centros.every(
      (c) => c.institucion !== '' && c.porcentaje !== ''
    );
    return autoresOk && centrosOk && total === 100;
  };

  /* expone al padre */
  useImperativeHandle(ref, () => ({
    validate() {
      const valido = isValid();
      setShowErrors(!valido);
      return valido;
    },
    getData() {
      return {
        montoMaximo: 0,
        montoMinimo: 0,
        porcSubtotalAutores: subtotalAutores / 100,
        porcSubtotalInstitut: subtotalCentros / 100,
      };
    },
  }));

  /* Si el usuario corrige campos, intentamos ocultar errores */
  const handleAutores = (v) => {
    setPctAutores(clamp(v));
    if (showErrors) setShowErrors(!isValid());
  };
  const handleCentroSelect = (idx, v) => {
    updateCentro(idx, 'institucion', v);
    if (showErrors) setShowErrors(!isValid());
  };
  const handleCentroPct = (idx, v) => {
    updateCentro(idx, 'porcentaje', v);
    if (showErrors) setShowErrors(!isValid());
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="distribucion-card">
      {/* botón eliminar card */}
      <div className="distribucion-delete-top">
        <button className="btn-delete-top" onClick={onDelete}>
          <MinusCircle size={18} />
        </button>
      </div>

      <h3 className="tabla-titulo">Tabla de porcentajes de distribución</h3>

      <table className="tabla-distribucion">
        <thead>
          <tr>
            <th colSpan={4} className="beneficiarios">
              Listado de beneficiarios
            </th>
          </tr>
        </thead>

        <tbody>
          {/* ------- fila autores -------- */}
          <tr>
            <td className="nombre-col">Autores / inventores</td>
            <td className="input-col">
              <input
                type="number"
                min="1"
                max="100"
                value={pctAutores}
                placeholder="0"
                className={showErrors && pctAutores === '' ? 'field-error' : ''}
                onChange={(e) => handleAutores(e.target.value)}
              />
            </td>
            <td className="simbolo">%</td>
            <td />
          </tr>

          <tr className="fila-subtotal">
            <td>Subtotal de autores / inventores</td>
            <td className="subtotal" colSpan={3}>
              {pctAutores === '' ? '-%' : `${pctAutores}%`}
            </td>
          </tr>

          {/* ------- filas centros -------- */}
          {centros.map((c, idx) => (
            <tr key={idx}>
              <td className="input-select">
                <select
                  value={c.institucion}
                  className={showErrors && c.institucion === '' ? 'field-error' : ''}
                  onChange={(e) => handleCentroSelect(idx, e.target.value)}
                >
                  {/* placeholder real para evitar valor = '' “fantasma” */}
                  <option value="" disabled>
                    Seleccionar institución...
                  </option>
                  <option value="Unidades/Centros">Unidades/Centros</option>
                  <option value="ESPOL (institución)">ESPOL (institución)</option>
                  <option value="Oficina de Transferencia de Resultados de Investigación (OTRI)">
                    Oficina de Transferencia de Resultados de Investigación (OTRI)
                  </option>
                </select>
              </td>

              <td className="input-col">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={c.porcentaje}
                  placeholder="0"
                  className={showErrors && c.porcentaje === '' ? 'field-error' : ''}
                  onChange={(e) => handleCentroPct(idx, e.target.value)}
                />
              </td>

              <td className="simbolo">%</td>

              <td className="delete-col">
                <button className="btn-delete" onClick={() => removeCentro(idx)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}

          <tr className="fila-subtotal">
            <td>Subtotal de instituciones / centros</td>
            <td className="subtotal" colSpan={3}>
              {subtotalCentros === 0 ? '-%' : `${subtotalCentros}%`}
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td className="total-label">Porcentaje total</td>
            <td className={`total-valor ${totalClass}`} colSpan={3}>
              {total}%
            </td>
          </tr>
        </tfoot>
      </table>

      {total !== 100 && (
        <p className="subtotales-error">¡Los subtotales deben sumar 100 %!</p>
      )}

      <button className="btn-add" onClick={addCentro}>
        Añadir Centro/Institución
      </button>
    </div>
  );
});

export default Distribucion;
