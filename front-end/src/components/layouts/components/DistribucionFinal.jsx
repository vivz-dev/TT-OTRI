// src/pages/layouts/components/DistribucionFinal.jsx
import React, { useMemo } from "react";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/**
 * Props:
 *  data = {
 *    nombreTecnologia,
 *    codigoResolucion,
 *    subtotalAutores,
 *    autores: [{ idPersona?, montoAutor }...],
 *    subtotalInstituciones,
 *    instituciones: [{ idBenefInst, montoBenefInst, porcentaje }...],
 *    centros: [{ idUnidad, porcUnidad, montoCentro }...],
 *    total
 *  }
 */
const DistribucionFinal = ({ data }) => {
  // console.log("DATA PARA FINAL --->>> ", data);
  const autores = Array.isArray(data?.autores) ? data.autores : [];
  const instituciones = Array.isArray(data?.instituciones)
    ? data.instituciones
    : [];
  const centros = Array.isArray(data?.centros) ? data.centros : [];

  // console.log("centros ---> ", centros)
  const fechaResolucion = data?.fechaResolucion ?? "Sin fecha";

  // Normaliza por si viniera como solo IDs (retrocompat):
  const institucionesNorm = useMemo(() => {
    return instituciones.map((x, idx) =>
      typeof x === "object"
        ? x
        : { idBenefInst: x, montoBenefInst: 0, porcentaje: 0, _idx: idx }
    );
  }, [instituciones]);

  return (
    <div className="form-card">
      <table className="tabla-distribucion">
        <thead>
          <tr>
            <th colSpan={4} className="beneficiarios">
              FORMULARIO DE DISTRIBUCIÓN DE BENEFICIOS ECONÓMICOS DE LA ESPOL
              POR EXPLOTACIÓN DE LA PROPIEDAD INTELECTUAL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="fila-subtotal-titulo">
            <td>
              Nombre de la tecnología/<em>know-how</em> transferida:
            </td>
            <td className="subtotal">
              {data?.nombreTecnologia ?? "No hay datos de la tecnología"}
            </td>
          </tr>
          <tr className="autor-name">
            <td className="" colSpan={2} style={{textAlign: "justify"}}>
              {`Con base al acuerdo de distribución de beneficios económicos de autores/inventores por explotación de la Propiedad Intelectual, y a la resolución No. ${
                data?.codigoResolucion ?? "—"
              } de fecha ${fechaResolucion}, la distribución de los beneficios económicos que reciba la ESPOL por la explotación de la Propiedad Intelectual de la tecnología/know how descrita, se distribuya conforme al siguiente detalle:`}
            </td>
          </tr>
        </tbody>

        <thead>
          <tr>
            <th colSpan={4} className="beneficiarios">
              LISTADO DE BENEFICIARIOS
            </th>
          </tr>

          <tr className="fila-subtotal-titulo">
            <td>Autores/Inventores beneficiarios</td>
            <td className="subtotal" colSpan={3}></td>
          </tr>

          {autores.map((a, i) => {
            const label = a.idPersona;
            const monto = a.montoAutor ?? 0;
            return (
              <tr>
                <td className="input-select autor-name">{label}</td>
                <td className="input-col autor-monto">{money(monto)}</td>
              </tr>
            );
          })}

          <tr className="fila-subtotal">
            <td className="subtotal autor-name">Subtotal de autores/inventores beneficiarios</td>
            <td className="subtotal" colSpan={3}>
              {money(data?.subtotalAutores)}
            </td>
          </tr>

          <tr className="fila-subtotal-titulo">
            <td>Otros beneficiarios institucionales</td>
            <td className="subtotal" colSpan={3}></td>
          </tr>

          {centros.map((c, i) => (
            <tr>
              <td className="input-select autor-name" style={{textTransform:"capitalize"}}>{c.nombreCentro.toLowerCase()}</td>
              <td className="input-col autor-monto">{money(c?.montoCentro ?? 0)}</td>
            </tr>
          ))}

          {institucionesNorm.map((inst, i) => (
            <tr>
              <td className="input-select autor-name">{inst.nombreBenef}</td>
              <td className="input-col autor-monto">{money(inst?.montoBenefInst ?? 0)}</td>
            </tr>
          ))}

          <tr className="fila-subtotal">
            <td className="subtotal autor-name">Subtotal de beneficiarios institucionales</td>
            <td className="subtotal" colSpan={3}>
              {money(data?.subtotalInstituciones)}
            </td>
          </tr>

          <tr className="fila-subtotal-titulo">
            <td className="subtotal autor-name" >Total del pago realizado</td>
            <td className="subtotal" colSpan={3}>
              {money(data?.total)}
            </td>
          </tr>
        </thead>
      </table>
      <div></div>

    </div>
  );
};

export default DistribucionFinal;
