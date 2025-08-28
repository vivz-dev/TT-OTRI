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
import { buscarInstituciones } from './buscarInstituciones';
import { buscarCentros } from './buscarCentros';

/* ───── helpers numéricos (sin centavos) ───── */

/* ───── API ───── */

export const distribucionPagoOrchestratorApi = createApi({
  reducerPath: 'distribucionPagoOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({

    computeDistribucionTabla: builder.mutation({
      async queryFn(args, api) {
        try {
          const { idTT, montoTotalRegistroPago } = args || {};
          if (!idTT) throw new Error('idTT es requerido');
          if (!Number.isFinite(Number(montoTotalRegistroPago))) throw new Error('montoTotalRegistroPago inválido');

          /* 1) Transferencia: idTecnologia, idResolucion */
          const tt = await api.dispatch(
            transfersApi.endpoints.getTransferById.initiate(idTT, { forceRefetch: true })
          ).unwrap();

          // 🔎 Log completo de la TT por idTT (para depuración)
          console.log('[ORQ] 1) TT por idTT (objeto completo):', tt);

          const idTecnologia =
            tt?.idTecnologia ?? tt?.idTechnology ?? tt?.tecnologiaId ?? tt?.id_tec ?? null;
          const idResolucion =
            tt?.idResolucion ?? tt?.resolucionId ?? tt?.id_res ?? null;
          const idDistribucionResolucion = tt?.idDistribucionResolucion ?? null;

          if (!idTecnologia || !idResolucion) {
            throw new Error('La transferencia no contiene idTecnologia o idResolucion');
          }

          /* 2) Tecnología (nombre/título) */
          const tec = await api.dispatch(
            technologiesApi.endpoints.getTechnology.initiate(idTecnologia, { forceRefetch: true })
          ).unwrap();
          const nombreTecnologia = tec?.titulo ?? tec?.nombre ?? '—';

          /* 3) Resolución (código) */
          const res = await api.dispatch(
            resolutionsApi.endpoints.getResolutionById.initiate(idResolucion, { forceRefetch: true })
          ).unwrap();
          const codigoResolucion = res?.codigo ?? res?.codigoResolucion ?? '—';

          /* 4) Distribución por resolución */
          const distRes = await api.dispatch(
            distribucionesApi.endpoints.getDistributionById.initiate(idDistribucionResolucion, { forceRefetch: true })
          ).unwrap();

          console.log('Distribucion por resolucion ---> ', distRes);

          // Mantengo la lógica original (sin normalizar ni convertir 60↔0.6)
          const porcSubtotalAutores = distRes.porcSubtotalAutores;
          const porcSubtotalInstit  = distRes.porcSubtotalInstitut;

          const total = montoTotalRegistroPago;
          const subtotalAutores = total * porcSubtotalAutores;
          const subtotalInstituciones = total * porcSubtotalInstit;

          /* 6) Autores */
          const listaAutores = await buscarAutoresTecnologia(api, {
            idTecnologia,
            subtotalAutores, // el que ya calculaste
          });

          /* 7) Instituciones (antes de filtrar id=1) */
          const idsBenefInst = await buscarInstituciones(api, {
            idTransferencia: idTT,
            total,
          });

          /* 8) Centros (usa idsBenefInst para calcular monto base por centro) */
          const listaCentros = await buscarCentros(api, {
            idTecnologia,
            idsBenefInst
          });
          // console.log('[ORQ] ▶ Lista listaCentros (desde servicio):', listaCentros);

          /* 8.1) Eliminar de idsBenefInst el item con idBenefInst === 1 */
          const instituciones = Array.isArray(idsBenefInst)
            ? idsBenefInst.filter(x => String(x?.idBenefInst) !== '1')
            : [];
          // console.log('[ORQ] ▶ Instituciones (sin idBenefInst=1):', instituciones);

          /* 9) Respuesta (payload final) */
          const dataTabla = {
            nombreTecnologia,
            codigoResolucion,
            subtotalAutores,
            autores: listaAutores,
            instituciones,          // ← ya sin el item id=1
            centros: listaCentros,
            subtotalInstituciones,
            total: total,
          };

          // console.log('[ORQ] ✅ Payload tabla:', dataTabla);

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
