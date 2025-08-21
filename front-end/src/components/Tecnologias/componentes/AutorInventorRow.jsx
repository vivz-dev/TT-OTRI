import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { searchUsersByEmail } from '../../../services/espolUsers'; // ⬅️ usamos tu servicio real

const AutorInventorRow = ({ index, data, unidades, onChange, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const boxRef = useRef(null);

  // Query = lo que escribe el usuario en el input de correo
  const query = (data.correo || '').toLowerCase().trim();

  // Buscar remoto (debounced) cuando cambie la query
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      if (!query || query.length < 2) {
        if (active) setRemoteUsers([]);
        return;
      }
      try {
        setLoading(true);
        const items = await searchUsersByEmail(query, 5); // ⬅️ máximo 5 coincidencias
        if (!active) return;
        // Normalizar por si el backend trae campos distintos
        const list = Array.isArray(items) ? items : (items?.items || []);
        const mapped = list.map((u, i) => ({
          key: u.correo || u.email || `user-${i}`,
          correo: String(u.correo || u.email || '').trim(),
          username: String(u.username || '').trim(),
          nombreCompleto: String(u.nombreCompleto || u.nombre || '').trim(),
        })).filter(u => u.correo && u.nombreCompleto);
        setRemoteUsers(mapped.slice(0, 5));
      } catch (e) {
        if (active) setRemoteUsers([]);
        // opcional: console.warn('searchUsersByEmail error:', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    const id = setTimeout(run, 200); // debounce 200ms
    return () => {
      active = false;
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  // Sugerencias (si no hay query no mostramos nada para evitar ruido)
  const options = useMemo(() => {
    if (!query) return [];
    return remoteUsers;
  }, [query, remoteUsers]);

  // Elegir usuario → SOLO llena el nombre completo (según pedido)
  // (Dejamos unidad e identificación como están. El correo se queda con lo que escribió el usuario,
  // pero si quieres que tome el del seleccionado, descomenta el patch de correo.)
  const chooseUser = (u) => {
    onChange({
      // correo: u.correo, // <- si quieres forzar el correo al seleccionado, descomenta esto
      nombreCompleto: u.nombreCompleto,
    });
    setOpen(false);
  };

  // Cerrar dropdown si clic fuera
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
          {open && (loading || options.length > 0) && (
            <ul
              id={`correo-list-${index}`}
              className="sug-list"
              role="listbox"
              aria-label="Sugerencias de correo institucional"
            >
              {loading && (
                <li className="loading">Buscando…</li>
              )}
              {!loading && options.map((u, i) => (
                <li
                  key={u.key}
                  role="option"
                  aria-selected={i === cursor}
                  className={i === cursor ? 'active' : ''}
                  onMouseDown={() => chooseUser(u)}  /* evita blur antes del click */
                  title={u.nombreCompleto}
                >
                  <div className="sug-top">{u.correo}</div>
                  <div className="sug-sub">{u.nombreCompleto}</div>
                </li>
              ))}
              {!loading && options.length === 0 && query && (
                <li className="empty">Sin coincidencias</li>
              )}
            </ul>
          )}
        </div>
      </td>

      {/* Identificación (solo lectura) */}
      <td>
        <input type="text" value={data.identificacion} readOnly />
      </td>

      {/* Nombre completo (solo lectura; lo autocompletamos desde la búsqueda) */}
      <td>
        <input type="text" value={data.nombreCompleto} readOnly />
      </td>

      {/* Unidad/Centro (editable, ya no se llena automáticamente) */}
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
