import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Formulario.css';

const Formulario = forwardRef((props, ref) => {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [fechaResolucion, setFechaResolucion] = useState('');
  const [fechaVigencia, setFechaVigencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState({
    num1: false,
    num2: false,
    num3: false,
    fechaResolucion: false,
    fechaVigencia: false,
    descripcion: false,
  });
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
        return {
        valido: esValido,
        data: esValido
            ? {
                numero: `${num1}-${num2}-${num3}`,
                fechaResolucion,
                fechaVigencia,
                descripcion,
            }
            : null,
        };
    },
    }));

  return (
    <div className="formulario">
      <label>Número de resolución</label>
      <div className="num-resolucion">
        <input
          type="number"
          value={num1}
          onChange={e => setNum1(e.target.value)}
          className={errores.num1 ? 'error' : ''}
        />
        <span>-</span>
        <input
          type="number"
          value={num2}
          onChange={e => setNum2(e.target.value)}
          className={errores.num2 ? 'error' : ''}
        />
        <span>-</span>
        <input
          type="number"
          value={num3}
          onChange={e => setNum3(e.target.value)}
          className={errores.num3 ? 'error' : ''}
        />
      </div>

      <label>Fecha de resolución</label>
      <input
        type="date"
        value={fechaResolucion}
        onChange={e => setFechaResolucion(e.target.value)}
        className={errores.fechaResolucion ? 'error' : ''}
      />

      <label>Fecha de vigencia</label>
      <input
        type="date"
        value={fechaVigencia}
        onChange={e => setFechaVigencia(e.target.value)}
        className={errores.fechaVigencia ? 'error' : ''}
      />

      <label>Descripción</label>
      <textarea
        placeholder='Sección del contenido “Resuelve”…'
        value={descripcion}
        maxLength={200}
        onChange={e => setDescripcion(e.target.value)}
        className={errores.descripcion ? 'error' : ''}
      />
      <div className="char-count">
        Máximo 200 caracteres. ({descripcion.length}/200)
      </div>
    </div>
  );
});

export default Formulario;
