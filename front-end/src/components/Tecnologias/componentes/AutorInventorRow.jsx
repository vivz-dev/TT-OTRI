// src/pages/Acuerdos/AutorInventorRow.jsx
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import CorreoESPOLInput from "./CorreoESPOLInput";
import * as Components from "../../layouts/components"; // si no usas, borra
import { Trash2, ChevronDown, Search } from "lucide-react";

// Normaliza opciones a { value, label }
function normalizeUnidades(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((u, idx) => {
      if (u == null) return null;
      if (typeof u === "string") {
        return { value: String(idx), label: u, __raw: { id: null, nombre: u } };
      }
      const id = u.id ?? u.Id ?? u.idUnidad ?? u.IdUnidad ?? null;
      const nombre =
        u.nombre ??
        u.Nombre ??
        u.nombreUnidad ??
        u.NombreUnidad ??
        u.titulo ??
        u.Titulo ??
        "";
      if (!nombre) return null;
      return {
        value: String(id ?? idx),
        label: String(nombre),
        __raw: { id, nombre },
      };
    })
    .filter(Boolean);
}

/** Dropdown con buscador interno (filtro local) */
function SearchableDropdown({
  opciones = [],
  selectedValue = "",
  onSelect, // recibe una opción { value, label, __raw }
  placeholder = "Seleccione unidad…",
  noResultsText = "Sin resultados",
  inputPlaceholder = "Buscar unidad…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // opción actualmente seleccionada (para mostrar en el botón)
  const selectedOption = useMemo(() => {
    if (!selectedValue) return null;
    return opciones.find((o) => o.value === selectedValue) || null;
  }, [opciones, selectedValue]);

  // filtrar por query (insensible a mayúsculas, acentos simples)
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return opciones;
    return opciones.filter((o) => norm(o.label).includes(q));
  }, [opciones, query]);

  // cerrar si se hace click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // enfoque al input cuando se abre
  useEffect(() => {
    if (open && inputRef.current) {
      // pequeño delay para asegurar render
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleSelect = useCallback(
    (opt) => {
      onSelect?.(opt);
      setOpen(false);
      setQuery("");
    },
    [onSelect]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={`searchable-select ${className}`} ref={wrapperRef}>
      <button
        type="button"
        className="searchable-select__button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={selectedOption?.label || placeholder}
      >
        <span className={`truncate ${selectedOption ? "" : "placeholder"}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={16} aria-hidden />
      </button>

      {open && (
        <div className="searchable-select__popover" onKeyDown={handleKeyDown}>
          <div className="searchable-select__search">
            <Search size={14} aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={inputPlaceholder}
              className="searchable-select__input"
            />
          </div>
          <div className="searchable-select__list" role="listbox" tabIndex={-1}>
            {filtered.length === 0 ? (
              <div className="searchable-select__empty">{noResultsText}</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === selectedValue}
                  className={`searchable-select__option ${
                    opt.value === selectedValue ? "is-selected" : ""
                  }`}
                  onClick={() => handleSelect(opt)}
                  title={opt.label}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* estilos mínimos (scoped por clase raíz) */}
      <style>{`
        .searchable-select { position: relative; width: 100%; }
        .searchable-select__button {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          gap: 8px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px;
          background: #fff; cursor: pointer; font-size: 14px; line-height: 1.2;
        }
        .searchable-select__button:hover { border-color: #9ca3af; }
        .searchable-select__button .placeholder { color: #9ca3af; }
        .truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

        .searchable-select__popover {
          position: absolute; z-index: 20; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          width: 300px;
        }
        .searchable-select__search {
          display: flex; align-items: center; gap: 6px; padding: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        .searchable-select__input {
          flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 14px;
        }
        .searchable-select__input:focus { outline: none; border-color: #cbd5e1; }

        .searchable-select__list {
          max-height: 240px; overflow: auto; padding: 4px;
        }
        .searchable-select__option {
          width: 100%; text-align: left; padding: 8px 10px; border-radius: 8px;
          border: 1px solid transparent; background: transparent; cursor: pointer; font-size: 14px;
        }
        .searchable-select__option:hover { background: #f9fafb; }
        .searchable-select__option.is-selected {
          background: #eef2ff; border-color: #c7d2fe;
        }
        .searchable-select__empty {
          padding: 12px; color: #9ca3af; font-size: 14px; text-align: center;
        }
      `}</style>
    </div>
  );
}

const AutorInventorRow = ({
  index,
  data,
  unidades = [],
  onChange,
  onDelete,
  onSelectUsuario, // viene del padre para autocompletar por correo @espol
}) => {
  const opciones = useMemo(() => normalizeUnidades(unidades), [unidades]);

  // Determinar el valor seleccionado
  const selectedValue = useMemo(() => {
    // si tenemos idUnidad, buscamos por id
    if (data?.idUnidad != null) {
      const found = opciones.find(
        (o) => String(o.__raw.id) === String(data.idUnidad)
      );
      if (found) return found.value;
    }
    // si no, por nombre
    if (data?.unidad) {
      const target = String(data.unidad).trim().toLowerCase();
      const found = opciones.find(
        (o) => o.label.trim().toLowerCase() === target
      );
      if (found) return found.value;
    }
    return ""; // sin selección
  }, [data?.idUnidad, data?.unidad, opciones]);

  const handleUnidadSelect = (opt) => {
    if (!opt) {
      onChange?.({ idUnidad: null, unidad: "" });
      return;
    }
    const id = opt.__raw.id;
    const nombre = opt.__raw.nombre;
    // Emitimos ambos para que el padre mantenga consistencia (igual que antes)
    onChange?.({ idUnidad: id, unidad: nombre });
  };

  const handlePctAutor = (e) => {
    onChange?.({ pctAutor: e.target.value });
  };
  const handlePctUnidad = (e) => {
    onChange?.({ pctUnidad: e.target.value });
  };

  const handleCorreoSelect = (usuario) => {
    onSelectUsuario?.(usuario, index);
  };

  const handleIdentificacionChange = (e) => {
    onChange?.({ identificacion: e.target.value });
  };


  return (
    <tr>
      {/* Correo institucional */}
      <td className="cell-correo cotitular-box">
        <div className="correo-institucional-wrapper">
          <CorreoESPOLInput
            value={data?.correo || ""}
            onSelectUsuario={handleCorreoSelect}
            className="correo-user-input cotitular-box"
            menuClassName="correo-menu"
            placeholder="usuario@espol.edu.ec"
          />
        </div>
      </td>

      {/* Nº de identificación */}

      <td className="cotitular-box max-width-td">
        <Components.GrowTextArea
          id={`rep-id-${index}`}
          placeholder="Identificación"
          value={data?.identificacion || ""}
          onChange={handleIdentificacionChange}
          maxLength={10}
          rows={1}
          kind="phone"
          className="cotitularidad-input-height cotitular-box"
        />
      </td>
      {/* <td>
        <input
          type="text"
          className="input"
          value={data?.identificacion || ''}
          onChange={handleIdentificacionChange}
          placeholder="Cédula / DNI"
        />
      </td> */}

      {/* Nombre completo */}
      <td className="max-width-td cotitular-box">{data?.nombreCompleto || ""}</td>

      {/* Unidad / Centro (dropdown con buscador interno) */}
      <td className="right-border max-width-td-centro cotitular-box">
        <SearchableDropdown
          className="select"
          opciones={opciones}
          selectedValue={selectedValue}
          onSelect={handleUnidadSelect}
          placeholder="Seleccione unidad…"
          inputPlaceholder="Buscar unidad…"
        />
      </td>

      {/* % Autor/Inventor */}
      <td className="max-width-td cotitular-box">
        <input
          type="number"
          inputMode="numeric"
          className="input pct"
          value={data?.pctAutor ?? ""}
          onChange={handlePctAutor}
          min={0}
          max={100}
          placeholder="%"
        />
      </td>

      {/* % Unidad/Centro */}
      <td className="max-width-td cotitular-box">
        <input
          type="number"
          inputMode="numeric"
          className="input pct"
          value={data?.pctUnidad ?? ""}
          onChange={handlePctUnidad}
          min={0}
          max={100}
          placeholder="%"
        />
      </td>

      {/* Acciones */}
      <td className="cell-actions">
        <button
          type="button"
          className="btn-icon danger"
          onClick={onDelete}
          title="Eliminar fila"
          aria-label="Eliminar fila"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default AutorInventorRow;
