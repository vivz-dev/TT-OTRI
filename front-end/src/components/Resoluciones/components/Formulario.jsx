import React, { useState, forwardRef, useImperativeHandle } from "react";
import "./Formulario.css";
import * as Components from "../../layouts/components";

const Formulario = forwardRef(({ shakeError }, ref) => {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [num3, setNum3] = useState("");
  const [fechaResolucion, setFechaResolucion] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState({
    num1: false,
    num2: false,
    num3: false,
    fechaResolucion: false,
    fechaVigencia: false,
    descripcion: false,
  });

  // 👇 helper local
  const toIsoOrNull = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return new Date(
      Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0)
    ).toISOString();
  };

  useImperativeHandle(ref, () => ({
    validate() {
      const nuevoError = {
        num1: !num1,
        num2: !num2,
        num3: !num3,
        fechaResolucion: !fechaResolucion,
        fechaVigencia: !fechaVigencia,
        descripcion: !descripcion,
      };
      setErrores(nuevoError);

      const esValido = !Object.values(nuevoError).some(Boolean);

      const numero = `${num1}-${num2}-${num3}`;
      const payloadResolucion = {
        Numero: numero.trim(),
        Descripcion: numero.trim(),
        Titulo: (descripcion ?? "").trim(),
        FechaResolucion: toIsoOrNull(fechaResolucion), // ISO o null
        FechaVigencia: toIsoOrNull(fechaVigencia), // ISO o null
        // Estado: 'Vigente', // <- descomenta si tu API lo exige siempre
      };

      return {
        valido: esValido,
        payloadResolucion: esValido ? payloadResolucion : null,
      };
    },

    // 👉 Obtener el mismo payload sin validar
    getPayload() {
      const partes = [num1, num2, num3].filter(Boolean);
      const numero = partes.length ? partes.join("-") : "—";
      return {
        Numero: numero.trim(),
        Titulo: numero.trim(),
        Descripcion: (descripcion ?? "").trim() || "—",
        FechaResolucion: toIsoOrNull(fechaResolucion),
        FechaVigencia: toIsoOrNull(fechaVigencia),
        // Estado: 'Vigente',
      };
    },
  }));

  return (
    <div className="formulario">
      <div className="form-header">
        <h1 className="titulo-principal-form">Datos de la resolución</h1>
        {/* <p className="subtitulo-form">Ingrese la información de la resolución.</p> */}
      </div>
      <div className="form-fieldsets">
        <div
          className={`form-card ${shakeError ? "error shake" : ""
            } resolucion-card`}
        >
          {/* <h2 className="form-card-header">Detalle de la resolución</h2> */}
          <div className="input-row">
            <label className="num-resolucion">
              Número:
              <input
                type="number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                className={errores.num1 ? "error" : ""}
              />
              <span>-</span>
              <input
                type="number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                className={errores.num2 ? "error" : ""}
              />
              <span>-</span>
              <input
                type="number"
                value={num3}
                onChange={(e) => setNum3(e.target.value)}
                className={errores.num3 ? "error" : ""}
              />
            </label>
          </div>
          <div className="input-row">
            <label className="input-group">
              Fecha de resolución
              <input
                type="date"
                value={fechaResolucion}
                onChange={(e) => setFechaResolucion(e.target.value)}
                className={errores.fechaResolucion ? "error" : ""}
              />
            </label>
            <label className="input-group">
              Fecha de vigencia
              <input
                type="date"
                value={fechaVigencia}
                onChange={(e) => setFechaVigencia(e.target.value)}
                className={errores.fechaVigencia ? "error" : ""}
              />
            </label>
          </div>
          <div className="input-row">
            <label className="input-group">
              Descripción
              <Components.GrowTextArea
                placeholder="Describa el/los punto(s) que resuelve la resolución."
                value={descripcion}
                maxLength={1000}
                onChange={(e) => setDescripcion(e.target.value)}
                className={errores.descripcion ? "error" : ""}

              />
              {/* <textarea
                placeholder="Sección del contenido “Resuelve“. Ejemplo: RESUELVE:
CONOCER y APROBAR la Distribución de beneficios económicos por explotación del
“SOFTWARE DE MONITOREO, PREDICCIÓN Y RESPUESTA A RIESGOS (SENTIFY)”,
propuesta contenida en la recomendación de la Comisión de Investigación, Desarrollo e Innovación
de la ESPOL (I+D+i) Nro. {recomendación}, acordada en sesión del {fecha},
contenida en el Oficio Nro. {numero de oficio}}, del 26 de junio de 2024, dirigido a ..."
                value={descripcion}
                maxLength={1000}
                onChange={(e) => setDescripcion(e.target.value)}
                className={errores.descripcion ? "error" : ""}
              /> */}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Formulario;
