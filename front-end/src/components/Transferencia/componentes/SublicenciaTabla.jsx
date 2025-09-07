// src/components/SublicenciaTabla.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import './subLTabla.css'

const SublicenciaTabla = ({ datos, setDatos, errores }) => {
  const [sumaError, setSumaError] = useState(false);

  // Efecto para validar la suma de porcentajes
  useEffect(() => {
    const hasError = datos.sublicencias.some(sublicencia => {
      const espol = parseInt(sublicencia.porcentajeEspol) || 0;
      const receptor = parseInt(sublicencia.porcentajeReceptor) || 0;
      return espol + receptor !== 100;
    });
    
    setSumaError(hasError);
  }, [datos.sublicencias]);

  const handleAddRow = () => {
    setDatos({
      ...datos,
      sublicencias: [
        ...datos.sublicencias,
        {
          min: "",
          max: "",
          porcentajeEspol: "",
          porcentajeReceptor: ""
        }
      ]
    });
  };

  const handleDeleteRow = (index) => {
    if (datos.sublicencias.length === 1) return; // No eliminar la última fila
    
    const newSublicencias = datos.sublicencias.filter((_, i) => i !== index);
    setDatos({
      ...datos,
      sublicencias: newSublicencias
    });
  };

  const handleInputChange = (index, field, value) => {
    // Validar que solo sean números enteros no negativos
    if (value !== "" && !/^\d+$/.test(value)) return;
    
    const newSublicencias = datos.sublicencias.map((sublicencia, i) => {
      if (i === index) {
        return { ...sublicencia, [field]: value };
      }
      return sublicencia;
    });
    
    setDatos({
      ...datos,
      sublicencias: newSublicencias
    });
  };

  return (
    <div className="sublicencias-table-container">

      <table className="tabla-distribucion">
        <thead>
          <tr>
            <th colSpan={6} className="beneficiarios">
              TABLA DE SUBLICENCIAS
            </th>
          </tr>
        </thead>

         <tbody>
          <tr className="fila-subtotal-titulo">
            <td colSpan={2}>No. Sublicencias</td>
            <td>% ESPOL</td>
            <td>% Receptor</td>
            <td></td>
          </tr>

          {datos.sublicencias.map((sublicencia, index) => {
            const espol = parseInt(sublicencia.porcentajeEspol) || 0;
            const receptor = parseInt(sublicencia.porcentajeReceptor) || 0;
            const rowError = espol + receptor !== 100;
            
            return (
              <tr key={index} className="autor-name">
                <td>
                  <div>
                    <label>Mínimo</label>
                    <input
                      type="text"
                      value={sublicencia.min}
                      onChange={(e) => handleInputChange(index, "min", e.target.value)}
                      placeholder="0"
                      className={errores[`sublicencias.${index}.min`] ? "error" : ""}
                    />
                  </div>
                </td>
                <td>
                  <div>
                    <label>Máximo</label>
                    <input
                      type="text"
                      value={sublicencia.max}
                      onChange={(e) => handleInputChange(index, "max", e.target.value)}
                      placeholder="0"
                      className={errores[`sublicencias.${index}.max`] ? "error" : ""}
                    />
                  </div>
                </td>
                <td>
                  <div className="percentage-input">
                    <input
                      type="text"
                      value={sublicencia.porcentajeEspol}
                      onChange={(e) => handleInputChange(index, "porcentajeEspol", e.target.value)}
                      placeholder="0"
                      className={errores[`sublicencias.${index}.porcentajeEspol`] ? "error" : ""}
                    />
                    <span>%</span>
                  </div>
                </td>
                <td>
                  <div className="percentage-input">
                    <input
                      type="text"
                      value={sublicencia.porcentajeReceptor}
                      onChange={(e) => handleInputChange(index, "porcentajeReceptor", e.target.value)}
                      placeholder="0"
                      className={errores[`sublicencias.${index}.porcentajeReceptor`] ? "error" : ""}
                    />
                    <span>%</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(index)}
                    className="delete-row-btn"
                    disabled={datos.sublicencias.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}

         </tbody>

      </table>
      

      <div className="table-footer">
        <button type="button" onClick={handleAddRow} className="add-row-btn">
          <Plus size={16} />
          Añadir sublicenciamiento
        </button>
        
        {sumaError && (
          <div className="suma-error-message">
            ❌ El total de % ESPOL + % Receptor debe sumar 100 en cada fila
          </div>
        )}
      </div>
    </div>
  );
};

export default SublicenciaTabla;