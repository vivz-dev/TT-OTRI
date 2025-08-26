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
  const autores = Array.isArray(data?.autores) ? data.autores : [];
  const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
  const centros = Array.isArray(data?.centros) ? data.centros : [];

  // Normaliza por si viniera como solo IDs (retrocompat):
  const institucionesNorm = useMemo(() => {
    return instituciones.map((x, idx) =>
      typeof x === "object"
        ? x
        : { idBenefInst: x, montoBenefInst: 0, porcentaje: 0, _idx: idx }
    );
  }, [instituciones]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Distribución final</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 6 }}>
        <div style={{ fontWeight: 600 }}>Nombre de la tecnología</div>
        <div>{data?.nombreTecnologia ?? "—"}</div>

        <div style={{ gridColumn: "1 / span 2", borderTop: "1px dashed #eee", margin: "10px 0" }} />

        <div style={{ gridColumn: "1 / span 2", fontWeight: 600 }}>
          {data?.codigoResolucion ?? "—"}
        </div>

        <div style={{ gridColumn: "1 / span 2", borderTop: "1px dashed #eee", margin: "10px 0" }} />

        <div style={{ gridColumn: "1 / span 2", fontWeight: 700 }}>LISTADO DE BENEFICIARIOS</div>

        {/* Subtotal Autores */}
        <div style={{ fontWeight: 600 }}>Subtotal Autores/Inventores beneficiarios</div>
        <div>{money(data?.subtotalAutores)}</div>

        {/* Autores */}
        {autores.map((a, i) => {
          const label = a?.idPersona != null ? `ID AUTOR ${a.idPersona}` : `ID AUTOR ${i + 1}`;
          const monto = a?.montoAutor ?? 0;
          return (
            <React.Fragment key={`aut-${a?.idPersona ?? i}`}>
              <div>{label}</div>
              <div>{money(monto)}</div>
            </React.Fragment>
          );
        })}

        <div style={{ gridColumn: "1 / span 2", borderTop: "1px dashed #eee", margin: "10px 0" }} />

        {/* Subtotal Instituciones */}
        <div style={{ fontWeight: 600 }}>Subtotal Instituciones beneficiarios</div>
        <div>{money(data?.subtotalInstituciones)}</div>

        {/* Instituciones */}
        {institucionesNorm.map((inst, i) => (
          <React.Fragment key={`inst-${inst?.idBenefInst ?? i}`}>
            <div>{inst?.idBenefInst != null ? `idBenefInst${inst.idBenefInst}` : `idBenefInst${i + 1}`}</div>
            <div>{money(inst?.montoBenefInst ?? 0)}</div>
          </React.Fragment>
        ))}

        {/* Centros (unidades) */}
        {centros.length > 0 && (
          <>
            <div style={{ gridColumn: "1 / span 2", borderTop: "1px dashed #eee", margin: "10px 0" }} />
            {centros.map((c, i) => (
              <React.Fragment key={`cent-${c?.idUnidad ?? i}`}>
                <div>{c?.idUnidad != null ? `idCentro${c.idUnidad}` : `idCentro${i + 1}`}</div>
                <div>{money(c?.montoCentro ?? 0)}</div>
              </React.Fragment>
            ))}
          </>
        )}

        <div style={{ gridColumn: "1 / span 2", borderTop: "1px dashed #eee", margin: "10px 0" }} />

        {/* Total */}
        <div style={{ fontWeight: 700 }}>PAGO TOTAL</div>
        <div style={{ fontWeight: 700 }}>{money(data?.total)}</div>
      </div>
    </div>
  );
};

export default DistribucionFinal;
