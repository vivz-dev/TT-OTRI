import React, { useEffect, useRef, useState } from 'react';
import './Cotitularidad.css';
import { searchUsersByEmail } from '../../../services/espolUsers'; // ajusta la ruta si difiere

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

/** Intenta construir nombre completo desde el item del servicio */
function buildFullNameFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return '';

  // Posibles campos según backends típicos
  const nombres =
    raw.nombres || raw.Nombres || raw.first_name || raw.firstName || raw.givenName || '';
  const apellidos =
    raw.apellidos || raw.Apellidos || raw.last_name || raw.lastName || raw.surname || '';
  const nombreCompleto =
    raw.nombreCompleto || raw.NombreCompleto || raw.full_name || raw.fullName || raw.displayName || '';

  if (nombreCompleto) return normalizeName(nombreCompleto);
  if (nombres || apellidos) return normalizeName(`${nombres || ''} ${apellidos || ''}`.trim());

  // Fallback: si el servicio solo trae "nombre" o "Nombre"
  const nameOnly = raw.nombre || raw.Nombre || '';
  if (nameOnly) return normalizeName(nameOnly);

  return '';
}

const CorreoESPOLInput = ({ onSelectUsuario }) => {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const debounceRef = useRef(null);
  const lastReqIdRef = useRef(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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

    debounceRef.current = setTimeout(async () => {
      const reqId = ++lastReqIdRef.current;
      setLoading(true);
      try {
        console.log('[CorreoESPOLInput] Query usado para búsqueda:', value);
        const items = await searchUsersByEmail(value, MAX_RESULTS);

        if (reqId !== lastReqIdRef.current) return;

        console.log('[CorreoESPOLInput] Raw service items:', items);

        const mapped = (Array.isArray(items) ? items : [])
          .map((it) => {
            const email = extractEmailFromItem(it);
            const username = toUsername(email);
            const nombre = buildFullNameFromRaw(it);
            return { email, username, nombre, raw: it };
          })
          .filter((it) => it.username && it.username.toLowerCase().includes(value))
          .slice(0, MAX_RESULTS);

        console.log('[CorreoESPOLInput] Mapped usernames:', mapped);

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
    }, DEBOUNCE_MS);
  };

  const handleSelect = (user) => {
    setInputValue(user.username);
    setFiltered([]);
    setOpen(false);

    // Emitimos username, email completo y nombre (ya sin teléfono)
    onSelectUsuario?.({
      username: user.username,
      email: user.email || `${user.username}${DOMAIN}`,
      nombre: user.nombre || buildFullNameFromRaw(user.raw) || user.username,
      raw: user.raw,
    });
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Usuario ESPOL"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        style={{ width: '100%' }}
        autoComplete="off"
      />

      {loading && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-option">Buscando…</div>
        </div>
      )}

      {!loading && errorMsg && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-option">{errorMsg}</div>
        </div>
      )}

      {!loading && open && filtered.length > 0 && (
        <div className="autocomplete-dropdown">
          {filtered.map((user, idx) => (
            <div
              key={`${user.email}_${idx}`}
              className="autocomplete-option"
              onClick={() => handleSelect(user)}
              title={user.email}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorreoESPOLInput;
