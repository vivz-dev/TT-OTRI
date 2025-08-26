// src/pages/layouts/components/ModalDistribucion.jsx
import React, { useMemo } from "react";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

/**
 * Props esperadas:
 * - item: TT seleccionada (id, titulo, etc.)
 * - resumenPago: { totalPago, totalFacturas }
 * - facturas: array con { index, fechaFactura, monto, ... }
 * - onClose: cerrar modal
 * - onBack: opcional, volver al paso anterior
 * - onConfirmDistribucion: acción para confirmar
 */
const ModalDistribucion = ({ item, resumenPago, facturas = [], onClose, onBack, onConfirmDistribucion }) => {
  const stop = (e) => e.stopPropagation();

  const total = resumenPago?.totalPago || facturas.reduce((acc, f) => acc + (f?.monto ?? 0), 0);
  const cantidad = resumenPago?.totalFacturas || facturas.length;

  const rows = useMemo(() => {
    return facturas.map((f) => ({
      index: f.index,
      fecha: f.fechaFactura ?? "—",
      monto: f.monto ?? 0,
    }));
  }, [facturas]);

  return (
    <div className="otri-modal-backdrop backdropStyle" onClick={onClose}>
      <div className="otri-modal modalStyle" onClick={stop}>
        <header className="otri-modal-header headerStyle">
          <h3>Definir distribución de beneficios</h3>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            TT: <strong>{item?.titulo || `#${item?.id}`}</strong>
          </div>
        </header>

        <section className="otri-modal-body bodyStyle" style={{ maxHeight: "60vh", overflow: "auto", display: "grid", gap: 12 }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div><strong>Facturas:</strong> {cantidad}</div>
            <div><strong>Total:</strong> {money(total)}</div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Detalle de facturas</div>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 140px", gap: 8, fontSize: 14, fontWeight: 600 }}>
              <div>#</div><div>Fecha</div><div>Monto</div>
            </div>
            <div style={{ height: 8 }} />
            {rows.map((r) => (
              <div key={r.index} style={{ display: "grid", gridTemplateColumns: "80px 1fr 140px", gap: 8, padding: "6px 0", borderTop: "1px dashed #eee" }}>
                <div>Factura {r.index}</div>
                <div>{r.fecha}</div>
                <div>{money(r.monto)}</div>
              </div>
            ))}
          </div>

          {/* Aquí puedes renderizar tu UI de distribución (porcentajes/actores/etc.) */}
          <div
            style={{
              border: "1px dashed #e5e7eb",
              borderRadius: 12,
              padding: 16,
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            <em>
              Coloca aquí el formulario/componente para repartir el total entre actores (inventores, unidades, universidad, etc.) con validaciones (suma 100%, reglas de mínimos, etc.).
            </em>
          </div>
        </section>

        <footer className="otri-modal-footer footerStyle" style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={onBack} className="btn-secondary">Atrás</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} className="btn-tertiary">Cerrar</button>
            <button type="button" onClick={onConfirmDistribucion} className="btn-primary">Confirmar distribución</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ModalDistribucion;
