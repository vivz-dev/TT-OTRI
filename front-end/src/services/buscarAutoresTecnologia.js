// src/services/buscarAutoresTecnologia.js

/**
 * Servicio: buscarAutoresTecnologia
 * ---------------------------------
 * Uso: await buscarAutoresTecnologia(api, { idTecnologia, subtotalAutores })
 *
 * - NO crea endpoints nuevos.
 * - Consume acuerdosDistribAutoresApi ya existente:
 *    - getAcuerdoByTecnologiaId (si existe en backend)
 *    - fallback: getAcuerdos y filtra por idTecnologia
 *    - getAutoresByAcuerdoId para traer autores del acuerdo
 * - NO normaliza porcentajes (60 se usa como 60).
 */

import { acuerdosDistribAutoresApi } from './acuerdosDistribAutoresApi';
import { autoresApi } from './autoresApi';

/**
 * @param {any} api - objeto `api` que recibes dentro de queryFn de RTK Query (builder.mutation/query)
 * @param {{ idTecnologia: number|string, subtotalAutores: number }} params
 * @returns {Promise<Array<{
 *   acuerdoId: number|string,
 *   idPersona: number|string|null,
 *   porcAutor: number,
 *   montoAutor: number,
 *   debug: { subtotalAutores: number, formula: string }
 * }>>}
 */
export async function buscarAutoresTecnologia(api, params) {
  const { idTecnologia, subtotalAutores } = params || {};
  console.log('[BUSCAR-AUT] ▶ params:', { idTecnologia, subtotalAutores });

  if (!idTecnologia) throw new Error('idTecnologia es requerido');
  if (!Number.isFinite(Number(subtotalAutores))) {
    throw new Error('subtotalAutores inválido');
  }

  // 1) Intento directo: acuerdo por tecnología
  let acuerdo = null;
  try {
    const resp = await api
      .dispatch(
        acuerdosDistribAutoresApi.endpoints.getAcuerdoByTecnologiaId.initiate(
          idTecnologia,
          { forceRefetch: true }
        )
      )
      .unwrap();
    acuerdo = resp || null;
    console.log('[BUSCAR-AUT] 1) Acuerdo por tecnología (directo):', acuerdo);
  } catch (e) {
    console.warn('[BUSCAR-AUT] Aviso: getAcuerdoByTecnologiaId falló o no está disponible. Probando fallback…', e);
  }

  // 1.1) Fallback: traer todos y filtrar por idTecnologia
  if (!acuerdo) {
    const todos = await api
      .dispatch(acuerdosDistribAutoresApi.endpoints.getAcuerdos.initiate(undefined, { forceRefetch: true }))
      .unwrap();

    const lista = Array.isArray(todos) ? todos : [];
    console.log('[BUSCAR-AUT] Fallback: total acuerdos obtenidos:', lista.length);

    acuerdo = lista.find(a => {
      const idTecA =
        a?.idTecnologia ?? a?.tecnologiaId ?? a?.idTec ?? a?.id_tec ?? null;
      return String(idTecA) === String(idTecnologia);
    }) || null;

    console.log('[BUSCAR-AUT] Fallback: acuerdo encontrado:', acuerdo);
  }

  const acuerdoId = acuerdo?.id ?? acuerdo?.acuerdoId ?? acuerdo?.idAcuerdo ?? null;
  if (!acuerdoId) {
    throw new Error('No se encontró acuerdo de distribución para la tecnología indicada');
  }

  // 1) Traer TODOS los autores (único fetch)
  const todos = await api
    .dispatch(autoresApi.endpoints.getAutores.initiate(undefined, { forceRefetch: true }))
    .unwrap();
    

  const lista = Array.isArray(todos) ? todos : [];
  console.log('[BUSCAR-AUT] Total autores obtenidos:', lista.length);

  // 2) Filtrar por acuerdoId (campo normalizado por toAutorItem: idAcuerdoDistrib)
  const autoresDelAcuerdo = lista.filter(a => String(a?.idAcuerdoDistrib) === String(acuerdoId));
  console.log('[BUSCAR-AUT] Autores filtrados por acuerdoId:', {
    acuerdoId,
    total: autoresDelAcuerdo.length,
    autores: autoresDelAcuerdo,
  });


  // 3) Construir lista con montos por autor (SIN normalizar 60↔0.6)
  const listaMontos = autoresDelAcuerdo.map(a => {
    const porcAutor =
      a?.porcAutor ?? a?.porcentaje ?? a?.porcentajeAutor ?? 0; // tal cual
    const idPersona =
      a?.idPersona ?? a?.personaId ?? a?.id_autor ?? null;

    const montoAutor = Number(subtotalAutores) * Number(porcAutor);

    return {
      idPersona,
      montoAutor,     // subtotalAutores * porcAutor
    };
  });
  return listaMontos;
}
