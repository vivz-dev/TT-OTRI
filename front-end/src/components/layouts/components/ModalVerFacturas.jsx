// src/pages/layouts/components/ModalVerFacturas.jsx
import React, { useMemo } from "react";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/**
 * ModalVerFacturas
 * ----------------
 * Props:
 * - registroPago: objeto del registro seleccionado (espera opcionalmente .facturas[])
 * - onBack: volver al modal anterior
 * - onClose: cerrar completamente
 */
const ModalVerFacturas = ({ registroPago, onBack, onClose }) => {
  const stop = (e) => e.stopPropagation();

  // Intentamos leer facturas embebidas (si tu API no las trae, ver TODO más abajo)
  const facturas = useMemo(() => {
    const arr = registroPago?.facturas;
    return Array.isArray(arr) ? arr : [];
  }, [registroPago]);

  // Calcular totales desde la lista de facturas si existe, caso contrario usamos totalPago del registro
  const totalPorFacturas = useMemo(
    () => facturas.reduce((acc, f) => acc + Number(f?.monto ?? f?.valor ?? 0), 0),
    [facturas]
  );

  const totalFallback = Number(registroPago?.totalPago ?? 0);

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={stop}>
        <header className="otri-modal-header">
          <h3>Facturas del Registro #{registroPago?.idRegistroPago ?? "—"}</h3>
        </header>

        <section
          className="otri-modal-body"
          style={{ maxHeight: "60vh", overflow: "auto" }}
        >
          <div className="pago-summary" style={{ marginBottom: 12 }}>
            <p>
              <strong>Registrado por:</strong>{" "}
              {registroPago?.idPersona ? `Persona #${registroPago.idPersona}` : "—"}
            </p>
            <p>
              <strong>Fecha de creación:</strong>{" "}
              {registroPago?.createdAt
                ? new Date(registroPago.createdAt).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>Total del registro:</strong> {money(totalFallback)}
            </p>
          </div>

          {facturas.length > 0 ? (
            <table className="pagos-table">
              <thead>
                <tr>
                  <th colSpan={6}>FACTURAS</th>
                </tr>
                <tr className="fila-subtotal">
                  <th>#</th>
                  <th>Fecha factura</th>
                  <th>Monto</th>
                  <th>Tipos seleccionados</th>
                  <th>Archivos</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f, idx) => {
                  const tipos = Array.isArray(f?.tiposSeleccionados) ? f.tiposSeleccionados : [];
                  const cantTipos = tipos.length;
                  const cantArchivos = tipos.reduce((acc, t) => acc + (Array.isArray(t?.archivos) ? t.archivos.length : 0), 0);

                  return (
                    <tr key={f?.index ?? idx}>
                      <td>{f?.index ?? idx + 1}</td>
                      <td>{f?.fechaFactura ? new Date(f.fechaFactura).toLocaleDateString() : "—"}</td>
                      <td>{money(f?.monto ?? f?.valor ?? 0)}</td>
                      <td>{cantTipos}</td>
                      <td>{cantArchivos}</td>
                      <td>{f?.observacion || f?.nota || "—"}</td>
                    </tr>
                  );
                })}

                <tr className="fila-subtotal">
                  <td colSpan={2} className="subtotal"><strong>Total por facturas:</strong></td>
                  <td>{money(totalPorFacturas)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 8 }}>
              <p><em>Este registro no contiene facturas embebidas.</em></p>
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                (Si tu API expone <code>/registros-pago/:id/facturas</code>, aquí puedes cargar y mostrarlas.)
              </p>
            </div>
          )}
        </section>

        <footer
          className="otri-modal-footer"
          style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}
        >
          <button type="button" className="btn-secondary" onClick={onBack}>
            Atrás
          </button>
          <button type="button" onClick={onClose} className="btn-tertiary">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalVerFacturas;
