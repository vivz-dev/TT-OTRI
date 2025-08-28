// src/services/registroPagoOrchestratorApi.js

/**
 * Orchestrator para Registros de Pago - Filtrado por Transferencia Tecnológica
 * ----------------------------------------------------------------------------
 * Uso fuera de componentes (por ejemplo en thunks/sagas/otros orquestadores):
 *
 *   import { getRegistrosPagoByTT, getTotalPagosByTT } from './registroPagoOrchestratorApi';
 *   const rows = await getRegistrosPagoByTT(api, idTT);
 *   const total = await getTotalPagosByTT(api, idTT);
 *
 * Donde `api` es tu store RTK con .dispatch (el mismo que usas en otros orquestadores):
 *   api.dispatch(registroPagoApi.endpoints.X.initiate(...))
 */

import { registroPagoApi, useGetRegistrosPagoQuery } from './registroPagoApi';
import { useMemo, useCallback } from 'react';

/* ============================
 *  Funciones puras (con api)
 * ============================ */

/**
 * Obtiene y filtra registros de pago por ID de transferencia tecnológica
 * @param {any} api - Store RTK con .dispatch
 * @param {number|string} idTT - ID de la transferencia tecnológica
 * @returns {Promise<Array>} - Registros filtrados
 */
export async function getRegistrosPagoByTT(api, idTT) {
  // Suscribir la query manualmente y poder hacer unwrap/unsubscribe
  const sub = api.dispatch(
    registroPagoApi.endpoints.getRegistrosPago.initiate(undefined, { forceRefetch: true })
  );
  try {
    const data = await sub.unwrap(); // <-- aquí obtienes los datos
    const lista = Array.isArray(data) ? data : [];

    // normalizamos por si idTT viene como string/number
    const idNum = Number(idTT);
    const registrosFiltrados = lista.filter(
      (r) => Number(r?.idTransferTecnologica) === idNum
    );

    // console.log(`[Orq-RegistrosPago] Registros de pago para TT ID ${idNum}:`, registrosFiltrados);
    return registrosFiltrados;
  } catch (error) {
    console.error('[Orq-RegistrosPago] Error al obtener registros de pago:', error);
    throw error;
  } finally {
    // Evita fugas de memoria
    sub.unsubscribe();
  }
}

/**
 * Suma total de pagos para una TT
 * @param {any} api - Store RTK con .dispatch
 * @param {number|string} idTT
 * @returns {Promise<number>}
 */
export async function getTotalPagosByTT(api, idTT) {
  const registros = await getRegistrosPagoByTT(api, idTT);
  const total = registros.reduce((sum, r) => sum + Number(r?.totalPago ?? 0), 0);
  console.log(`[Orq-RegistrosPago] Total de pagos para TT ID ${idTT}:`, total);
  return total;
}

/* ==========================================
 *  Hook para usar dentro de componentes React
 * ========================================== */


/**
 * Hook personalizado: trabaja con la cache de RTK Query
 * y expone helpers filtrados por TT.
 */
export function useRegistroPagoOrchestrator() {
  const { data: registros = [], isLoading, error, refetch } = useGetRegistrosPagoQuery();

  const getRegistrosByTT = useCallback(
    (idTT) => {
      const idNum = Number(idTT);
      return (registros || []).filter((r) => Number(r?.idTransferTecnologica) === idNum);
    },
    [registros]
  );

  const getTotalByTT = useCallback(
    (idTT) => getRegistrosByTT(idTT).reduce((sum, r) => sum + Number(r?.totalPago ?? 0), 0),
    [getRegistrosByTT]
  );

  // También puedes exponer una versión memoizada del último filtro si te sirve
  const makeSelector = useCallback(
    (idTT) => ({
      registros: getRegistrosByTT(idTT),
      total: getTotalByTT(idTT),
    }),
    [getRegistrosByTT, getTotalByTT]
  );

  return {
    registros,
    isLoading,
    error,
    refetch,
    getRegistrosByTT,
    getTotalByTT,
    makeSelector,
  };
}
