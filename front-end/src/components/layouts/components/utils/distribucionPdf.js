// /src/pages/layouts/components/utils/distribucionPdf.js
import * as ReactPDF from "@react-pdf/renderer";
import { styles } from "./docStyles";
import { fmtFecha, valueOnDate, money, toNumber } from "./docHelpers";

/* =========================
   Componentes PDF
   ========================= */

/** Fila única de contador de pagos (común a Autores e Instituciones) */
const PagoCounterRow = ({
  fechas,
  totalFechas,
  dateWidth,
  startIndex = 0,
  showTotals = false,
}) => (
  <ReactPDF.View style={styles.headRow}>
    {/* primera columna vacía (etiqueta) para alinear */}
    <ReactPDF.Text
      style={{ ...styles.th, textAlign: "left", flexGrow: 1, paddingLeft: 8 }}
    />
    {/* columnas de FECHAS */}
    {fechas.map((_, idx) => (
      <ReactPDF.Text key={`cnt-${idx}`} style={{ ...styles.th, width: dateWidth }}>
        {`Pago (${startIndex + idx + 1}/${totalFechas}) registrado`}
      </ReactPDF.Text>
    ))}
    {/* última columna = Total pagado (solo en la última página) */}
    {showTotals && (
      <ReactPDF.Text style={{ ...styles.th, width: 80 }}>Total pagado</ReactPDF.Text>
    )}
  </ReactPDF.View>
);

/**
 * Renderiza UNA PÁGINA del PDF con el bloque de fechas recibido en data.fechas
 */
const DistribucionFinalPage = ({
  data,
  totalFechas,
  startIndex = 0,
  showTotals = false,
}) => {
  const autores = Array.isArray(data?.autores) ? data.autores : [];
  const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
  const centros = Array.isArray(data?.centros) ? data.centros : [];
  const fechas = Array.isArray(data?.fechas) ? data.fechas : [];

  const dateWidth = 70;

  return (
    <ReactPDF.Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <ReactPDF.View style={styles.headerBox}>
        <ReactPDF.Text style={styles.headerTitle}>
          FORMULARIO DE DISTRIBUCIÓN DE BENEFICIOS ECONÓMICOS DE LA ESPOL
        </ReactPDF.Text>
        <ReactPDF.Text style={styles.headerTitle}>
          POR EXPLOTACIÓN DE LA PROPIEDAD INTELECTUAL
        </ReactPDF.Text>
      </ReactPDF.View>

      {/* Tecnología */}
      <ReactPDF.View style={styles.labelRow}>
        <ReactPDF.Text style={styles.labelCell}>
          Nombre de la tecnología/know-how:
        </ReactPDF.Text>
        <ReactPDF.Text style={styles.valueCell}>
          {data?.nombreTecnologia ?? "No hay datos de la tecnología"}
        </ReactPDF.Text>
      </ReactPDF.View>

      {/* Intro */}
      <ReactPDF.View style={styles.paragraphBox}>
        <ReactPDF.Text style={styles.paragraph}>
          {`Con base al acuerdo de distribución de beneficios económicos de autores/inventores por explotación de la Propiedad Intelectual, y a la resolución No. ${
            data?.codigoResolucion ?? "—"
          }, la distribución de los beneficios económicos que reciba la ESPOL por la explotación de la Propiedad Intelectual de la tecnología/know how descrita, se distribuya conforme al siguiente detalle:`}
        </ReactPDF.Text>
      </ReactPDF.View>

      {/* Sección */}
      <ReactPDF.View style={styles.sectionHeader}>
        <ReactPDF.Text style={styles.sectionHeaderText}>
          LISTADO DE BENEFICIARIOS
        </ReactPDF.Text>
      </ReactPDF.View>

      {/* Fila única de contador que engloba autores e instituciones */}
      <PagoCounterRow
        fechas={fechas}
        totalFechas={totalFechas}
        dateWidth={70}
        startIndex={startIndex}
        showTotals={showTotals}
      />

      {/* —— AUTORES —— */}
      <ReactPDF.View style={styles.headRow}>
        <ReactPDF.Text
          style={{ ...styles.th, textAlign: "left", flexGrow: 1, paddingLeft: 8 }}
        >
          Autores/Inventores beneficiarios
        </ReactPDF.Text>
        {fechas.map((f) => (
          <ReactPDF.Text key={`aut-h-${f}`} style={{ ...styles.th, width: 70 }}>
            {fmtFecha(f)}
          </ReactPDF.Text>
        ))}
        {showTotals && (
          <ReactPDF.Text style={{ ...styles.th, width: 80 }}>Total pagado</ReactPDF.Text>
        )}
      </ReactPDF.View>

      {autores.map((a, i) => {
        const label = a?.nombrePersona ?? a?.idPersona ?? `Autor ${i + 1}`;
        const monto = a?.montoAutor ?? 0;
        const porFecha = a?.porFecha || {};
        return (
          <ReactPDF.View key={`autor-${i}`} style={styles.row}>
            <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
            {fechas.map((f) => (
              <ReactPDF.Text
                key={`aut-${i}-${f}`}
                style={{ ...styles.dateCell, width: 70 }}
              >
                {valueOnDate(porFecha, f)}
              </ReactPDF.Text>
            ))}
            {showTotals && (
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
            )}
          </ReactPDF.View>
        );
      })}

      <ReactPDF.View style={styles.subtotalRow}>
        <ReactPDF.Text style={styles.subtotalLabel}>
          Subtotal de autores/inventores beneficiarios
        </ReactPDF.Text>
        {fechas.map((f) => (
          <ReactPDF.Text key={`aut-sub-${f}`} style={{ ...styles.subtotalMoney, width: 70 }}>
            {money(toNumber(data?.porFechaAutores?.[f]))}
          </ReactPDF.Text>
        ))}
        {showTotals && (
          <ReactPDF.Text style={styles.subtotalMoney}>
            {money(data?.subtotalAutores)}
          </ReactPDF.Text>
        )}
      </ReactPDF.View>

      {/* —— INSTITUCIONALES —— */}
      <ReactPDF.View style={styles.headRow}>
        <ReactPDF.Text
          style={{ ...styles.th, textAlign: "left", flexGrow: 1, paddingLeft: 8 }}
        >
          Otros beneficiarios institucionales
        </ReactPDF.Text>
        {fechas.map((f) => (
          <ReactPDF.Text key={`inst-h-${f}`} style={{ ...styles.th, width: 70 }}>
            {fmtFecha(f)}
          </ReactPDF.Text>
        ))}
        {showTotals && (
          <ReactPDF.Text style={{ ...styles.th, width: 80 }}>Total pagado</ReactPDF.Text>
        )}
      </ReactPDF.View>

      {/* CENTROS */}
      {centros.map((c, i) => {
        const label = c?.nombreCentro?.toLowerCase?.() ?? `Centro ${i + 1}`;
        const monto = c?.montoCentro ?? 0;
        const porFecha = c?.porFecha || {};
        return (
          <ReactPDF.View key={`centro-${i}`} style={styles.row}>
            <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
            {fechas.map((f) => (
              <ReactPDF.Text
                key={`cent-${i}-${f}`}
                style={{ ...styles.dateCell, width: 70 }}
              >
                {valueOnDate(porFecha, f)}
              </ReactPDF.Text>
            ))}
            {showTotals && (
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
            )}
          </ReactPDF.View>
        );
      })}

      {/* INSTITUCIONES */}
      {instituciones.map((inst, i) => {
        const label = inst?.nombreBenef ?? `Institución ${i + 1}`;
        const monto = inst?.montoBenefInst ?? 0;
        const porFecha = inst?.porFecha || {};
        return (
          <ReactPDF.View key={`inst-${i}`} style={styles.row}>
            <ReactPDF.Text style={styles.cellLabel}>{label}</ReactPDF.Text>
            {fechas.map((f) => (
              <ReactPDF.Text
                key={`inst-${i}-${f}`}
                style={{ ...styles.dateCell, width: 70 }}
              >
                {valueOnDate(porFecha, f)}
              </ReactPDF.Text>
            ))}
            {showTotals && (
              <ReactPDF.Text style={styles.cellMoney}>{money(monto)}</ReactPDF.Text>
            )}
          </ReactPDF.View>
        );
      })}

      <ReactPDF.View style={styles.subtotalRow}>
        <ReactPDF.Text style={styles.subtotalLabel}>
          Subtotal de beneficiarios institucionales
        </ReactPDF.Text>
        {fechas.map((f) => (
          <ReactPDF.Text key={`inst-sub-${f}`} style={{ ...styles.subtotalMoney, width: 70 }}>
            {money(toNumber(data?.porFechaInstituciones?.[f]))}
          </ReactPDF.Text>
        ))}
        {showTotals && (
          <ReactPDF.Text style={styles.subtotalMoney}>
            {money(data?.subtotalInstituciones)}
          </ReactPDF.Text>
        )}
      </ReactPDF.View>

      {/* TOTAL DE FECHAS */}
      <ReactPDF.View style={styles.totalRow}>
        <ReactPDF.Text style={styles.totalLabel}>Pago total de cada fecha</ReactPDF.Text>
        {fechas.map((f) => (
          <ReactPDF.Text key={`tot-${f}`} style={{ ...styles.totalMoney, width: 70 }}>
            {money(
              toNumber(data?.porFechaAutores?.[f]) +
              toNumber(data?.porFechaInstituciones?.[f])
            )}
          </ReactPDF.Text>
        ))}
        {/* reserva la última celda solo si existe la columna de Total */}
        {showTotals && <ReactPDF.Text style={styles.totalMoney} />}
      </ReactPDF.View>

      {/* TOTAL GENERAL SOLO EN LA ÚLTIMA PÁGINA */}
      {showTotals && (
        <ReactPDF.View style={styles.totalRow}>
          <ReactPDF.Text style={styles.totalLabel}>Pago total hasta la actualidad</ReactPDF.Text>
          {/* columnas de fechas vacías para mantener grilla */}
          {fechas.map((_, i) => (
            <ReactPDF.Text
              key={`tot-empty-${i}`}
              style={{ ...styles.totalMoney, width: 70 }}
            />
          ))}
          {/* total en la COLUMNA FINAL (Total pagado) */}
          <ReactPDF.Text style={styles.totalMoney}>{money(data?.total)}</ReactPDF.Text>
        </ReactPDF.View>
      )}
    </ReactPDF.Page>
  );
};

/** Documento PDF con N páginas: una por BLOQUE de fechas */
export const DistribucionFinalPdf = ({ data, bloquesFechas, totalFechas }) => {
  // offsets acumulados por bloque: [0, len(b0), len(b0)+len(b1), ...]
  const offsets = [];
  let acc = 0;
  for (const chunk of bloquesFechas) {
    offsets.push(acc);
    acc += chunk.length;
  }

  return (
    <ReactPDF.Document>
      {bloquesFechas.map((fechasChunk, idx) => {
        const isLast = idx === bloquesFechas.length - 1;
        return (
          <DistribucionFinalPage
            key={`page-${idx}`}
            data={{ ...data, fechas: fechasChunk }}
            totalFechas={totalFechas}
            startIndex={offsets[idx] || 0}
            showTotals={isLast}   // solo última página
          />
        );
      })}
    </ReactPDF.Document>
  );
};
