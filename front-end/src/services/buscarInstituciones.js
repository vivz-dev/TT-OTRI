// src/services/buscarInstituciones.js

/**
 * Servicio: buscarInstituciones
 * -----------------------------
 * Uso:
 *   const lista = await buscarInstituciones(api, {
 *     transferencia: ttItem,           // (opcional) objeto TT
 *     idTransferencia: 123,            // (opcional) si no tienes el item
 *     // idDistribucionResolucion: 41  // (opcional) si ya lo conoces
 *     subtotalInstituciones: 1000,     // (requerido) monto para multiplicar por porcentaje
 *   });
 *
 * - NO crea endpoints nuevos.
 * - Obtiene idDistribucionResolucion desde la TT (cuando exista).
 * - Mientras no exista, lo reemplaza por 41 (hardcode) y lo LOGUEA.
 * - Hace GET ALL a distribBenefInstituciones y filtra por idDistribucionResolucion.
 * - Devuelve [{ idBenefInst, montoBenefInst, porcentaje }].
 * - NO normaliza porcentajes (60 se usa 60).
 */

import { distribBenefInstitucionesApi } from './distribBenefInstitucionesApi';
import { transfersApi } from './transfersApi'; // para resolver la TT cuando solo envías id

/** Helper: lectura tolerante a casing/nombres */
const getAny = (obj, ...keys) =>
  keys.reduce((acc, k) => (acc !== undefined ? acc : obj?.[k]), undefined);

/**
 * @param {any} api - Objeto RTK (el `api` que recibes en queryFn/mutation)
 * @param {{
 *   transferencia?: any,
 *   idTransferencia?: number|string,
 *   idDistribucionResolucion?: number|string,
 *   subtotalInstituciones: number
 * }} params
 * @returns {Promise<Array<{idBenefInst: number|string, montoBenefInst: number, porcentaje: number}>>}
 */
export async function buscarInstituciones(api, params = {}) {
  const {
    transferencia: ttItemParam,
    idTransferencia,
    idDistribucionResolucion: idDistParam,
    subtotalInstituciones,
  } = params;

  // console.log('[BUSCAR-INST] ▶ params:', {
  //   tieneItem: !!ttItemParam,
  //   idTransferencia,
  //   idDistribucionResolucionParam: idDistParam,
  //   subtotalInstituciones,
  // });

  if (!Number.isFinite(Number(subtotalInstituciones))) {
    throw new Error('subtotalInstituciones inválido');
  }

  // 1) Resolver TT si solo pasaron idTransferencia (opcional)
  let ttItem = ttItemParam;
  if (!ttItem && idTransferencia != null) {
    try {
      ttItem = await api
        .dispatch(transfersApi.endpoints.getTransferById.initiate(idTransferencia, { forceRefetch: true }))
        .unwrap();
      // console.log('[BUSCAR-INST] 1) Transferencia obtenida por id:', ttItem);
    } catch (e) {
      console.warn('[BUSCAR-INST] Aviso: no se pudo obtener la transferencia por idTransferencia:', e);
    }
  }

  // 2) Intentar obtener idDistribucionResolucion desde la TT (dejado para el futuro)
  let idDistribucionResolucion =
    idDistParam ??
    getAny(
      ttItem,
      'IDOTRITTDISTRIBUCIONRESOLUCION',
      'idOtriTtDistribucionResolucion',
      'idDistribucionResolucion'
    );

  // 2.1) Mientras no exista, hardcode a 41
  if (idDistribucionResolucion == null || idDistribucionResolucion === '') {
    console.warn('[BUSCAR-INST] Campo idDistribucionResolucion no existe aún en TT. Se reemplaza por 41 (hardcode).');
    idDistribucionResolucion = 41;
  }

  // console.log('[BUSCAR-INST] idDistribucionResolucion a usar:', idDistribucionResolucion);

  // 3) Traer TODOS los registros de DistribBenefInstituciones
  const all = await api
    .dispatch(
      distribBenefInstitucionesApi.endpoints.getAllDistribBenefInstituciones.initiate(undefined, { forceRefetch: true })
    )
    .unwrap();

  const lista = Array.isArray(all) ? all : [];
  // console.log('[BUSCAR-INST] Total registros distribBenefInstituciones:', lista.length);

  // 4) Filtrar por idDistribucionResolucion (tolerante a casing/nombres)
  const filtrados = lista.filter((x) => {
    const idDistX =
      getAny(x, 'idDistribucionResolucion', 'IdDistribucionResolucion', 'idDistribucion', 'IdDistribucion') ??
      null;
    return String(idDistX) === String(idDistribucionResolucion);
  });

  // console.log('[BUSCAR-INST] Registros filtrados por idDistribucionResolucion:', {
  //   idDistribucionResolucion,
  //   total: filtrados.length,
  //   items: filtrados,
  // });

  // 5) Construir salida: id + porcentaje + montoBenefInst
  const out = filtrados
    .map((x) => {
      const idBenefInst = getAny(
        x,
        'idBenefInstitucion',
        'IdBenefInstitucion',
        'benefInstitucionId',
        'BenefInstitucionId',
        'idBenefInst',
        'IdBenefInst'
      );

      // porcentaje tal cual (sin normalizar). Buscamos claves comunes.
      const porcentajeRaw = getAny(
        x,
        'porcentaje',
        'Porcentaje',
        'porc',
        'Porc',
        'porcBenefInstitucion',
        'PorcBenefInstitucion',
        'porcInstitucion',
        'PorcInstitucion',
        'porcBenef',
        'PorcBenef'
      );

      const porcentaje = Number(porcentajeRaw ?? 0);
      const montoBenefInst = Number(subtotalInstituciones) * porcentaje;

      if (idBenefInst == null) return null;

      return {
        idBenefInst,
        montoBenefInst,
        // opcional: debug
        // debug: { subtotalInstituciones, formula: 'montoBenefInst = subtotalInstituciones * porcentaje (SIN normalizar)' }
      };
    })
    .filter(Boolean);

  // console.log('[BUSCAR-INST] ✅ Resultado (id, porcentaje, monto):', out);
  return out;
}
