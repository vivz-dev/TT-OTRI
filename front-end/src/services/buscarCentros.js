// src/services/buscarCentros.js

/**
 * Servicio: buscarCentros
 * ---------------------------------
 * Uso:
 *   const centros = await buscarCentros(api, {
 *     idTecnologia,
 *     subtotalInstituciones,
 *     benefInstituciones, // [{ idBenefInst, montoBenefInst, porcentaje }, ...]
 *   });
 *
 * - NO crea endpoints nuevos.
 * - Dentro del servicio: busca en benefInstituciones el item con idBenefInst === 1
 *   y le reemplaza su montoBenefInst por subtotalInstituciones (override local).
 * - Obtiene el acuerdo por tecnología (fallback a getAcuerdos) y filtra autores por acuerdoId.
 * - Calcula montos por centro: montoCentro = subtotalInstituciones * porcUnidad (SIN normalizar).
 */

import { acuerdosDistribAutoresApi } from './acuerdosDistribAutoresApi';
import { autoresApi } from './autoresApi';

export async function buscarCentros(api, params = {}) {
  const { idTecnologia, subtotalInstituciones, idsBenefInst } = params || {};
  console.log('[BUSCAR-CENTROS] ▶ params:', { idTecnologia, subtotalInstituciones, hasBenefList: Array.isArray(idsBenefInst) });

  if (!idTecnologia) throw new Error('idTecnologia es requerido');
  if (!Number.isFinite(Number(subtotalInstituciones))) throw new Error('subtotalInstituciones inválido');

  // 0) Override del BenefInstitucion con id = 1
  const targetId = 1;
  const listaBI = Array.isArray(idsBenefInst) ? idsBenefInst.map(x => ({ ...x })) : [];
  const idx = listaBI.findIndex(x => String(x?.idBenefInst) === String(targetId));
  if (idx >= 0) {
    const prev = listaBI[idx]?.montoBenefInst;
    listaBI[idx].montoBenefInst = Number(subtotalInstituciones);
    console.log('[BUSCAR-CENTROS] ✔ Override montoBenefInst en idBenefInst=1:', {
      prev,
      now: listaBI[idx].montoBenefInst,
      porcentaje: listaBI[idx]?.porcentaje
    });
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
    console.log('[BUSCAR-CENTROS] 1) Acuerdo por tecnología (directo):', acuerdo);
  } catch (e) {
    console.warn('[BUSCAR-CENTROS] Aviso: getAcuerdoByTecnologiaId no disponible. Fallback a getAcuerdos…', e?.message || e);
  }

  if (!acuerdo) {
    const todos = await api
      .dispatch(acuerdosDistribAutoresApi.endpoints.getAcuerdos.initiate(undefined, { forceRefetch: true }))
      .unwrap();
    const lista = Array.isArray(todos) ? todos : [];
    console.log('[BUSCAR-CENTROS] Fallback: total acuerdos obtenidos:', lista.length);

    acuerdo = lista.find(a => {
      const idTecA = a?.idTecnologia ?? a?.tecnologiaId ?? a?.idTec ?? a?.id_tec ?? null;
      return String(idTecA) === String(idTecnologia);
    }) || null;

    console.log('[BUSCAR-CENTROS] Fallback: acuerdo encontrado:', acuerdo);
  }

  const acuerdoId = acuerdo?.id ?? acuerdo?.acuerdoId ?? acuerdo?.idAcuerdo ?? null;
  if (!acuerdoId) throw new Error('No se encontró acuerdo de distribución para la tecnología indicada');

  // 2) Traer TODOS los autores y filtrar por acuerdo
  const todosAutores = await api
    .dispatch(autoresApi.endpoints.getAutores.initiate(undefined, { forceRefetch: true }))
    .unwrap();

  const listaAutores = Array.isArray(todosAutores) ? todosAutores : [];
  console.log('[BUSCAR-CENTROS] Total autores obtenidos:', listaAutores.length);

  const autoresDelAcuerdo = listaAutores.filter(a => String(a?.idAcuerdoDistrib) === String(acuerdoId));
  console.log('[BUSCAR-CENTROS] Autores filtrados por acuerdoId:', {
    acuerdoId,
    total: autoresDelAcuerdo.length,
    autores: autoresDelAcuerdo
  });

  // 3) Construir lista de centros (SIN normalizar 60↔0.6)
  const centros = autoresDelAcuerdo.map(a => {
    const porcUnidad = Number(a?.porcUnidad ?? 0); // tal cual viene
    const idCentro = a?.idUnidad ?? null;
    const montoCentro = Number(subtotalInstituciones) * porcUnidad;

    return {
      idCentro,
      montoCentro, // subtotalInstituciones * porcUnidad
    };
  });

  console.log('[BUSCAR-CENTROS] ✅ Centros (monto por unidad):', centros);
  return centros;
}
