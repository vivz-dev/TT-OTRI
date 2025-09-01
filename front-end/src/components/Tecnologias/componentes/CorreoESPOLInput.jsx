import React, { useEffect, useRef, useState } from 'react';
import './Cotitularidad.css';
import { searchUsersByEmail } from '../../../services/espolUsers';

const DOMAIN = '@espol.edu.ec';
const MAX_RESULTS = 5;
const DEBOUNCE_MS = 250;

function extractEmailFromItem(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.email || item.correo || item.Email || item.Correo || item.mail || '';
}

function toUsername(email) {
  if (typeof email !== 'string') return '';
  return email.replace(/@espol\.edu\.ec$/i, '');
}

function normalizeName(str = '') {
  const s = String(str).trim();
  if (!s) return '';
  return s
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildFullNameFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return '';
  const nombres = raw.nombres || raw.Nombres || raw.first_name || raw.firstName || raw.givenName || '';
  const apellidos = raw.apellidos || raw.Apellidos || raw.last_name || raw.lastName || raw.surname || '';
  const nombreCompleto = raw.nombreCompleto || raw.NombreCompleto || raw.full_name || raw.fullName || raw.displayName || '';
  if (nombreCompleto) return normalizeName(nombreCompleto);
  if (nombres || apellidos) return normalizeName(`${nombres || ''} ${apellidos || ''}`.trim());
  const nameOnly = raw.nombre || raw.Nombre || '';
  if (nameOnly) return normalizeName(nameOnly);
  return '';
}

/**
 * Props:
 * - onSelectUsuario({ username, email, nombre, raw })
 * - className (para el <input>)
 * - menuClassName (para el contenedor del dropdown)
 */
const CorreoESPOLInput = ({ onSelectUsuario, className = '', menuClassName = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef(null);
  const lastReqIdRef = useRef(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const runSearch = (value) => {
    const reqId = ++lastReqIdRef.current;
    setLoading(true);
    setErrorMsg('');
    setActiveIndex(-1);

    (async () => {
      try {
        const items = await searchUsersByEmail(value, MAX_RESULTS);
        if (reqId !== lastReqIdRef.current) return;

        const mapped = (Array.isArray(items) ? items : [])
          .map((it) => {
            const email = extractEmailFromItem(it);
            const username = email;
            const nombre = buildFullNameFromRaw(it);
            return { email: email || (username ? `${username}${DOMAIN}` : ''), username, nombre, raw: it };
          })
          .filter((it) => it.username && it.username.toLowerCase().includes(value))
          .slice(0, MAX_RESULTS);

        setFiltered(mapped);
        setOpen(mapped.length > 0);
      } catch (err) {
        if (reqId !== lastReqIdRef.current) return;
        console.error('[CorreoESPOLInput] Error buscando usuarios:', err);
        setErrorMsg('No se pudo obtener sugerencias.');
        setFiltered([]);
        setOpen(false);
      } finally {
        if (reqId === lastReqIdRef.current) setLoading(false);
      }
    })();
  };

  const handleChange = (e) => {
    const value = (e.target.value || '').toLowerCase().trim();
    setInputValue(value);
    setErrorMsg('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value) {
      setFiltered([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  };

  const handleSelect = (user) => {
    setInputValue(user.username);
    setFiltered([]);
    setOpen(false);
    setActiveIndex(-1);

    onSelectUsuario?.({
      username: user.username,
      email: user.email || `${user.username}${DOMAIN}`,
      nombre: user.nombre || buildFullNameFromRaw(user.raw) || user.username,
      raw: user.raw,
    });
  };

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="autocomplete-root">
      <input
        ref={inputRef}
        type="text"
        placeholder="usuario@espol.edu.ec"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={`cotitularidad-input-height cotitular-textarea ${className || ''}`}
      />

      {(loading || errorMsg || (open && filtered.length > 0)) && (
        <div
          className={`autocomplete-dropdown ${menuClassName || ''}`}
          role="listbox"
          aria-expanded={open}
        >
          {loading && <div className="autocomplete-option muted">Buscando…</div>}

          {!loading && errorMsg && (
            <div className="autocomplete-option error">{errorMsg}</div>
          )}

          {!loading && open && filtered.length > 0 && (
            <>
              {filtered.map((user, idx) => (
                <div
                  key={`${user.email}_${idx}`}
                  className={`autocomplete-option ${idx === activeIndex ? 'active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(user)}
                  role="option"
                  aria-selected={idx === activeIndex}
                  title={user.email}
                >
                  <div className="opt-main">
                    <span className="opt-email" style={{fontSize:"14", fontStyle:"italic", color:"#787878ff"}}>{user.email}</span>
                  </div>
                  {user.nombre && <div className="opt-name">{user.nombre}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CorreoESPOLInput;
