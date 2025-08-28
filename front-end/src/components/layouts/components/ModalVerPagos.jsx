// src/pages/layouts/components/ModalVerPagos.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRegistroPagoOrchestrator } from "../../../services/registroPagoOrchestratorApi";
import ModalVerFacturas from "./ModalVerFacturas";
import { FileText, Sheet } from "lucide-react";
import * as Buttons from "../buttons/buttons_index";

// ⬇️ RTK Query – archivos por entidad (lazy para hacer fetch onClick)
import { useLazyGetArchivosByEntidadQuery } from "../../../services/storage/archivosApi";

const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

// ⚙️ Ajusta este código si tu backend usa otro identificador para Registro de Pago
const ENTIDAD_REGISTRO = "SP";

const ModalVerPagos = ({ item, onClose }) => {
  const { isLoading, error, refetch, makeSelector } =
    useRegistroPagoOrchestrator();
  const [localError, setLocalError] = useState(null);

  // estado del wizard interno: 'pagos' | 'facturas'
  const [step, setStep] = useState("pagos");
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  // control de loading por botón (idRegistroPago)
  const [loadingArchivoId, setLoadingArchivoId] = useState(null);

  const stop = (e) => e.stopPropagation();

  // Derivar registros y total desde caché de RTK Query
  const { registros, total } = useMemo(() => {
    if (!item?.id) return { registros: [], total: 0 };
    return makeSelector(item.id);
  }, [item?.id, makeSelector]);

  useEffect(() => {
    setLocalError(null);
    if (item?.id) {
      refetch().catch(() =>
        setLocalError("No se pudieron refrescar los registros de pago")
      );
    }
  }, [item?.id, refetch]);

  // Handlers para cambio de modal
  const handleOpenFacturas = useCallback((registro) => {
    setSelectedRegistro(registro);
    setStep("facturas");
  }, []);

  const handleBackToPagos = useCallback(() => {
    setStep("pagos");
    setSelectedRegistro(null);
  }, []);

  const isBusy = isLoading;

  // ─────────────────────────────────────────────────────
  // Lazy fetch de archivos por entidad para un registro
  // ─────────────────────────────────────────────────────
const [triggerGetArchivosByEntidad] = useLazyGetArchivosByEntidadQuery();

const handleOpenArchivoRegistro = useCallback(
  async (registro) => {

    console.log("REGISTRO A CONSULTAR -->", registro)
    try {
      const idEntidad = registro?.idRegistroPago ?? registro?.id;
      if (!idEntidad) {
        alert("No hay id del registro para consultar archivos.");
        return;
      }

      setLoadingArchivoId(idEntidad);

      // ⬇️ Usa los nombres que espera tu endpoint: { idTEntidad, tipoEntidad }
      const res = await triggerGetArchivosByEntidad({
        idTEntidad: idEntidad,
        tipoEntidad: ENTIDAD_REGISTRO,
      }).unwrap();

      console.log(
        `Archivos (${ENTIDAD_REGISTRO}) ➜ idTEntidad:`,
        idEntidad,
        " ➜ data:",
        res
      );

      const archivos = Array.isArray(res) ? res : [];
      if (archivos.length === 0) {
        alert("No se encontraron archivos para este registro.");
        return;
      }

      // Tomamos el primer archivo con alguna URL reconocida
      const a0 = archivos[0] || {};
      const url = a0.url || a0.downloadUrl || a0.publicUrl || a0.fileUrl;
      if (!url) {
        alert("El archivo no tiene una URL disponible.");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error al obtener archivos del registro:", err);
      alert("No se pudieron obtener los archivos del registro.");
    } finally {
      setLoadingArchivoId(null);
    }
  },
  [triggerGetArchivosByEntidad]
);

  // console.log("REGISTROS DE PAGO --> ", registros);
  // console.log("ITEM TT --> ", item);

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={stop}>
        <div className="otri-modal-container">
          {step === "pagos" ? (
          <>
            <section
              className="otri-modal-body"
              style={{ maxHeight: "60vh", overflow: "auto" }}
            >
              {isBusy ? (
                <div className="loading">Cargando registros de pago...</div>
              ) : error || localError ? (
                <div className="error-message">
                  {localError || "No se pudieron cargar los registros de pago"}
                </div>
              ) : (
                <>
                  <div className="pago-summary" style={{ marginBottom: 12 }}>
                    <h1 className="titulo-principal-form">Pagos realizados</h1>
                    <p>
                      <strong>Total pagado hasta la fecha:</strong>{" "}
                      {money(total || 0)}
                    </p>
                    <p>
                      <strong>Cantidad de pagos registrados:</strong>{" "}
                      {registros.length}
                    </p>
                  </div>

                  {registros.length > 0 ? (
                    <table className="tabla-distribucion">
                      <thead>
                        <tr>
                          <th colSpan={4} className="beneficiarios">
                            PAGOS REALIZADOS
                          </th>
                        </tr>
                        <tr className="fila-subtotal-titulo">
                          <th>Fecha</th>
                          <th>Registrado por</th>
                          <th>Monto total pagado</th>
                          <th style={{ width: 120 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {registros.map((registro) => {
                          const idBtn = registro?.idRegistroPago ?? registro?.id;
                          const loadingThis = loadingArchivoId === idBtn;

                          return (
                            <tr className="autor-monto" key={registro.idRegistroPago}>
                              <td>
                                {registro.createdAt
                                  ? new Date(registro.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td>
                                {registro.nombrePersona
                                  ? `${registro.nombrePersona}`
                                  : "No hay datos"}
                              </td>
                              <td>{money(registro.totalPago ?? 0)}</td>
                              <td
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  justifyContent: "center",
                                }}
                              >
                                {/* Botón que cambia al modal de FACTURAS */}
                                <button
                                  className="btn-add-archivo"
                                  onClick={() => handleOpenFacturas(registro)}
                                  title="Ver Facturas"
                                  aria-label="Ver Facturas"
                                >
                                  <FileText />
                                </button>

                                {/* Botón que abre el primer archivo (URL) asociado al registro */}
                                <button
                                  className="btn-add-archivo"
                                  onClick={() => handleOpenArchivoRegistro(registro)}
                                  disabled={loadingThis}
                                  title={
                                    loadingThis
                                      ? "Buscando archivo…"
                                      : "Abrir archivo del registro"
                                  }
                                  aria-label={
                                    loadingThis
                                      ? "Buscando archivo…"
                                      : "Abrir archivo del registro"
                                  }
                                >
                                  <Sheet />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        <tr className="fila-subtotal-titulo">
                          <td className="subtotal" colSpan={2}>
                            Total Pagado:
                          </td>
                          <td>{money(total || 0)}</td>
                          <td style={{ textAlign: "center" }}>
                            {/* Botón general (si quisieras abrir un resumen global, puedes reutilizar handleOpenArchivoRegistro con un objeto sintético) */}
                            <button className="btn-add-archivo" title="Documentos o resumen">
                              <Sheet />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p>
                      No hay registros de pago para esta transferencia
                      tecnológica.
                    </p>
                  )}
                </>
              )}
            </section>

            <footer className="otri-modal-footer">
              <Buttons.RegisterButton onClick={onClose} text={"Cerrar"} />
            </footer>
          </>
        ) : (
          // ─────────── Modal de FACTURAS (paso interno) ───────────
          <ModalVerFacturas
            registroPago={selectedRegistro}
            onBack={handleBackToPagos}
            onClose={onClose}
          />
        )}

        </div>
        
      </div>
    </div>
  );
};

export default ModalVerPagos;
