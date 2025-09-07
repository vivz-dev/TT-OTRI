import React, { useState, useRef, useEffect, useMemo } from "react";
import * as Components from "../../layouts/components/index";
import { ModalProvider } from "../../layouts/components/ModalProvider";
import { Search, ChevronDown } from "lucide-react";
import { useGetDistributionsByResolutionQuery } from "../../../services/distribucionesApi";
import { skipToken } from "@reduxjs/toolkit/query";

/* ==============================
   Componente SearchableDropdown (reutilizable)
   ============================== */
function SearchableDropdown({
  opciones = [],
  selectedValue = "",
  onSelect,
  placeholder = "Seleccione una opción…",
  noResultsText = "Sin resultados",
  inputPlaceholder = "Buscar…",
  className = "",
  disabled = false,
  error = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = useMemo(() => {
    if (selectedValue === "" || selectedValue == null) return null;
    return opciones.find((o) => String(o.value) === String(selectedValue)) || null;
  }, [opciones, selectedValue]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return opciones;
    return opciones.filter((o) => o.label?.toLowerCase?.().includes(q));
  }, [opciones, query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const handleSelect = (opt) => {
    const normalized = Number(opt?.value);
    onSelect(Number.isFinite(normalized) ? normalized : opt?.value);
    // Dejamos el dropdown visible para permitir cambios rápidos:
    // setOpen(false);
    setQuery("");
  };

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
        className={`searchable-select__button ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
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
                  aria-selected={String(opt.value) === String(selectedValue)}
                  className={`searchable-select__option ${
                    String(opt.value) === String(selectedValue) ? "is-selected" : ""
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

      <style>{`
        .searchable-select { position: relative; width: 100%; }
        .searchable-select__button {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          gap: 8px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px;
          background: #fff; cursor: pointer; font-size: 14px; line-height: 1.2;
        }
        .searchable-select__button:hover:not(.disabled) { border-color: #9ca3af; }
        .searchable-select__button.error { border-color: #ff4d4f; }
        .searchable-select__button.disabled {
          background-color: #f5f5f5; cursor: not-allowed; opacity: 0.7;
        }
        .searchable-select__button .placeholder { color: #9ca3af; }
        .truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

        .searchable-select__popover {
          position: absolute; z-index: 20; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08); width: 100%;
        }
        .searchable-select__search {
          display: flex; align-items: center; gap: 6px; padding: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        .searchable-select__input {
          flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 14px;
        }
        .searchable-select__input:focus { outline: none; border-color: #cbd5e1; }

        .searchable-select__list { max-height: 240px; overflow: auto; padding: 4px; }
        .searchable-select__option {
          width: 100%; text-align: left; padding: 8px 10px; border-radius: 8px;
          border: 1px solid transparent; background: transparent; cursor: pointer; font-size: 14px;
        }
        .searchable-select__option:hover { background: #f9fafb; }
        .searchable-select__option.is-selected { background: #eef2ff; border-color: #c7d2fe; }
        .searchable-select__empty { padding: 12px; color: #9ca3af; font-size: 14px; text-align: center; }
      `}</style>
    </div>
  );
}

/* ==============================
   Utils locales
   ============================== */
const dinero = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
    : "$0.00";

const pct = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? `${(n * 100).toFixed(0)}%`
    : "0%";

/* ==============================
   Componente principal
   ============================== */
const AsociarResolucionTecnologia = ({
  idResolucion,
  setIdResolucion,
  idTecnologia,
  setIdTecnologia,
  resolucionesOpts,
  techOpts,
  isLoading,
  error,
  isTechLoading,
  techError,
  selectedRes,
  selectedTec,
  errores,
  shakeError,
  // 👇 para propagar idDistribucion al TTForm
  datosAdicionales,
  setDatosAdicionales,
}) => {
  /* ------- Opciones de selects ------- */
  const tecnologiaOpciones = useMemo(
    () => techOpts.map((t) => ({ value: t.id, label: t.label })),
    [techOpts]
  );
  const resolucionOpciones = useMemo(
    () => resolucionesOpts.map((r) => ({ value: r.id, label: r.label })),
    [resolucionesOpts]
  );

  /* ------- Reset de distribución si cambia la resolución ------- */
  useEffect(() => {
    setDatosAdicionales((prev) => {
      if (!prev || prev.idDistribucion == null) return prev || {};
      return { ...prev, idDistribucion: null };
    });
    if (idResolucion) {
      console.log("[DIST] Resolución cambió a:", idResolucion, " -> reset idDistribucion");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idResolucion]);

  /* ------- Query RTK: distribuciones por resolución ------- */
  const distQueryArg =
    idResolucion && Number.isFinite(Number(idResolucion))
      ? Number(idResolucion)
      : skipToken;

  const {
    data: distData = [],
    isLoading: isDistLoading,
    error: distError,
    isFetching: isDistFetching,
  } = useGetDistributionsByResolutionQuery(distQueryArg);

  /* ------- Logs de debug del servicio ------- */
  useEffect(() => {
    if (distQueryArg === skipToken) {
      console.log("[DIST] skipToken activo (sin resolución válida aún).");
      return;
    }
    console.log("[DIST] useGetDistributionsByResolutionQuery() -> arg:", distQueryArg);
    console.log("[DIST] isLoading:", isDistLoading, "| isFetching:", isDistFetching, "| error:", distError);
    if (Array.isArray(distData)) {
      console.log("[DIST] data length:", distData.length);
      console.log("[DIST] sample (first 3):", distData.slice(0, 3));
    } else {
      console.log("[DIST] data (no array):", distData);
    }
  }, [distQueryArg, distData, distError, isDistLoading, isDistFetching]);

  /* ------- Normalizar opciones ------- */
  const distribucionOpciones = useMemo(() => {
    const list = Array.isArray(distData) ? distData : [];
    return list.map((d) => {
      const id = d.id ?? d.Id ?? d.idDistribucion ?? d.IdDistribucion;
      const max = d.MontoMaximo ?? d.montoMaximo ?? 0;
      const min = d.MontoMinimo ?? d.montoMinimo ?? 0;
      const a = d.PorcSubtotalAutores ?? d.porcSubtotalAutores ?? 0;
      const i = d.PorcSubtotalInstitut ?? d.porcSubtotalInstitut ?? 0;
      const label = `Montos: Máx: [${dinero(Number(max))}] — Mín: [${dinero(Number(min))}] — Autores/Inv.: ${pct(Number(a))} / Instituc.: ${pct(Number(i))}`;
      return { value: id, label, __raw: d };
    });
  }, [distData]);

  const selectedDistribucion = useMemo(() => {
    const idSel = datosAdicionales?.idDistribucion ?? null;
    if (idSel == null) return null;
    return distribucionOpciones.find((o) => String(o.value) === String(idSel)) || null;
  }, [datosAdicionales?.idDistribucion, distribucionOpciones]);

  return (
    <ModalProvider>
      <div className="formulario">
        <div className="form-header">
          <h1 className="titulo-principal-form">Asociación de resolución y tecnología</h1>
          <p className="subtitulo-form">
            Selecciona la resolución y la tecnología <em>/know-how</em> relacionadas a esta transferencia.
          </p>
        </div>

        <div className="form-fieldsets">
          {/* ---------- Selección de Tecnología (dropdown SIEMPRE visible) ---------- */}
          <div className={`form-card ${shakeError ? "error shake" : ""}`}>
            <h2 className="form-card-header">Seleccionar Tecnología</h2>
            <div className="input-row">
              <label className="input-group">
                Tecnología
                <SearchableDropdown
                  opciones={tecnologiaOpciones}
                  selectedValue={idTecnologia}
                  onSelect={setIdTecnologia}
                  placeholder={
                    isTechLoading ? "Cargando tecnologías…" : techError ? "Error al cargar" : "Seleccione…"
                  }
                  inputPlaceholder="Buscar tecnología…"
                  disabled={isTechLoading || techError}
                  error={errores.idTecnologia}
                />
                {idTecnologia && selectedTec && (
                  <div className="selected-item-container" style={{ marginTop: 8 }}>
                    <Components.Card
                      key={selectedTec.id}
                      titulo={selectedTec.codigo || selectedTec.titulo}
                      estado={selectedTec.estado}
                      descripcion={selectedTec.descripcion}
                      textoFecha={selectedTec.fecha}
                      textoRegistrado={selectedTec.usuario}
                      completed={selectedTec.completed}
                      cardButtons={["ver-tecnologia"]}
                    />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* ---------- Selección de Resolución (dropdown SIEMPRE visible) ---------- */}
          <div className={`form-card ${shakeError ? "error shake" : ""}`}>
            <h2 className="form-card-header">Seleccionar Resolución</h2>
            <div className="input-row">
              <label className="input-group">
                Resolución
                <SearchableDropdown
                  opciones={resolucionOpciones}
                  selectedValue={idResolucion}
                  onSelect={setIdResolucion}
                  placeholder={isLoading ? "Cargando resoluciones…" : error ? "Error al cargar" : "Seleccione…"}
                  inputPlaceholder="Buscar resolución…"
                  disabled={isLoading || error}
                  error={errores.idResolucion}
                />
                {idResolucion && selectedRes && (
                  <div className="selected-item-container" style={{ marginTop: 8 }}>
                    <Components.Card
                      key={selectedRes.id}
                      titulo={selectedRes.descripcion}
                      estado={selectedRes.estado}
                      descripcion={selectedRes.titulo}
                      textoFecha={selectedRes.fecha}
                      textoRegistrado={selectedRes.usuario}
                      completed={selectedRes.completed}
                      cardButtons={["ver-resolucion"]}
                    />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* ---------- Selección de Distribución (usa servicio por resolución) ---------- */}
          <div className={`form-card ${shakeError ? "error shake" : ""}`}>
            <h2 className="form-card-header">Seleccionar Distribución</h2>
            <div className="input-row">
              <label className="input-group">
                Distribución de la resolución seleccionada
                <SearchableDropdown
                  opciones={distribucionOpciones}
                  selectedValue={datosAdicionales?.idDistribucion ?? ""}
                  onSelect={(val) =>
                    setDatosAdicionales((prev) => ({ ...(prev || {}), idDistribucion: val }))
                  }
                  placeholder={
                    distQueryArg === skipToken
                      ? "Primero selecciona una resolución…"
                      : isDistLoading || isDistFetching
                      ? "Cargando distribuciones…"
                      : distError
                      ? "Error al cargar"
                      : distribucionOpciones.length === 0
                      ? "No hay distribuciones para esta resolución"
                      : "Seleccione…"
                  }
                  inputPlaceholder="Buscar distribución…"
                  disabled={distQueryArg === skipToken || isDistLoading || isDistFetching || !!distError}
                  error={errores.idDistribucion}
                />
                {selectedDistribucion && (
                  <small style={{ marginTop: 6, color: "#6b7280" }}>
                    Seleccionada: {selectedDistribucion.label}
                  </small>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .selected-item-container { display: flex; flex-direction: column; gap: 12px; }
        .btn-cambiar {
          align-self: flex-start; padding: 8px 16px; background-color: #f8f9fa;
          border: 1px solid #dee2e6; border-radius: 6px; color: #495057;
          cursor: pointer; font-size: 14px; transition: all 0.2s ease;
        }
        .btn-cambiar:hover { background-color: #e9ecef; border-color: #ced4da; }
      `}</style>
    </ModalProvider>
  );
};

export default AsociarResolucionTecnologia;
