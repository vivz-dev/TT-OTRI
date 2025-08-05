import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Trash2 } from 'lucide-react';
import './Distribucion.css';

const Distribucion = forwardRef((_, ref) => {
  /* ---------- estado ---------- */
  const [pctAutores, setPctAutores] = useState('');
  const [centros, setCentros] = useState([{ institucion: '', porcentaje: '' }]);
  const [showErrors, setShowErrors] = useState(false); // para remarcar campos

  /* ---------- helpers ---------- */
  const clamp = (v) => {
    if (v === '') return '';
    const n = Number(v);
    if (Number.isNaN(n) || n < 1) return '';
    return n > 100 ? 100 : n;
  };

  const addCentro = () =>
    setCentros((prev) => [...prev, { institucion: '', porcentaje: '' }]);

  const updateCentro = (i, field, value) =>
    setCentros((prev) =>
      prev.map((c, idx) =>
        idx === i
          ? { ...c, [field]: field === 'porcentaje' ? clamp(value) : value }
          : c
      )
    );

  const removeCentro = (i) =>
    setCentros((prev) => prev.filter((_, idx) => idx !== i));

  /* ---------- subtotal / total ---------- */
  const subtotalAutores = pctAutores === '' ? 0 : Number(pctAutores);
  const subtotalCentros = useMemo(
    () =>
      centros.reduce(
        (acc, c) => acc + (c.porcentaje === '' ? 0 : Number(c.porcentaje)),
        0
      ),
    [centros]
  );
  const total = subtotalAutores + subtotalCentros;
  const totalClass = total === 100 ? 'total-ok' : 'total-error';

  /* ---------- VALIDACIÓN expuesta ---------- */
  useImperativeHandle(ref, () => ({
    validate() {
      const autoresOk = pctAutores !== '';
      const centrosOk = centros.every(
        (c) => c.institucion !== '' && c.porcentaje !== ''
      );
      const totalOk = total === 100;

      const valido = autoresOk && centrosOk && totalOk;
      setShowErrors(!valido); // muestra/oculta bordes rojos
      return valido;
    },
  }));

  /* ---------- UI ---------- */
  return (
    <div className="distribucion-card">
      <h3 className="tabla-titulo">Tabla de porcentajes de distribución</h3>

      <table className="tabla-distribucion">
        <thead>
          <tr>
            <th colSpan={4} className="beneficiarios">
              Lista de beneficiarios
            </th>
          </tr>
        </thead>

        <tbody>
          {/* autores */}
          <tr>
            <td className="nombre-col">Autores / inventores</td>
            <td className="input-col">
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={pctAutores}
                placeholder="0"
                className={showErrors && pctAutores === '' ? 'field-error' : ''}
                onChange={(e) => setPctAutores(clamp(e.target.value))}
              />
            </td>
            <td className="simbolo">%</td>
            <td />
          </tr>

          {/* subtotal autores */}
          <tr className="fila-subtotal">
            <td>Subtotal de autores / inventores</td>
            <td className="subtotal" colSpan={3}>
              {pctAutores === '' ? '-%' : `${pctAutores}%`}
            </td>
          </tr>

          {/* instituciones */}
          {centros.map((c, idx) => (
            <tr key={idx}>
              <td className="input-select">
                <select
                  value={c.institucion}
                  className={
                    showErrors && c.institucion === '' ? 'field-error' : ''
                  }
                  onChange={(e) =>
                    updateCentro(idx, 'institucion', e.target.value)
                  }
                >
                  <optgroup label="Seleccionar Institución...">
                    <option value="Unidades/Centros">Unidades/Centros</option>
                    <option value="ESPOL (institución)">ESPOL (institución)</option>
                    <option value="Oficina de Transferencia de Resultados de Investigación (OTRI)">
                      Oficina de Transferencia de Resultados de Investigación (OTRI)
                    </option>
                  </optgroup>
                </select>
              </td>

              <td className="input-col">
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={c.porcentaje}
                  placeholder="0"
                  className={
                    showErrors && c.porcentaje === '' ? 'field-error' : ''
                  }
                  onChange={(e) =>
                    updateCentro(idx, 'porcentaje', e.target.value)
                  }
                />
              </td>

              <td className="simbolo">%</td>

              <td className="delete-col">
                <button
                  className="btn-delete"
                  onClick={() => removeCentro(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}

          {/* subtotal centros */}
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
