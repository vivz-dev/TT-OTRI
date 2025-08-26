import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useGetTiposTransferenciaQuery } from "../../../services/tipoTransferenciaApi";
import AdjuntarArchivo from "./AdjuntarArchivo";
import { FileX, FilePlus } from "lucide-react";
import RegisterButton from "../buttons/RegisterButton";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const RegistrarFactura = ({ onChange }) => {
  // Campos generales
  const [fechaFactura, setFechaFactura] = useState("");
  const [valorStr, setValorStr] = useState("");

  // RTK Query: tipos de TT
  const {
    data: tipos = [],
    isLoading,
    isError,
    refetch,
  } = useGetTiposTransferenciaQuery();

  /**
   * tiposState = { [idTipo]: { checked, montoStr, archivos: [{id, selected:{hasFile, fileName, file?}}] } }
   */
  const [tiposState, setTiposState] = useState({});

  // Inicializa estructura cuando llegan los tipos
  useEffect(() => {
    if (!tipos || tipos.length === 0) return;
    setTiposState((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const t of tipos) {
        if (!next[t.id]) {
          next[t.id] = {
            checked: false,
            montoStr: "",
            archivos: [
              { id: makeId(), selected: { hasFile: false, fileName: null } },
            ],
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tipos]);

  // Helpers de dinero
  const parseMoneyStr = useCallback((s) => {
    if (!s || !s.trim()) return null;
    const n = Number(s);
    return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
  }, []);
  const formatMoneyInput = useCallback((raw) => {
    let cleaned = (raw || "").replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    const [ent, dec = ""] = cleaned.split(".");
    const dec2 = dec.slice(0, 2);
    return dec.length ? `${ent}.${dec2}` : ent;
  }, []);

  // Campos generales handlers
  const handleFecha = (e) => setFechaFactura(e.target.value);
  const valorNumber = useMemo(
    () => parseMoneyStr(valorStr),
    [valorStr, parseMoneyStr]
  );
  const onValorChange = (e) => setValorStr(formatMoneyInput(e.target.value));
  const onValorBlur = () => {
    if (valorStr === "") return;
    if (valorNumber !== null) setValorStr(valorNumber.toFixed(2));
  };

  // Handlers por tipo
  const toggleTipo = (idTipo) => {
    setTiposState((prev) => ({
      ...prev,
      [idTipo]: { ...prev[idTipo], checked: !prev[idTipo]?.checked },
    }));
  };
  const handleMontoTipo = (idTipo, raw) => {
    const cleaned = formatMoneyInput(raw);
    setTiposState((prev) => ({
      ...prev,
      [idTipo]: { ...prev[idTipo], montoStr: cleaned },
    }));
  };
  const handleMontoTipoBlur = (idTipo) => {
    setTiposState((prev) => {
      const curr = prev[idTipo];
      if (!curr) return prev;
      const num = parseMoneyStr(curr.montoStr);
      return {
        ...prev,
        [idTipo]: {
          ...curr,
          montoStr: num !== null ? num.toFixed(2) : curr.montoStr,
        },
      };
    });
  };
  const addArchivo = (idTipo) => {
    setTiposState((prev) => {
      const curr = prev[idTipo];
      return {
        ...prev,
        [idTipo]: {
          ...curr,
          archivos: [
            ...curr.archivos,
            { id: makeId(), selected: { hasFile: false, fileName: null } },
          ],
        },
      };
    });
  };
  const removeArchivo = (idTipo, adjId) => {
    setTiposState((prev) => {
      const curr = prev[idTipo];
      const nextArch =
        curr.archivos.length > 1
          ? curr.archivos.filter((a) => a.id !== adjId)
          : curr.archivos;
      return { ...prev, [idTipo]: { ...curr, archivos: nextArch } };
    });
  };

  // Guarda tal cual lo que emite AdjuntarArchivo (para no perder el File real)
  const handleSelectedChange = (idTipo, adjId) => (selPayload) => {
    setTiposState((prev) => {
      const curr = prev[idTipo];
      const nextArch = curr.archivos.map((a) =>
        a.id === adjId ? { ...a, selected: selPayload } : a
      );
      return { ...prev, [idTipo]: { ...curr, archivos: nextArch } };
    });
  };

  // Payload hacia el padre
  const tiposSeleccionadosIds = useMemo(
    () =>
      Object.entries(tiposState)
        .filter(([_, v]) => v.checked)
        .map(([idStr]) => Number(idStr)),
    [tiposState]
  );

  const payload = useMemo(() => {
    const tiposSeleccionados = tiposSeleccionadosIds.map((idTipo) => {
      const v = tiposState[idTipo];
      const monto = parseMoneyStr(v?.montoStr || "");

      // 🔵 Para cada adjunto, conservamos el File real en varias claves (_file, file, rawFile)
      const archivos = (v?.archivos || [])
        .filter((a) => a?.selected?.hasFile)
        .map((a) => {
          const f =
            a?.selected?.file ||
            a?.selected?.rawFile ||
            a?.selected?._file ||
            a?.file ||
            a?.rawFile ||
            null;

          const nombre =
            a?.selected?.fileName ||
            a?.fileName ||
            (f && f.name) ||
            null;

          const tamanio =
            a?.selected?.size ||
            (f && f.size) ||
            a?.size ||
            null;

          return {
            idTipoTransferencia: idTipo, // redundante pero útil
            fileName: nombre,            // compat: lo que ya usabas
            nombre,                      // 🆕 para backend/inspección
            tamanio,                     // 🆕 tamaño numérico
            formato: "pdf",              // 🆕 default como pediste
            // referencias al File real para que el padre pueda extraerlo:
            _file: f,
            file: f,
            rawFile: f,
            selected: a.selected,        // conservamos por compatibilidad
          };
        });

      return {
        idTipoTransferencia: idTipo,
        valorUsd: monto, // número o null
        archivos,
      };
    });

    return {
      fechaFactura: fechaFactura || null,
      valorTotalUsd: valorNumber, // número o null
      tiposSeleccionadosIds,
      tiposSeleccionados,
    };
  }, [
    fechaFactura,
    valorNumber,
    tiposSeleccionadosIds,
    tiposState,
    parseMoneyStr,
  ]);

  useEffect(() => {
    onChange?.(payload);
  }, [payload]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render
  if (isLoading) return <p>Cargando tipos de transferencia…</p>;
  if (isError) {
    return (
      <div>
        <p>Error al cargar tipos de transferencia.</p>
        <button type="button" onClick={() => refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Cabecera de factura */}
      <div className="input-row">
        <label className="input-group">
          Fecha de la factura
          <input
            type="date"
            value={fechaFactura}
            onChange={handleFecha}
            className=""
          />
        </label>

        <label className="input-group">
          Valor total de la factura (USD)
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={valorStr}
            onChange={onValorChange}
            onBlur={onValorBlur}
            className=""
          />
        </label>
      </div>

      {/* Tipos de transferencia */}
      <div className="input-row" style={{ flexDirection: "column", gap: 12 }}>
        {tipos.map((t) => {
          const st = tiposState[t.id] || {
            checked: false,
            montoStr: "",
            archivos: [
              { id: makeId(), selected: { hasFile: false, fileName: null } },
            ],
          };

          return (
            <div
              key={t.id}
              style={{
                padding: 12,
                marginBottom: 12,
              }}
            >
              {/* fila checkbox + input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <label
                  className="input-group"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!st.checked}
                    onChange={() => toggleTipo(t.id)}
                  />
                  <div className="texto-tipoTT" style={{ width: "200px" }}>
                    {t.nombre || t.descripcion || `Tipo #${t.id}`}
                  </div>
                  &nbsp;$
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    disabled={!st.checked}
                    value={st.montoStr}
                    onChange={(e) => handleMontoTipo(t.id, e.target.value)}
                    onBlur={() => handleMontoTipoBlur(t.id)}
                  />
                </label>
              </div>

              {/* Adjuntar archivos (múltiples) — SOLO si está checked */}
              {st.checked && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                    {st.archivos.map((a, i) => (
                      <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => removeArchivo(t.id, a.id)}
                          disabled={st.archivos.length === 1}
                          title={
                            st.archivos.length === 1
                              ? "Debe haber al menos uno"
                              : "Quitar"
                          }
                          className="btn-delete-top eliminar-factura"
                        >
                          <FileX />
                        </button>

                        <AdjuntarArchivo
                          descripcion={`Adjunta PDF para "${
                            t.nombre || t.descripcion || `Tipo #${t.id}`
                          }"`}
                          onSelectedChange={handleSelectedChange(t.id, a.id)}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addArchivo(t.id)}
                    title="Añadir otro archivo"
                    className="btn-delete-top eliminar-factura"
                    style={{ marginTop: 8 }}
                  >
                    <FilePlus />
                    Añadir archivo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RegistrarFactura;
