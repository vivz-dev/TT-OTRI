import React, { useState, useEffect, useMemo } from "react";
import { FilePlus, FileX } from "lucide-react";
import * as Components from "../../layouts/components/index";
import "./TipoProteccion.css";

const ID_NO_APLICA = 8;

function extractFilesFromInput(inputLike) {
  if (!inputLike) return [];
  if (inputLike?.target?.files) return Array.from(inputLike.target.files);
  if (typeof FileList !== "undefined" && inputLike instanceof FileList) return Array.from(inputLike);
  if (Array.isArray(inputLike)) return inputLike.filter((x) => typeof File !== "undefined" && x instanceof File);
  if (typeof File !== "undefined" && inputLike instanceof File) return [inputLike];
  if (inputLike?.file && (typeof File === "undefined" || inputLike.file instanceof File)) return [inputLike.file];
  return [];
}

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const TipoProteccion = ({
  label,
  index,
  checked,
  disabled,
  onChange,
  onArchivoChange,
  onFechaChange,
  fechaConcesion: fechaProp, // compat antigua
  idTecnologia,
  idTipoProteccion,
  onProteccionChange,
}) => {
  const [archivos, setArchivos] = useState([]);

  // ✅ dos checks internos
  const [chkSolicitud, setChkSolicitud] = useState(true);  // obligatorio y siempre true
  const [chkConcesion, setChkConcesion] = useState(false); // opcional

  const [fechaSolicitud, setFechaSolicitud] = useState("");
  const [fechaConcesion, setFechaConcesion] = useState("");

  const tipoId = useMemo(
    () => (typeof idTipoProteccion === "number" ? idTipoProteccion : index),
    [idTipoProteccion, index]
  );

  const buildProteccionPayload = () => ({
    idTecnologia: typeof idTecnologia === "number" ? idTecnologia : null,
    idTipoProteccion: tipoId,
    solicitud: true, // 👈 siempre true por requerimiento
    concesion: !!chkConcesion,
    fechaSolicitud: fechaSolicitud || null,
    fechaConcesion: chkConcesion && fechaConcesion ? fechaConcesion : null,
    fechaCreacion: todayISO(),
  });

  const notifyParentProtection = (reason = "change") => {
    const payload = buildProteccionPayload();
    onProteccionChange?.(payload);
    console.log(`[TipoProteccion:${tipoId}] payload (${reason}) =>`, payload, {
      archivos: (archivos || []).map((a, i) => ({ i, name: a?.file?.name ?? null })),
      label, checked,
    });
  };

  // Rehidratar compat (prop antes representaba una única fecha)
  useEffect(() => {
    if (fechaProp && fechaProp !== fechaSolicitud) {
      setFechaSolicitud(fechaProp);
      if (archivos.length > 0) {
        const updated = archivos.map((a) => ({ ...a, fecha: fechaProp }));
        setArchivos(updated);
        onArchivoChange?.(updated);
      }
      onFechaChange?.(fechaProp);
      notifyParentProtection("prop:fechaSolicitud");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaProp]);

  useEffect(() => {
    if (!checked) {
      if (archivos.length > 0 || fechaSolicitud || fechaConcesion || chkConcesion) {
        setArchivos([]);
        setFechaSolicitud("");
        setFechaConcesion("");
        setChkSolicitud(true);
        setChkConcesion(false);
        onArchivoChange?.([]);
        onFechaChange?.("");
      }
      notifyParentProtection("uncheck");
      return;
    }

    if (checked && index !== ID_NO_APLICA && archivos.length === 0) {
      const inicial = [{ file: null, fecha: "" }];
      setArchivos(inicial);
      setChkSolicitud(true);
      setChkConcesion(false);
      setFechaSolicitud("");
      setFechaConcesion("");
      onArchivoChange?.(inicial);
      onFechaChange?.("");
      notifyParentProtection("check");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const syncAndNotify = (nuevoArchivos, fechaParaArchivos = fechaSolicitud) => {
    const conFecha = (nuevoArchivos || []).map((a) => {
      if (a instanceof File) return { file: a, fecha: fechaParaArchivos || "" };
      if (a?.file && (typeof File === "undefined" || a.file instanceof File)) return { file: a.file, fecha: fechaParaArchivos || "" };
      return { ...a, fecha: fechaParaArchivos || "" };
    });
    setArchivos(conFecha);
    onArchivoChange?.(conFecha);
  };

  const setFileAtIndex = (idx, fileLike) => {
    const files = extractFilesFromInput(fileLike);
    const first = files[0] ?? null;
    const updated = archivos.map((item, i) => (i === idx ? { ...(item || {}), file: first } : item));
    syncAndNotify(updated);
    console.log(`[Tipo ${tipoId}] File set =>`, { idx, hasFile: !!first, name: first?.name ?? null, totalSlots: updated.length });
    notifyParentProtection("change:file");
  };

  const handleChangeBridge = (value, idx) => setFileAtIndex(idx, value);

  // Fechas
  const handleFechaSolicitudChange = (fecha) => {
    setFechaSolicitud(fecha);
    const updated = archivos.map((item) => ({ ...item, fecha }));
    setArchivos(updated);
    onArchivoChange?.(updated);
    onFechaChange?.(fecha); // compat
    console.log(`[Tipo ${tipoId}] FechaSolicitud set =>`, fecha);
    notifyParentProtection("change:fechaSolicitud");
  };

  const handleFechaConcesionChange = (fecha) => {
    setFechaConcesion(fecha);
    console.log(`[Tipo ${tipoId}] FechaConcesion set =>`, fecha);
    notifyParentProtection("change:fechaConcesion");
  };

  // Checks
  const toggleSolicitud = (val) => {
    if (!val) {
      console.warn(`[Tipo ${tipoId}] 'Solicitud' es obligatorio. Ignorado uncheck.`);
      setChkSolicitud(true);
      notifyParentProtection("force:chkSolicitud");
      return;
    }
    setChkSolicitud(true);
    notifyParentProtection("change:chkSolicitud");
  };

  const toggleConcesion = (val) => {
    setChkConcesion(!!val);
    notifyParentProtection("change:chkConcesion");
  };

  const handleAddArchivo = () => {
    const updated = [...archivos, { file: null, fecha: fechaSolicitud || "" }];
    syncAndNotify(updated);
    console.log(`[Tipo ${tipoId}] Añadir slot archivo. Total: ${updated.length}`);
    notifyParentProtection("change:addArchivo");
  };

  const handleRemoveArchivo = (idx) => {
    const updated = archivos.filter((_, i) => i !== idx);
    syncAndNotify(updated);
    console.log(`[Tipo ${tipoId}] Quitar slot archivo idx=${idx}. Total: ${updated.length}`);
    notifyParentProtection("change:removeArchivo");
  };

  return (
    <div className="tipo-proteccion-wrapper">
      <label className="tipo-proteccion-checkbox">
        <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>

      {checked && index !== ID_NO_APLICA && (
        <div className="form-card proteccion-container">
          {/* SOLICITUD (obligatorio) */}
          <div className="input-row">
            <label className="input-group">
              <div className="checkbox-rounded">
                <input type="checkbox" checked={chkSolicitud} onChange={(e) => toggleSolicitud(e.target.checked)} />
                Solicitud ante el ente rector de PI
              </div>
              <input type="date" value={fechaSolicitud || ""} onChange={(e) => handleFechaSolicitudChange(e.target.value)} required />
            </label>

            <label className="input-group">
              <div className="checkbox-rounded">
                <input type="checkbox" checked={chkConcesion} onChange={(e) => toggleConcesion(e.target.checked)} />
                Concesión
              </div>
              <input type="date" value={fechaConcesion || ""} onChange={(e) => handleFechaConcesionChange(e.target.value)} disabled={!chkConcesion} />
            </label>
          </div>

          <div className="archivos-container">
            {archivos.map((item, idx) => (
              <div key={idx} className="archivo-item">
                <Components.AdjuntarArchivo
                  tipoEntidad="PI"
                  descripcion="Documento correspondiente a este tipo de protección."
                  file={item.file}
                  onChange={(v) => handleChangeBridge(v, idx)}
                  onFileChange={(v) => handleChangeBridge(v, idx)}
                  onSelectedChange={(v) => handleChangeBridge(v, idx)}
                />
                <button className="btn-remove-archivo" onClick={() => handleRemoveArchivo(idx)} disabled={archivos.length === 1} title="Eliminar archivo">
                  <FileX />
                </button>
              </div>
            ))}
            <button type="button" className="btn-add-archivo" onClick={handleAddArchivo}>
              <FilePlus size={16} />
              Añadir archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipoProteccion;
