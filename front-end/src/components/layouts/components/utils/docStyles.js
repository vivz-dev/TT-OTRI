// /src/pages/layouts/components/utils/docStyles.js

import * as ReactPDF from "@react-pdf/renderer";

ReactPDF.Font.registerHyphenationCallback((word) => [word]);

/* =========================
   Estilos PDF
   ========================= */

export const palette = {
  primary: "#1f2f56",
  primaryLight: "#d9e2ff",
  subtotalBg: "#e6e6e6",
  border: "#000000",
  textDark: "#0b132b",
};

export const styles = ReactPDF.StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: palette.textDark,
  },

  /* ===== Encabezado ===== */
  headerBox: {
    position: "relative",
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
  headerLogoRight: {
    position: "absolute",
    top: 6,
    right: 8,
    height: 22,         // "altura pequeña"
    opacity: 0.5,       // 50% de transparencia
  },

  /* ===== Cuerpo ===== */
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
  paragraphBox: {
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 0,
  },
  paragraph: {
    lineHeight: 1.4,
    textAlign: "justify",
  },
  sectionHeader: {
    backgroundColor: palette.primary,
    borderColor: palette.border,
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },
  blockHeader: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderTopWidth: 0,
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
  row: {
    flexDirection: "row",
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  headRow: {
    flexDirection: "row",
    backgroundColor: palette.primaryLight,
    borderColor: palette.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  th: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  cellLabel: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: 200,
    textTransform: "capitalize",
  },
  cellMoney: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },
  dateCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
  },
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
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },
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
    width: 80,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: "right",
    fontWeight: 700,
  },

  /* ===== Footer ===== */
  footer: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 18,
  },
  footerText: {
    fontSize: 8,      // letra pequeña
    color: "#000000", // negro normal
    textAlign: "center",
  },
});
