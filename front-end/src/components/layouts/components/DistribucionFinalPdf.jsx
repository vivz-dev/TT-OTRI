// src/pdf/DistribucionFinalPdf.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import ESLOGO_URL from "../components/utils/assets/Espol_Logo_2023.png";
import { styles } from "../components/utils/docStyles";

import * as ReactPDF from "@react-pdf/renderer";

ReactPDF.Font.registerHyphenationCallback((word) => [word]);

function fechaHoraEcuadorString(date = new Date()) {
  // Día de la semana
  const diaSemana = date.toLocaleDateString("es-EC", {
    weekday: "long",
    timeZone: "America/Guayaquil",
  });

  // Fecha (día, mes, año)
  const fecha = date.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Guayaquil",
  });

  // Hora (hh:mm:ss en 24h)
  const hora = date.toLocaleTimeString("es-EC", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Guayaquil",
  });

  return {
    composed: `${diaSemana}, ${fecha} a las ${hora}`,
  };
}

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

const DistribucionFinalPdf = ({ data }) => {
  const autores = Array.isArray(data?.autores) ? data.autores : [];
  const instituciones = Array.isArray(data?.instituciones) ? data.instituciones : [];
  const centros = Array.isArray(data?.centros) ? data.centros : [];

  // const fechaResolucion = data.re;
  console.log("DATA PARA PDF --->>> ", data);

  const fechaResolucion = data?.fechaResolucion ?? "Sin fecha"; 


  const { composed } = fechaHoraEcuadorString();
  const footerText = `Este documento ha sido generado por el sistema de la Oficina de Transferencia de Resultados de Investigación (OTRI) el ${composed}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <ReactPDF.View style={styles.headerWrapper}>
                {/* Logo arriba-derecha, ahora sí visible */}
                <ReactPDF.Image
                  src={ESLOGO_URL} // 👈 usa el import bundlado, no una función async
                  style={styles.headerLogoRight}
                  cache={false}
                />
              </ReactPDF.View>

        <ReactPDF.View style={{ top: 60}}>

          {/* Encabezado principal */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>
            FORMULARIO DE DISTRIBUCIÓN DE BENEFICIOS ECONÓMICOS DE LA ESPOL
          </Text>
          <Text style={styles.headerTitle}>POR EXPLOTACIÓN DE LA PROPIEDAD INTELECTUAL</Text>
        </View>

        {/* Nombre de la tecnología */}
        <View style={styles.labelRow}>
          <Text style={styles.labelCell}>Nombre de la tecnología/know-how:</Text>
          <Text style={styles.valueCell}>
            {data?.nombreTecnologia ?? "No hay datos de la tecnología"}
          </Text>
        </View>

        {/* Párrafo explicativo (pegado al siguiente) */}
        <View style={styles.paragraphBox}>
          <Text style={styles.paragraph}>
            {`Con base al acuerdo de distribución de beneficios económicos de autores/inventores por explotación de la Propiedad Intelectual, y a la resolución No. ${data?.codigoResolucion ?? "—"} de fecha ${fechaResolucion}, la distribución de los beneficios económicos que reciba la ESPOL por la explotación de la Propiedad Intelectual de la tecnología/know how descrita, se distribuya conforme al siguiente detalle:`}
          </Text>
        </View>

        {/* LISTADO DE BENEFICIARIOS – pegado sin espacio */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>LISTADO DE BENEFICIARIOS</Text>
        </View>

        {/* --- Autores/Inventores --- */}
        <View style={styles.blockHeader}>
          <Text style={styles.blockHeaderLabel}>Autores/Inventores beneficiarios</Text>
          <Text style={styles.blockHeaderRight}></Text>
        </View>

        {autores.map((a, i) => {
          const label = a?.nombrePersona ?? a?.idPersona ?? `Autor ${i + 1}`;
          const monto = a?.montoAutor ?? 0;
          return (
            <View key={`autor-${i}`} style={styles.row}>
              <Text style={styles.cellLabel}>{label}</Text>
              <Text style={styles.cellMoney}>{money(monto)}</Text>
            </View>
          );
        })}

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>
            Subtotal de autores/inventores beneficiarios
          </Text>
          <Text style={styles.subtotalMoney}>{money(data?.subtotalAutores)}</Text>
        </View>

        {/* --- Otros beneficiarios institucionales --- */}
        <View style={styles.blockHeader}>
          <Text style={styles.blockHeaderLabel}>Otros beneficiarios institucionales</Text>
          <Text style={styles.blockHeaderRight}></Text>
        </View>

        {centros.map((c, i) => (
          <View key={`centro-${i}`} style={styles.row}>
            <Text style={styles.cellLabel}>{c?.nombreCentro.toLowerCase() ?? `Centro ${i + 1}`}</Text>
            <Text style={styles.cellMoney}>{money(c?.montoCentro ?? 0)}</Text>
          </View>
        ))}

        {instituciones.map((inst, i) => (
          <View key={`inst-${i}`} style={styles.row}>
            <Text style={styles.cellLabel}>{inst?.nombreBenef ?? `Institución ${i + 1}`}</Text>
            <Text style={styles.cellMoney}>{money(inst?.montoBenefInst ?? 0)}</Text>
          </View>
        ))}

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal de beneficiarios institucionales</Text>
          <Text style={styles.subtotalMoney}>{money(data?.subtotalInstituciones)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total del pago realizado</Text>
          <Text style={styles.totalMoney}>{money(data?.total)}</Text>
        </View>

        </ReactPDF.View>

        {/* Footer fijo en cada página */}
              <ReactPDF.View style={styles.footer} fixed>
                <ReactPDF.Text style={styles.footerText}>{footerText}</ReactPDF.Text>
              </ReactPDF.View>
        
      </Page>
    </Document>
  );
};

export default DistribucionFinalPdf;
