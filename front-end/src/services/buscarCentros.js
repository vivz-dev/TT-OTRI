// src/services/buscarCentros.js

/**
 * Servicio: buscarCentros
 * ---------------------------------
 * Uso:
 *   const centros = await buscarCentros(api, {
 *     idTecnologia,
 *     idsBenefInst, // [{ idBenefInst, montoBenefInst, porcentaje }, ...] (opcional: se usa para override del monto base)
 *   });
 *
 * - NO crea endpoints nuevos.
 * - Dentro del servicio: busca en idsBenefInst el item con idBenefInst === 1
 *   y toma su montoBenefInst como base (override local) para calcular montos por centro.
 * - Obtiene el acuerdo por tecnología (fallback a getAcuerdos) y filtra autores por acuerdoId.
 * - Calcula montos por centro: montoCentro = montoBaseCentros * porcUnidad (SIN normalizar 60↔0.6).
 * - Filtro final: si hay centros duplicados (mismo idCentro) y uno tiene monto 0 y otro ≠ 0,
 *   se quedan SOLO los de monto diferente de 0.
 * - Enriquecimiento final: agrega nombreCentro resolviéndolo por idCentro usando unidadesApi.getNombreUnidadById.
 */

import { acuerdosDistribAutoresApi } from './acuerdosDistribAutoresApi';
import { autoresApi } from './autoresApi';
import { unidadesApi } from './unidadesApi';

export async function buscarCentros(api, params = {}) {
  const { idTecnologia, idsBenefInst } = params || {};

  if (!idTecnologia) throw new Error('idTecnologia es requerido');

  let montoCentros = 0;

  // 0) Override del BenefInstitucion con id = 1 (toma como monto base para centros)
  const targetId = 1;
  const listaBI = Array.isArray(idsBenefInst) ? idsBenefInst.map(x => ({ ...x })) : [];
  const idx = listaBI.findIndex(x => String(x?.idBenefInst) === String(targetId));
  if (idx >= 0) {
    const prev = listaBI[idx]?.montoBenefInst;
    console.log('[BUSCAR-CENTROS] ✔ Override monto base centros con idBenefInst=1:', {
      prev,
      now: listaBI[idx].montoBenefInst,
    });
    montoCentros = prev;
  } else {
    console.warn('[BUSCAR-CENTROS] Aviso: no se encontró idBenefInst=1 en la lista proporcionada.');
  }

  // 1) Buscar acuerdo por tecnología (endpoint directo si existe; si no, fallback a listado)
  let acuerdo = null;
  try {
    const resp = await api
      .dispatch(
        acuerdosDistribAutoresApi.endpoints.getAcuerdoByTecnologiaId.initiate(idTecnologia, { forceRefetch: true })
      )
      .unwrap();
    acuerdo = resp || null;
  } catch (e) {
    console.warn('[BUSCAR-CENTROS] Aviso: getAcuerdoByTecnologiaId no disponible. Fallback a getAcuerdos…', e?.message || e);
  }

  if (!acuerdo) {
    const todos = await api
      .dispatch(acuerdosDistribAutoresApi.endpoints.getAcuerdos.initiate(undefined, { forceRefetch: true }))
      .unwrap();
    const lista = Array.isArray(todos) ? todos : [];
    acuerdo = lista.find(a => {
      const idTecA = a?.idTecnologia ?? a?.tecnologiaId ?? a?.idTec ?? a?.id_tec ?? null;
      return String(idTecA) === String(idTecnologia);
    }) || null;
  }

  const acuerdoId = acuerdo?.id ?? acuerdo?.acuerdoId ?? acuerdo?.idAcuerdo ?? null;
  if (!acuerdoId) throw new Error('No se encontró acuerdo de distribución para la tecnología indicada');

  // 2) Traer TODOS los autores y filtrar por acuerdo
  const todosAutores = await api
    .dispatch(autoresApi.endpoints.getAutores.initiate(undefined, { forceRefetch: true }))
    .unwrap();

  const listaAutores = Array.isArray(todosAutores) ? todosAutores : [];
  const autoresDelAcuerdo = listaAutores.filter(a => String(a?.idAcuerdoDistrib) === String(acuerdoId));

  // 3) Construir lista base de centros (SIN normalizar 60↔0.6)
  const centros = autoresDelAcuerdo.map(a => {
    const porcUnidad = Number(a?.porcUnidad ?? 0); // tal cual viene
    const idCentro = a?.idUnidad ?? null;
    const montoCentro = Number(montoCentros) * porcUnidad;

    return {
      idCentro,
      montoCentro, // montoBaseCentros * porcUnidad
    };
  });

  // 4) FILTRO FINAL solicitado:
  //    - Si hay al menos dos elementos con mismo idCentro y
  //      existe al menos uno con monto 0 y otro con monto ≠ 0,
  //      se eliminan los de monto 0 y se mantienen los ≠ 0.
  const grupos = centros.reduce((acc, item) => {
    const key = String(item?.idCentro ?? '');
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  const filtrados = [];
  for (const key of Object.keys(grupos)) {
    const items = grupos[key];
    const zeros = items.filter(x => Number(x?.montoCentro) === 0);
    const nonZeros = items.filter(x => Number(x?.montoCentro) !== 0);

    if (items.length >= 2 && zeros.length >= 1 && nonZeros.length >= 1) {
      filtrados.push(...nonZeros);
    } else {
      filtrados.push(...items);
    }
  }

  // 5) Enriquecer con nombreCentro (lookup por cada idCentro usando unidadesApi.getNombreUnidadById)
  const uniqueIds = Array.from(new Set(filtrados.map(i => String(i.idCentro ?? '')))).filter(s => s !== '');
  const nombreMap = {};

  await Promise.all(
    uniqueIds.map(async (idStr) => {
      const idNumOrStr = isNaN(Number(idStr)) ? idStr : Number(idStr);
      try {
        const nombre = await api
          .dispatch(unidadesApi.endpoints.getNombreUnidadById.initiate(idNumOrStr, { forceRefetch: true }))
          .unwrap();
        nombreMap[idStr] = (typeof nombre === 'string' && nombre.trim()) ? nombre : '—';
      } catch (e) {
        nombreMap[idStr] = '—';
      }
    })
  );

  const enriquecidos = filtrados.map(item => ({
    ...item,
    nombreCentro: nombreMap[String(item.idCentro ?? '')] ?? '—',
  }));

  // console.log('[BUSCAR-CENTROS] ✅ Centros (post-filtro + nombreCentro):', enriquecidos);
  return enriquecidos;
}
