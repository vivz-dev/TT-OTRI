// src/pages/Resoluciones/components/Distribucion.jsx
/**
 * Card Distribución
 * -----------------
 * • Autor/inventores + instituciones con porcentajes.
 * • Monto mínimo/máximo con "No aplica límite".
 * • validate() comprueba campos/porcentajes y (si aplica) el rango de montos.
 * • getData() devuelve payload listo para API.
 */
import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Trash2, MinusCircle } from 'lucide-react';
import './Distribucion.css';

const INSTITUCIONES = [
  { value: 'Unidades/Centros', label: 'Unidades/Centros' },
  { value: 'ESPOL (institución)', label: 'ESPOL (institución)' },
  {
    value: 'Oficina de Transferencia de Resultados de Investigación (OTRI)',
    label: 'Oficina de Transferencia de Resultados de Investigación (OTRI)',
  },
];

const Distribucion = forwardRef(({ onDelete }, ref) => {
  /* ---------------- estado ---------------- */
  const [pctAutores, setPctAutores] = useState('');
  const [centros, setCentros] = useState([{ institucion: '', porcentaje: '' }]);

  // 💰 Monto mínimo/máximo
  const [noLimit, setNoLimit] = useState(false);
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');

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
        i === idx
          ? { ...c, [field]: field === 'porcentaje' ? clamp(value) : value }
          : c
      )
    );

  const parseMoney = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  /* ---------------- cálculos ---------------- */
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

  // 🔒 valores seleccionados (excluye vacíos)
  const selectedValues = useMemo(
    () => centros.map((c) => c.institucion).filter(Boolean),
    [centros]
  );

  // 🎯 opciones disponibles para un índice concreto:
  //   - todas las NO usadas por otras filas
  //   - + la que ya tenga la fila actual (para que no desaparezca)
  const availableFor = (idx) => {
    const current = centros[idx]?.institucion;
    return INSTITUCIONES.filter(
      (opt) => opt.value === current || !selectedValues.includes(opt.value)
    );
  };

  // ¿Quedan opciones libres para añadir otra fila?
  const canAddMore = selectedValues.length < INSTITUCIONES.length;

  const montosValidos = () => {
    const min = parseMoney(montoMin);
    if (min === null || min < 0) return false;

    if (!noLimit) {
      const max = parseMoney(montoMax);
      if (max === null || max < 0) return false;
      if (min > max) return false;
    }
    return true;
  };

  /* ---------------- validación + API ---------------- */
  const isValid = () => {
    const autoresOk = pctAutores !== '';
    const centrosOk = centros.every(
      (c) => c.institucion !== '' && c.porcentaje !== ''
    );

    // (Opcional extra) asegurar unicidad:
    const uniqueCount = new Set(selectedValues).size;
    const sinDuplicados = uniqueCount === selectedValues.length;

    return autoresOk && centrosOk && sinDuplicados && total === 100 && montosValidos();
  };

  /* expone al padre */
  useImperativeHandle(ref, () => ({
    validate() {
      const valido = isValid();
      setShowErrors(!valido);
      return valido;
    },
    getData() {
      const min = parseMoney(montoMin);
      const max = noLimit ? null : parseMoney(montoMax);
      return {
        montoMinimo: min, // obligatorio
        montoMaximo: max, // null si no aplica límite
        porcSubtotalAutores: subtotalAutores / 100,
        porcSubtotalInstitut: subtotalCentros / 100,
        // Tip: si necesitas mandar el detalle:
        beneficiariosInstitucionales: centros.map((c) => ({
          institucion: c.institucion,
          porcentaje: Number(c.porcentaje) / 100,
        })),
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

  const handleNoLimit = (checked) => {
    setNoLimit(checked);
    if (checked) {
      setMontoMin('');
      setMontoMax('');
    }
    if (showErrors) setShowErrors(!isValid());
  };

  const handleMontoMin = (v) => {
    setMontoMin(v);
    if (showErrors) setShowErrors(!isValid());
  };
  const handleMontoMax = (v) => {
    setMontoMax(v);
    if (showErrors) setShowErrors(!isValid());
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="form-card">
      {/* botón eliminar card */}
      <h2 className="form-card-header">Tabla de porcentaje de distribución</h2>
      <div className="distribucion-delete-top">
        <button className="btn-delete-top" onClick={onDelete}>
          <MinusCircle size={18} />
        </button>
      </div>

      {/* 💰 Sección de montos */}
      <div className="monto-section">
        <div className="monto-row">
          <div className="monto-item">
            <label className="monto-label">Monto Mínimo</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={montoMin}
              disabled={false}
              className={
                showErrors &&
                !noLimit &&
                !montosValidos() &&
                (montoMin === '' || parseMoney(montoMin) === null)
                  ? 'field-error'
                  : ''
              }
              onChange={(e) => handleMontoMin(e.target.value)}
            />
          </div>

          <div className="monto-item">
            <label className="monto-label">Monto Máximo</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={noLimit ? '' : montoMax}
              disabled={noLimit}
              className={
                showErrors &&
                !noLimit &&
                !montosValidos() &&
                (montoMax === '' || parseMoney(montoMax) === null)
                  ? 'field-error'
                  : ''
              }
              onChange={(e) => handleMontoMax(e.target.value)}
            />
          </div>

          <label className="nolimit-check">
            <input
              type="checkbox"
              checked={noLimit}
              onChange={(e) => handleNoLimit(e.target.checked)}
            />
            <span>No aplica límite</span>
          </label>
        </div>

        {!noLimit && showErrors && !montosValidos() && (
          <p className="monto-error">
            Verifica los montos: ambos requeridos, no negativos y Mínimo ≤ Máximo.
          </p>
        )}
      </div>

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
            <td className="nombre-col">Autores/Inventores beneficiarios</td>
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
            <td>Subtotal de autores/inventores beneficiarios</td>
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
                  <option value="" disabled>
                    Seleccionar beneficiario institucional...
                  </option>
                  {availableFor(idx).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
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
            <td>Subtotal de beneficiarios institucionales</td>
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

      <button className="btn-add" onClick={addCentro} disabled={!canAddMore}>
        Añadir beneficiario institucional
      </button>
      {!canAddMore && (
        <p className="hint">No hay más beneficiarios institucionales disponibles para agregar.</p>
      )}
    </div>
  );
});

export default Distribucion;
