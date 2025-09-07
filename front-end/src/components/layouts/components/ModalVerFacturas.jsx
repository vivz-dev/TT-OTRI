// src/pages/layouts/components/ModalVerFacturas.jsx
import React, { useMemo } from "react";
import { useGetFacturasByRegistroPagoIdQuery } from "../../../services/pagosFacturasApi";
import Factura from "./Factura";
import * as Buttons from "../buttons/buttons_index";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

const ModalVerFacturas = ({ registroPago, onBack, onClose }) => {
  const stop = (e) => e.stopPropagation();

  const totalFallback = Number(registroPago?.totalPago ?? 0);
  const idRegistroPago =
    registroPago?.idRegistroPago ?? registroPago?.id ?? null;

  const shouldSkip = !idRegistroPago;

  const {
    data: facturasByRP,
    isLoading: isLoadingByRP,
    isFetching: isFetchingByRP,
    isError: isErrorByRP,
    error: errorByRP,
  } = useGetFacturasByRegistroPagoIdQuery(idRegistroPago, {
    skip: shouldSkip,
  });

  // DEBUG útil
  console.log("ModalVerFacturas ➜ idRegistroPago:", idRegistroPago);
  console.log("ModalVerFacturas ➜ facturas (API):", facturasByRP);
  console.log("registroPago ➜ facturas (API):", registroPago);

  const hasApiFacturas = Array.isArray(facturasByRP) && facturasByRP.length > 0;
  const isBusy = isLoadingByRP || isFetchingByRP;

  // contenido de facturas (prioriza API; si no hay, muestra embebidas; si tampoco, vacío)
  const facturasParaMostrar = facturasByRP;

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={stop}>
        
        <section
          className="otri-modal-body"
          style={{ maxHeight: "60vh", overflow: "auto" }}
        >
          <h1 className="titulo-principal-form">Facturas del registro</h1>
          <div className="pago-summary" style={{ marginBottom: 12 }}>
            <p>
              <strong>Registrado por:</strong>{" "}
              {registroPago?.nombrePersona
                ? `${registroPago.nombrePersona}`
                : "—"}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {registroPago?.createdAt
                ? new Date(registroPago.createdAt).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>Total:</strong> {money(totalFallback)}
            </p>
          </div>

          <table className="tabla-distribucion">
            <thead>
              <tr>
                <th colSpan={4} className="beneficiarios">
                  FACTURAS REGISTRADAS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="fila-subtotal-titulo">
                <td>Fecha</td>
                <td>Monto</td>
                <td>Archivo(s) adjuntos</td>
              </tr>

              {/* Estados de carga / error / sin id */}
              {shouldSkip && (
                <div style={{ padding: 8 }}>
                  <p>
                    <em>
                      No hay id de registro de pago para consultar facturas.
                    </em>
                  </p>
                </div>
              )}

              {!shouldSkip && isBusy && (
                <div style={{ padding: 8 }}>
                  <p>
                    <em>Cargando facturas…</em>
                  </p>
                </div>
              )}

              {/* Listado de facturas */}
              {!isBusy && !isErrorByRP && (
                <>
                  {Array.isArray(facturasParaMostrar) &&
                  facturasParaMostrar.length > 0 ? (
                    facturasParaMostrar.map((f, idx) => (
                      <Factura key={f?.id ?? f?.idFactura ?? idx} factura={f} />
                    ))
                  ) : (
                    <div style={{ padding: 8 }}>
                      <p>
                        <em>Este registro no contiene facturas.</em>
                      </p>
                    </div>
                  )}
                </>
              )}
            </tbody>
          </table>
        </section>

        <footer
          className="otri-modal-footer"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Buttons.RegisterButton
          onClick={onBack}
          text={"Atrás"}
          />
          <Buttons.RegisterButton
          onClick={onClose}
          text={"Cerrar"}
          />
        </footer>
      </div>
    </div>
  );
};

export default ModalVerFacturas;
