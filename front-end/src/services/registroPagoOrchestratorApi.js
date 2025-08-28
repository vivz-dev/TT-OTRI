// src/services/registroPagoOrchestratorApi.js

/**
 * Orchestrator para Registros de Pago - Filtrado por Transferencia Tecnológica
 * ----------------------------------------------------------------------------
 * Uso fuera de componentes:
 *   import { getRegistrosPagoByTT, getTotalPagosByTT } from './registroPagoOrchestratorApi';
 *   const rows = await getRegistrosPagoByTT(api, idTT);
 *   const total = await getTotalPagosByTT(api, idTT);
 */

import {
  registroPagoApi,
  useGetRegistrosPagoQuery,
  useGetRegistrosPagoWithPersonaQuery
} from './registroPagoApi';
import { useMemo, useCallback } from 'react';

// ⬇️ IMPORTA tu servicio existente (ajusta la ruta si es necesario)
import { getPersonaNameById } from './espolUsers'; // <-- cambia a la ruta real si difiere

/* ============================
 *  Helpers de enriquecimiento
 * ============================ */
async function withNombrePersonaOne(rec) {
  if (!rec || rec?.nombrePersona) return rec;
  const id = Number(rec?.idPersona);
  if (Number.isFinite(id) && id > 0) {
    try {
      const nombre = await getPersonaNameById(id);
      return { ...rec, nombrePersona: nombre };
    } catch {
      return { ...rec, nombrePersona: 'Usuario no disponible' };
    }
  }
  return { ...rec, nombrePersona: 'Usuario no disponible' };
}

async function withNombrePersonaMany(list) {
  const arr = Array.isArray(list) ? list : [];
  return Promise.all(arr.map(withNombrePersonaOne));
}

/* ============================
 *  Funciones puras (con api)
 * ============================ */

/**
 * Obtiene y filtra registros de pago por ID de transferencia tecnológica
 * + añade nombrePersona
 */
export async function getRegistrosPagoByTT(api, idTT) {
  const sub = api.dispatch(
    registroPagoApi.endpoints.getRegistrosPago.initiate(undefined, { forceRefetch: true })
  );
  try {
    const data = await sub.unwrap();
    const lista = Array.isArray(data) ? data : [];
    const idNum = Number(idTT);

    const registrosFiltrados = lista.filter(
      (r) => Number(r?.idTransferTecnologica) === idNum
    );

    // ⬇️ Enriquecer con nombrePersona SIN romper la forma original
    const enriquecidos = await withNombrePersonaMany(registrosFiltrados);

    // console.log(`[Orq-RegistrosPago] Registros (TT=${idNum})`, enriquecidos);
    return enriquecidos;
  } catch (error) {
    console.error('[Orq-RegistrosPago] Error al obtener registros de pago:', error);
    throw error;
  } finally {
    sub.unsubscribe();
  }
}

/**
 * Suma total de pagos para una TT
 */
export async function getTotalPagosByTT(api, idTT) {
  const registros = await getRegistrosPagoByTT(api, idTT);
  const total = registros.reduce((sum, r) => sum + Number(r?.totalPago ?? 0), 0);
  // console.log(`[Orq-RegistrosPago] Total de pagos para TT ID ${idTT}:`, total);
  return total;
}

/* ==========================================
 *  Hook para usar dentro de componentes React
 * ========================================== */

/**
 * Hook personalizado: trabaja con la cache de RTK Query
 * y expone helpers filtrados por TT. (No bloquea render)
 */
export function useRegistroPagoOrchestrator() {
  const { data: registros = [], isLoading, error, refetch } = useGetRegistrosPagoWithPersonaQuery();

  const getRegistrosByTT = useCallback(
    (idTT) => {
      const idNum = Number(idTT);
      return (registros || []).filter((r) => Number(r?.idTransferTecnologica) === idNum);
    },
    [registros]
  );

  const getTotalByTT = useCallback(
    (idTT) =>
      getRegistrosByTT(idTT).reduce((sum, r) => sum + Number(r?.totalPago ?? 0), 0),
    [getRegistrosByTT]
  );

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
