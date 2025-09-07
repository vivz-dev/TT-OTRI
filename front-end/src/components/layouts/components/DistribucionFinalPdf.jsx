// src/pdf/DistribucionFinalPdf.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* Paleta */
const palette = {
  primary: "#1f2f56",
  primaryLight: "#d9e2ff",
  subtotalBg: "#e6e6e6",
  border: "#000000",
  textDark: "#0b132b",
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: palette.textDark,
  },

  /* Encabezado principal */
  headerBox: {
    backgroundColor: palette.primary,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
  },

  /* Fila rotulada (tecnología) */
  labelRow: {
    flexDirection: "row",
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.primaryLight,
  },
  labelCell: {
    flexGrow: 1,
    fontWeight: 700,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  valueCell: {
    width: 250,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },

  /* Párrafo (SIN margen inferior para pegarlo con lo siguiente) */
  paragraphBox: {
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 0, // 👈 antes 8; ahora 0 para que se una al siguiente bloque
  },
  paragraph: {
    lineHeight: 1.4,
    textAlign: "justify",
  },

  /* Sección “Listado de beneficiarios” (sin márgenes, sin borde superior) */
  sectionHeader: {
    backgroundColor: palette.primary,
    borderColor: palette.border,
    borderWidth: 1,
    borderTopWidth: 0, // 👈 usa el borde inferior del párrafo anterior
    marginTop: 0,      // 👈 sin espacio arriba
    marginBottom: 0,   // 👈 sin espacio abajo
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },

  /* Subtítulo de bloque (azul claro) – sin borde superior */
  blockHeader: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderTopWidth: 0,   // 👈 se pega al header anterior
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  blockHeaderLabel: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  blockHeaderRight: {
    width: 120,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  /* Filas de tabla */
  row: {
    flexDirection: "row",
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  cellLabel: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textTransform: "capitalize"
  },
  cellMoney: {
    width: 120,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },

  /* Subtotales */
  subtotalRow: {
    flexDirection: "row",
    backgroundColor: palette.subtotalBg,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  subtotalLabel: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  subtotalMoney: {
    width: 120,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },

  /* Total (azul claro) */
  totalRow: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  totalLabel: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  totalMoney: {
    width: 120,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },
});

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            {`Con base al acuerdo de distribución de beneficios económicos de autores/inventores por explotación de la Propiedad Intelectual, y a la resolución No. ${data?.codigoResolucion ?? "—"} de fecha 7 de julio del año 2024, la distribución de los beneficios económicos que reciba la ESPOL por la explotación de la Propiedad Intelectual de la tecnología/know how descrita, se distribuya conforme al siguiente detalle:`}
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
      </Page>
    </Document>
  );
};

export default DistribucionFinalPdf;
