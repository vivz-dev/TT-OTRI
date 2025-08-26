/**
 * Orquestador de Distribución de Pago (solo datos para la tabla)
 * --------------------------------------------------------------
 * Entrada esperada en la mutación:
 * {
 *   idTT: number | string,
 *   montoTotalRegistroPago: number,
 *   facturas?: Array<any>,
 *   idDistribucionResolucion?: number // por defecto 2
 * }
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

import { transfersApi } from './transfersApi';
import { technologiesApi } from './technologiesApi';
import { resolutionsApi } from './resolutionsApi';
import { distribucionesApi } from './distribucionesApi';
import { buscarAutoresTecnologia } from './buscarAutoresTecnologia';
import { acuerdosDistribAutoresApi } from './acuerdosDistribAutoresApi';
import { benefInstitucionesApi } from './benefInstitucionesApi';
import { autoresApi } from './autoresApi';

/* ───── helpers numéricos (sin centavos) ───── */

/* ───── API ───── */

export const distribucionPagoOrchestratorApi = createApi({
  reducerPath: 'distribucionPagoOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({

    computeDistribucionTabla: builder.mutation({
      async queryFn(args, api) {
        console.log('[ORQ] ▶ args recibidos:', args);

        try {
          const { idTT, montoTotalRegistroPago, idDistribucionResolucion = 2 } = args || {};
          if (!idTT) throw new Error('idTT es requerido');
          if (!Number.isFinite(Number(montoTotalRegistroPago))) throw new Error('montoTotalRegistroPago inválido');

          /* 1) Transferencia: idTecnologia, idResolucion */
          const tt = await api.dispatch(
            transfersApi.endpoints.getTransferById.initiate(idTT, { forceRefetch: true })
          ).unwrap();
          const idTecnologia =
            tt?.idTecnologia ?? tt?.idTechnology ?? tt?.tecnologiaId ?? tt?.id_tec ?? null;
          const idResolucion =
            tt?.idResolucion ?? tt?.resolucionId ?? tt?.id_res ?? null;
          console.log('[ORQ] 1) Transferencia:', { tt, idTecnologia, idResolucion });

          if (!idTecnologia || !idResolucion) {
            throw new Error('La transferencia no contiene idTecnologia o idResolucion');
          }

          /* 2) Tecnología (nombre/título) */
          const tec = await api.dispatch(
            technologiesApi.endpoints.getTechnology.initiate(idTecnologia, { forceRefetch: true })
          ).unwrap();
          const nombreTecnologia = tec?.titulo ?? tec?.nombre ?? '—';
          console.log('[ORQ] 2) Tecnología:', { idTecnologia, nombreTecnologia });

          /* 3) Resolución (código) */
          const res = await api.dispatch(
            resolutionsApi.endpoints.getResolutionById.initiate(idResolucion, { forceRefetch: true })
          ).unwrap();
          const codigoResolucion = res?.codigo ?? res?.codigoResolucion ?? '—';
          console.log('[ORQ] 3) Resolución:', { idResolucion, codigoResolucion });

          /* 4) Distribución por resolución */
          const distRes = await api.dispatch(
            distribucionesApi.endpoints.getDistributionById.initiate(idDistribucionResolucion, { forceRefetch: true })
          ).unwrap();

          // Mantengo la lógica original (sin normalizar ni convertir 60↔0.6)
          let porcSubtotalAutores = distRes.porcSubtotalAutores;
          let porcSubtotalInstit  = distRes.porcSubtotalInstitut;

          const porcOrig = {
            autores: distRes?.PorcSubtotalAutores ?? distRes?.porcSubtotalAutores,
            inst: distRes?.PorcSubtotalInstitut ?? distRes?.porcSubtotalInstitut,
          };

          console.log('[ORQ] 4) DistribuciónResolución:', {
            idDistribucionResolucion,
            porcOriginales: porcOrig,
            porcUsados: { porcSubtotalAutores, porcSubtotalInstit }
          });

          /* 5) Subtotales (sin centavos) */
          const total = montoTotalRegistroPago;
          const subtotalAutores = total * porcSubtotalAutores;
          const subtotalInstituciones = total * porcSubtotalInstit;
          console.log('[ORQ] 5) Subtotales:', { total, subtotalAutores, subtotalInstituciones });

          /* 9) Respuesta (payload final) */
          const dataTabla = {
            nombreTecnologia,
            codigoResolucion,
            subtotalAutores,
            subtotalInstituciones,
            total: total,
          };

          console.log('[ORQ] ✅ Payload tabla:', dataTabla);

        try {
          const listaAutores = await buscarAutoresTecnologia(api, {
            idTecnologia,
            subtotalAutores, // el que ya calculaste
          });
          console.log('[ORQ] ▶ Lista autores (desde servicio):', listaAutores);
          // si SOLO quieres log, no alteres el retorno; si quieres incluirlo en dataTabla, lo agregas.
        } catch (e) {
          console.warn('[ORQ] No fue posible obtener lista de autores:', e);
        }

          return { data: dataTabla };
        } catch (err) {
          console.error('[ORQ] ❌ Error computeDistribucionTabla:', err);
          console.timeEnd?.('[ORQ] computeDistribucionTabla');
          return { error: { status: 'CLIENT_ORCHESTRATION_ERROR', data: String(err?.message || err) } };
        }
      },
    }),

  }),
});

export const { useComputeDistribucionTablaMutation } = distribucionPagoOrchestratorApi;
