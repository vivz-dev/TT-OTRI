import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const AutorInventorRow = ({ index, data, users, unidades, onChange, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);

  // 🔎 Armar listado: si no hay query, mostrar top N usuarios
  const query = (data.correo || '').toLowerCase().trim();
  const options = useMemo(() => {
    const list = !query
      ? users
      : users.filter(
          u =>
            u.correo.toLowerCase().includes(query) ||
            u.username.toLowerCase().includes(query) ||
            u.nombreCompleto.toLowerCase().includes(query)
        );
    return list.slice(0, 8);
  }, [query, users]);

  // ✅ Elegir usuario → autocompletar campos
  const chooseUser = (u) => {
    onChange({
      correo: u.correo,
      identificacion: u.identificacion,
      nombreCompleto: u.nombreCompleto,
      unidad: u.unidad,
    });
    setOpen(false);
  };

  // 🧠 Cerrar dropdown si clic fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onCorreoChange = (e) => {
    onChange({ correo: e.target.value });
    setOpen(true);
    setCursor(0);
  };

  const onCorreoKeyDown = (e) => {
    if (!open || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      chooseUser(options[cursor]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <tr className="autor-row" ref={boxRef}>
      {/* Correo (editable con dropdown) */}
      <td className="correo-cell">
        <div className="autocomplete">
          <input
            type="email"
            placeholder="usuario@espol.edu.ec"
            value={data.correo}
            onChange={onCorreoChange}
            onFocus={() => setOpen(true)}
            onKeyDown={onCorreoKeyDown}
            aria-expanded={open}
            aria-controls={`correo-list-${index}`}
            aria-autocomplete="list"
            role="combobox"
          />
          {open && options.length > 0 && (
            <ul
              id={`correo-list-${index}`}
              className="sug-list"
              role="listbox"
              aria-label="Sugerencias de correo institucional"
            >
              {options.map((u, i) => (
                <li
                  key={u.correo}
                  role="option"
                  aria-selected={i === cursor}
                  className={i === cursor ? 'active' : ''}
                  onMouseDown={() => chooseUser(u)}  /* evita blur antes del click */
                >
                  <div className="sug-top">{u.correo}</div>
                  <div className="sug-sub">
                    {u.nombreCompleto} — {u.unidad}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </td>

      {/* Identificación (solo lectura) */}
      <td>
        <input type="text" value={data.identificacion} readOnly />
      </td>

      {/* Nombre completo (solo lectura) */}
      <td>
        <input type="text" value={data.nombreCompleto} readOnly />
      </td>

      {/* Unidad/Centro (editable) */}
      <td>
        <select
          value={data.unidad || ''}
          onChange={(e) => onChange({ unidad: e.target.value })}
        >
          <option value="" disabled>Seleccione…</option>
          {unidades.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </td>

      {/* % Autor/Inventor */}
      <td className="pct-cell">
        <input
          type="number"
          min={1}
          max={100}
          inputMode="numeric"
          value={data.pctAutor}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || (/^\d+$/.test(v) && +v >= 1 && +v <= 100)) onChange({ pctAutor: v });
          }}
        />
      </td>

      {/* % Unidad/Centro */}
      <td className="pct-cell">
        <input
          type="number"
          min={1}
          max={100}
          inputMode="numeric"
          value={data.pctUnidad}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || (/^\d+$/.test(v) && +v >= 1 && +v <= 100)) onChange({ pctUnidad: v });
          }}
        />
      </td>

      {/* Eliminar */}
      <td className="acciones-cell">
        <button type="button" className="btn-icon" onClick={onDelete} title="Eliminar fila">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default AutorInventorRow;
