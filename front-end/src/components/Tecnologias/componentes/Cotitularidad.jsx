// src/pages/Cotitularidad/Cotitularidad.jsx
import React, { useState, forwardRef, useImperativeHandle } from "react";
import "./Cotitularidad.css";
import { AdjuntarArchivo } from "../../layouts/components";
import ESPOLCotitularRow from "./ESPOLCotitularRow";
import GeneralCotitularRow from "./GeneralCotitularRow";
import * as Buttons from "../../layouts/buttons/buttons_index";
import { getIdPersonaFromAppJwt } from "../../../services/api";

const NUEVA_FILA = {
  institucion: "",
  ruc: "",
  correo: "",
  representante: { nombre: "", username: "", porcentaje: "", correo: "", telefono: "", idPersona: null },
  esEspol: false, // por defecto, una nueva fila es "general"
};

const Cotitularidad = forwardRef((_, ref) => {
  const [filas, setFilas] = useState([
    {
      institucion: "Escuela Superior Politécnica del Litoral",
      ruc: "0967486931",
      correo: "otri@espol.edu.ec",
      representante: { nombre: "", username: "", porcentaje: "", correo: "", telefono: "", idPersona: null },
      esEspol: true, // fila inicial: ESPOL
    },
  ]);

  const [errorPorcentaje, setErrorPorcentaje] = useState(false);
  const [archivoAcuerdo, setArchivoAcuerdo] = useState(null);

  const handleArchivoChange = (fileOrFiles) => {
    const file = Array.isArray(fileOrFiles)
      ? fileOrFiles[0]
      : fileOrFiles?.target?.files?.[0] ?? fileOrFiles ?? null;
    setArchivoAcuerdo(file || null);
  };

  const updateFila = (idx, path, value) =>
    setFilas((prev) =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const clone = structuredClone(f);
        const keys = path.split(".");
        let ref = clone;
        keys.slice(0, -1).forEach((k) => (ref = ref[k]));
        ref[keys.at(-1)] = value;
        return clone;
      })
    );

  const validarTotal = (lista) => {
    const sum = lista.reduce((acc, f) => acc + Number(f.representante.porcentaje || 0), 0);
    setErrorPorcentaje(sum !== 100);
    return sum === 100;
  };

  const getIdFromRaw = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    return (
      raw.id ?? raw.Id ?? raw.idPersona ?? raw.IdPersona ?? raw.personaId ?? raw.PersonaId ?? null
    );
  };

  // ⬇️ ESPOL: al seleccionar un usuario institucional, fuerza esEspol = true
  const handleSelectUsuarioESPOL = (representante, idx) => {
    updateFila(idx, "representante.nombre", representante.nombre);
    updateFila(idx, "representante.username", representante.username);
    updateFila(idx, "representante.correo", `${representante.username}@espol.edu.ec`);
    updateFila(idx, "representante.idPersona", getIdFromRaw(representante.raw));
    updateFila(idx, "esEspol", true); // <-- clave
  };

  const handleTelefonoChange = (idx, value) => {
    updateFila(idx, "representante.telefono", value);
  };

  const handlePorcentajeChange = (idx, value) => {
    if (value === "" || /^(100|[1-9]?\d)$/.test(value)) {
      updateFila(idx, "representante.porcentaje", value);
      validarTotal(
        filas.map((f, i) =>
          i === idx
            ? { ...f, representante: { ...f.representante, porcentaje: value } }
            : f
        )
      );
    }
  };

  const handleAddFila = () => {
    const nuevaLista = [...filas, structuredClone(NUEVA_FILA)];
    setFilas(nuevaLista);
    validarTotal(nuevaLista);
  };

  const handleRemoveFila = (idx) => {
    const lista = filas.filter((_, i) => i !== idx);
    setFilas(lista);
    validarTotal(lista);
  };

  const filaCompleta = (f) => {
    const porcOk = f.representante.porcentaje !== "" && Number(f.representante.porcentaje) >= 0;
    if (f.esEspol) return !!f.representante.username && porcOk;
    const reqText = (t) => typeof t === "string" && t.trim().length > 0;
    return (
      reqText(f.institucion) &&
      reqText(f.ruc) &&
      reqText(f.correo) &&
      reqText(f.representante.nombre) &&
      reqText(f.representante.correo) &&
      porcOk
    );
    // Teléfono no se fuerza requerido
  };

  // ⬇️ General: cualquier cambio en los campos generales asegura esEspol = false
  const handleGeneralChange = (idx, path, val) => {
    updateFila(idx, path, val);
    updateFila(idx, "esEspol", false); // <-- clave
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const totalOk = validarTotal(filas);
      const filasOk = filas.every(filaCompleta);
      const archivoOk = !!archivoAcuerdo; // requerido
      return totalOk && filasOk && archivoOk;
    },

    // Payload de cotitulares + archivo de cotitularidad
    getPayload: () => {
      const idPersonaActual = (() => { try { return getIdPersonaFromAppJwt?.() ?? null; } catch { return null; } })();

      const cotitulares = filas.map((f) => {
        const base = {
          perteneceEspol: !!f.esEspol, // <-- ahora confiable
          porcCotitularidad: Number(f.representante.porcentaje || 0),
          nombre: f.representante.nombre || "",
          correo: f.representante.correo || "",
          telefono: f.representante.telefono || "",
        };

        if (f.esEspol) {
          return {
            ...base,
            idCotitularInst: 1, // ESPOL por defecto
            idPersona: f.representante.idPersona ?? null, // desde dropdown de ESPOL
          };
        }

        // General: datos institucionales
        const cotitularInst = {
          nombre: f.institucion || "",
          correo: f.correo || "",
          ruc: f.ruc || "",
        };

        return {
          ...base,
          perteneceEspol: false, // redundante pero explícito
          idPersona: idPersonaActual,    // usuario logueado
          cotitularInst,                 // datos de institución
        };
      });

      const archivoCotitularidad = archivoAcuerdo
        ? {
            nombre: archivoAcuerdo.name || null,
            formato: archivoAcuerdo.type || 'pdf',
            tamano: archivoAcuerdo.size ?? null,
            file: archivoAcuerdo,
          }
        : null;

      return { cotitulares, archivoCotitularidad };
    },
  }));

  const total = filas.reduce((acc, f) => acc + Number(f.representante.porcentaje || 0), 0);
  const totalOk = total === 100;

  return (
    <form className="coti-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-header">
        <h1 className="titulo-principal-form">Cotitularidad</h1>
        <p className="subtitulo-form">
          Complete los datos de las instituciones cotitulares según el acuerdo.
        </p>
      </div>
      <section className="card coti-card">
        <table className="tabla-distribucion">
          <thead>
            <tr>
              <th colSpan={3} className="beneficiarios">Institución cotitular</th>
              <th colSpan={4} className="beneficiarios">Representante cotitular</th>
              <th colSpan={1} className="beneficiarios"></th>
            </tr>
          </thead>

          <tbody>
            <tr className="fila-subtotal-titulo">
              <td>Nombre</td>
              <td>RUC</td>
              <td className="right-border">Correo institucional</td>
              <td>Nombre</td>
              <td>Correo</td>
              <td>Teléfono</td>
              <td>% titularidad</td>
              <td></td>
            </tr>

            {filas.map((fila, idx) =>
              fila.esEspol ? (
                <ESPOLCotitularRow
                  key={idx}
                  fila={fila}
                  index={idx}
                  onSelectUsuario={handleSelectUsuarioESPOL}
                  onPorcentajeChange={handlePorcentajeChange}
                  onTelefonoChange={handleTelefonoChange}
                  onDelete={() => handleRemoveFila(idx)}
                />
              ) : (
                <GeneralCotitularRow
                  key={idx}
                  fila={fila}
                  index={idx}
                  onChange={(path, val) => handleGeneralChange(idx, path, val)} // <-- wrapper que fuerza false
                  onPorcentajeChange={handlePorcentajeChange}
                  onDelete={() => handleRemoveFila(idx)}
                />
              )
            )}
          </tbody>
        </table>

        {errorPorcentaje && <p className="coti-error">El total debe sumar exactamente 100%.</p>}

        <Buttons.RegisterButton onClick={handleAddFila} text={" +  Añadir cotitular"} />
      </section>

      <section className="card attach-card">
        <AdjuntarArchivo descripcion="Acuerdo de cotitularidad." file={archivoAcuerdo} onChange={handleArchivoChange} />
      </section>
    </form>
  );
});

export default Cotitularidad;
