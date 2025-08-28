/**
 * Orquestador: crea RegistroPago + Facturas + Archivos por factura
 * Reglas:
 *   - Primero crea /registros-pago -> obtiene idRegistroPago
 *   - Luego crea cada /facturas con { IdRegistroPago, Monto, FechaFactura }
 *   - Luego sube archivos por factura usando uploadAndSaveArchivo:
 *        meta: { idTEntidad: idFactura, tipoEntidad: 'F', idColeccion }
 * Consistencia:
 *   - Si falla algún paso, intenta compensar (DELETE facturas y/o registro de pago).
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';
import { uploadAndSaveArchivo } from './storage/archivosOrchestrator';

// Utils
const isNullish = (v) => v === null || v === undefined;
const formatDateOnly = (d) => {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Endpoints por defecto
const DEFAULTS = {
  registrosPagoUrl: '/registros-pago',
  facturasUrl: '/facturas',
  archivosBackendUrl: '/archivos',
  dspaceUrl: 'https://wsarchivos.espol.edu.ec/api/DspaceFile/SubirArchivo',
  tipoEntidadArchivo: 'F', // forzamos 'F'
  idColeccion: 155,
  compensateOnError: true,
  stopOnFirstError: true,
};

export const pagosOrchestratorApi = createApi({
  reducerPath: 'pagosOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createPagoFacturasYArchivos: builder.mutation({
      async queryFn(payload, _api, _extra, baseQuery) {
        const created = {
          registroPagoId: null,
          facturaIds: [],
        };

        const {
          pago,
          facturas = [],
          filesByFacturaIndex = {},
          options: opt = {},
        } = payload || {};

        const cfg = { ...DEFAULTS, ...opt };

        // helpers HTTP con baseQuery
        const doPost = (url, body) => baseQuery({ url, method: 'POST', body });
        const doDelete = (url) => baseQuery({ url, method: 'DELETE' });

        // wrappers para uploadAndSaveArchivo
        const uploadToDspace = async (dspacePayload) =>
          baseQuery({
            url: cfg.dspaceUrl,
            method: 'POST',
            body: dspacePayload,
          });

        const createArchivo = async (createDto) =>
          baseQuery({
            url: cfg.archivosBackendUrl,
            method: 'POST',
            body: createDto,
          });

        const compensate = async () => {
          if (!cfg.compensateOnError) return;
          for (const fid of created.facturaIds.reverse()) {
            try {
              await doDelete(`${cfg.facturasUrl}/${fid}`);
            } catch {}
          }
          if (created.registroPagoId) {
            try {
              await doDelete(`${cfg.registrosPagoUrl}/${created.registroPagoId}`);
            } catch {}
          }
        };

        try {
          if (!pago || isNullish(pago.idPersona) || isNullish(pago.idTT)) {
            return { error: { status: 400, data: 'Payload inválido: falta "pago" con idPersona e idTT.' } };
          }

          // 1) REGISTRO DE PAGO
          const bodyPago = {
            IdTransferTecnologica: Number(pago.idTT),
            IdPersona: Number(pago.idPersona),
            TotalPago: Number(pago.totalPago ?? 0),
            Completado: false,
          };

          const resPago = await doPost(cfg.registrosPagoUrl, bodyPago);
          if (resPago.error) return { error: resPago.error };

          const registroPagoIdRaw =
            normalizeId(resPago.data) ??
            resPago.data?.id ??
            resPago.data?.Id ??
            resPago.data?.idRegistroPago ??
            null;

          const registroPagoId = Number(registroPagoIdRaw);
          if (!Number.isFinite(registroPagoId)) {
            await compensate();
            return { error: { status: 500, data: 'No se obtuvo idRegistroPago válido.' } };
          }
          created.registroPagoId = registroPagoId;

          // 2) FACTURAS + ARCHIVOS
          const facturasResult = [];

          for (let i = 0; i < facturas.length; i++) {
            const f = facturas[i] || {};
            const fecha = formatDateOnly(f.fechaFactura);
            const bodyFactura = {
              idRegistroPago: registroPagoId,
              Monto: Number(f.monto ?? 0),
              FechaFactura: fecha,
            };

            const resFac = await doPost(cfg.facturasUrl, bodyFactura);
            if (resFac.error) {
              await compensate();
              return { error: resFac.error };
            }

            const facturaIdRaw =
              normalizeId(resFac.data) ??
              resFac.data?.id ??
              resFac.data?.Id ??
              resFac.data?.IdFactura ??
              null;

            const facturaId = Number(facturaIdRaw);
            if (!Number.isFinite(facturaId)) {
              await compensate();
              return { error: { status: 500, data: `No se obtuvo idFactura válido en la creación #${i + 1}.` } };
            }
            created.facturaIds.push(facturaId);

            // 3) ARCHIVOS de esta factura
            const archivos =
              Array.isArray(f.archivos) && f.archivos.length
                ? f.archivos
                : Array.isArray(filesByFacturaIndex?.[f.index])
                ? filesByFacturaIndex[f.index]
                : [];

            const archivosResults = [];
            for (let k = 0; k < archivos.length; k++) {
              const file = archivos[k];
              try {
                const meta = {
                  idTEntidad: facturaId,     // ← id de la factura
                  entityId: facturaId,       // alias
                  tipoEntidad: 'F',          // ← forzamos F
                  TipoEntidad: 'F',
                  idColeccion: cfg.idColeccion,
                };

                console.log('[ORQ] Subida archivo → factura', {
                  facturaIndex: i + 1,
                  facturaId,
                  meta,
                });

                const up = await uploadAndSaveArchivo({
                  file,
                  meta,
                  uploadToDspace,
                  createArchivo,
                });

                archivosResults.push(up);
              } catch (e) {
                if (cfg.stopOnFirstError) {
                  await compensate();
                  return {
                    error: {
                      status: 500,
                      data: e?.message || `Falló la subida de archivo en factura #${i + 1}`,
                    },
                  };
                } else {
                  archivosResults.push({ error: e?.message || 'Error subiendo archivo' });
                }
              }
            }

            facturasResult.push({
              facturaId,
              raw: resFac.data,
              archivos: archivosResults,
            });
          }

          return {
            data: {
              registroPagoId,
              rawPago: resPago.data,
              facturas: facturasResult,
            },
          };
        } catch (e) {
          await compensate();
          return { error: { status: 500, data: e?.message ?? 'Error en orquestador' } };
        }
      },
    }),
  }),
});

export const { useCreatePagoFacturasYArchivosMutation } = pagosOrchestratorApi;
