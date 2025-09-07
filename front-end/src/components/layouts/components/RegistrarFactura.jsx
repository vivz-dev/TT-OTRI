// src/pages/layouts/components/RegistrarFactura.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetTiposTransferenciaTecnoJoinByTTQuery } from "../../../services/tipoTransferenciaTecnoApi";
import AdjuntarArchivo from "./AdjuntarArchivo";
import { FileX, FilePlus } from "lucide-react";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function parseIdTT(idTT) {
  if (idTT == null) return NaN;
  if (typeof idTT === "object") {
    const cand = Number(idTT.id ?? idTT.Id ?? idTT.ID);
    if (Number.isFinite(cand)) return cand;
  }
  const n = Number(idTT);
  return Number.isFinite(n) ? n : NaN;
}

const RegistrarFactura = ({ idTT, onChange, showErrors = false }) => {
  // Campos generales
  const [fechaFactura, setFechaFactura] = useState("");
  const [valorStr, setValorStr] = useState("");

  const idNum = parseIdTT(idTT);
  const shouldSkip = !Number.isFinite(idNum) || idNum <= 0;

  // JOIN {relacion, tipo} por TT
  const {
    data: joinRows = [],
    isLoading: isLoadingJoin,
    isError: isErrorJoin,
    error: errorJoin,
    refetch: refetchJoin,
  } = useGetTiposTransferenciaTecnoJoinByTTQuery(shouldSkip ? skipToken : idNum);

  // TIPOS (array plano) deduplicado por tipo.id, derivado del JOIN
  const tiposParaRender = useMemo(() => {
    if (!Array.isArray(joinRows)) return [];
    const seen = new Set();
    const out = [];
    for (const row of joinRows) {
      const tipo = row?.tipo;
      if (!tipo) continue;
      const tipoId = tipo.id;
      if (tipoId == null || seen.has(tipoId)) continue;
      seen.add(tipoId);
      out.push(tipo);
    }
    return out;
  }, [joinRows]);

  // console.log("JOIN ROWS ->", joinRows);
  // console.log("TIPOS (desde JOIN) ->", tiposParaRender);

  /**
   * tiposState = { [idTipo]: { checked, montoStr, archivos: [{id, selected:{hasFile, fileName, file?}}] } }
   */
  const [tiposState, setTiposState] = useState({});

  // Inicializa estructura de estado a partir de los TIPOS del JOIN
  useEffect(() => {
    if (tiposParaRender.length === 0) return;
    setTiposState((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const tipo of tiposParaRender) {
        const tipoId = tipo.id;
        if (!next[tipoId]) {
          next[tipoId] = {
            checked: false,
            montoStr: "",
            archivos: [{ id: makeId(), selected: { hasFile: false, fileName: null } }],
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tiposParaRender]);

  /* ========================
   * Helpers de dinero (strict)
   * ======================== */
  const parseMoneyFlexible = useCallback((raw) => {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;

    const clean = s.replace(/[^\d.,]/g, "");
    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");

    let normalized = clean;
    if (lastComma !== -1 && lastDot !== -1) {
      const decimalIsComma = lastComma > lastDot;
      normalized = decimalIsComma ? clean.replace(/\./g, "").replace(",", ".") : clean.replace(/,/g, "");
    } else if (lastComma !== -1) {
      normalized = clean.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = clean;
    }

    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }, []);

  // Campos generales handlers
  const handleFecha = (e) => setFechaFactura(e.target.value);
  const onValorChange = (e) => setValorStr((e.target.value || "").replace(/[^\d.,]/g, ""));
  const onValorBlur = () => {
    if (!valorStr?.trim()) return;
    const n = parseMoneyFlexible(valorStr);
    if (n != null) setValorStr(n.toFixed(2));
  };
  const valorNumber = useMemo(() => {
    const n = parseMoneyFlexible(valorStr);
    return n != null ? Number(n.toFixed(2)) : null;
  }, [valorStr, parseMoneyFlexible]);

  // Handlers por tipo (clave = tipoId)
  const toggleTipo = (tipoId) => {
    setTiposState((prev) => ({ ...prev, [tipoId]: { ...prev[tipoId], checked: !prev[tipoId]?.checked } }));
  };

  const addArchivo = (tipoId) => {
    setTiposState((prev) => {
      const curr = prev[tipoId];
      return {
        ...prev,
        [tipoId]: {
          ...curr,
          archivos: [...curr.archivos, { id: makeId(), selected: { hasFile: false, fileName: null } }],
        },
      };
    });
  };

  const removeArchivo = (tipoId, adjId) => {
    setTiposState((prev) => {
      const curr = prev[tipoId];
      const nextArch = curr.archivos.length > 1 ? curr.archivos.filter((a) => a.id !== adjId) : curr.archivos;
      return { ...prev, [tipoId]: { ...curr, archivos: nextArch } };
    });
  };

  const handleSelectedChange = (tipoId, adjId) => (selPayload) => {
    setTiposState((prev) => {
      const curr = prev[tipoId];
      const nextArch = curr.archivos.map((a) => (a.id === adjId ? { ...a, selected: selPayload } : a));
      return { ...prev, [tipoId]: { ...curr, archivos: nextArch } };
    });
  };

  // Payload hacia el padre
  const tiposSeleccionadosIds = useMemo(
    () => Object.entries(tiposState).filter(([_, v]) => v.checked).map(([idStr]) => Number(idStr)),
    [tiposState]
  );

  const payload = useMemo(() => {
    const tiposSeleccionados = tiposSeleccionadosIds.map((tipoId) => {
      const v = tiposState[tipoId];
      const archivos = (v?.archivos || [])
        .filter((a) => a?.selected?.hasFile)
        .map((a) => {
          const f =
            a?.selected?.file || a?.selected?.rawFile || a?.selected?._file || a?.file || a?.rawFile || null;
          const nombre = a?.selected?.fileName || a?.fileName || (f && f.name) || null;
          const tamanio = a?.selected?.size || (f && f.size) || a?.size || null;

          return { idTipoTransferencia: tipoId, fileName: nombre, nombre, tamanio, formato: "pdf", _file: f, file: f, rawFile: f, selected: a.selected };
        });

      return { idTipoTransferencia: tipoId, archivos };
    });

    return {
      idTT: Number.isFinite(idNum) ? idNum : null,
      fechaFactura: fechaFactura || null,
      valorTotalUsd: valorNumber,
      tiposSeleccionadosIds,
      tiposSeleccionados,
    };
  }, [idNum, fechaFactura, valorNumber, tiposSeleccionadosIds, tiposState]);

  useEffect(() => {
    onChange?.(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  // VALIDACIONES (no son hooks)
  const fechaOk = !!fechaFactura;
  const valorFormatoOk = !!valorStr && /^\d+(\.\d{1,2})?$/.test(valorStr);
  const valorOk = valorNumber !== null && valorNumber > 0 && valorFormatoOk;
  const archivosOk = useMemo(
    () =>
      Object.values(tiposState).some(
        (t) => t?.checked && Array.isArray(t?.archivos) && t.archivos.some((a) => a?.selected?.hasFile)
      ),
    [tiposState]
  );

  const faltantes = [];
  if (!fechaOk) faltantes.push("fecha");
  if (!valorOk) faltantes.push("valor");
  if (!archivosOk) faltantes.push("al menos un archivo");

  const showBorderError = showErrors && faltantes.length > 0;

  // ⬇️ Returns condicionales *después* de todos los hooks
  if (isLoadingJoin) return <p>Cargando tipos asociados…</p>;
  if (isErrorJoin) {
    return (
      <div>
        <p>Error al cargar tipos asociados.</p>
        <pre style={{ fontSize: 12, color: "#ef4444" }}>{JSON.stringify(errorJoin, null, 2)}</pre>
        <button type="button" onClick={() => refetchJoin()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div
      style={{
        border: showBorderError ? "1px solid #ef4444" : "1px solid transparent",
        borderRadius: 12,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      {/* Cabecera de factura */}
      <div className="input-row">
        <label className="input-group">
          Fecha
          <input type="date" value={fechaFactura} onChange={handleFecha} />
        </label>

      <label className="input-group">
          Valor $(USD)
          <input
            type="text"
            inputMode="decimal"
            placeholder="$ 0.00"
            value={valorStr}
            onChange={onValorChange}
            onBlur={onValorBlur}
          />
        </label>
      </div>

      {/* Tipos de transferencia (derivados del JOIN) */}
      <div className="input-row" style={{ flexDirection: "column", gap: 12 }}>
        {tiposParaRender.map((tipo) => {
          const tipoId = tipo.id;
          const st = tiposState[tipoId] || {
            checked: false,
            montoStr: "",
            archivos: [{ id: makeId(), selected: { hasFile: false, fileName: null } }],
          };

          return (
            <div key={tipoId} style={{ padding: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label className="input-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={!!st.checked} onChange={() => toggleTipo(tipoId)} />
                  <div className="texto-tipoTT" style={{ width: "200px" }}>
                    Pago por {tipo.nombre || tipo.descripcion || `Tipo #${tipoId}`}
                  </div>
                </label>
              </div>

              {st.checked && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                    {st.archivos.map((a) => (
                      <div key={a.id} style={{ display: "flex", gap: 8 }}>
                        <AdjuntarArchivo
                          descripcion={`Sustento de pago para "${tipo.nombre || tipo.descripcion || `Tipo #${tipoId}`}"`}
                          onSelectedChange={handleSelectedChange(tipoId, a.id)}
                        />
                        <button
                          onClick={() => removeArchivo(tipoId, a.id)}
                          disabled={st.archivos.length === 1}
                          title={"Eliminar Archivo"}
                          className="btn-delete-top"
                          type="button"
                        >
                          <FileX />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => addArchivo(tipoId)} title="Añadir otro archivo" className="btn-add-archivo" type="button">
                    <FilePlus size={16} />
                    Añadir archivo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showErrors && (
        <p style={{ color: "#b91c1c", marginTop: 8 }}>
          {faltantes.length > 0 ? `Falta: ${faltantes.join(", ")}.` : null}
        </p>
      )}
    </div>
  );
};

export default RegistrarFactura;
