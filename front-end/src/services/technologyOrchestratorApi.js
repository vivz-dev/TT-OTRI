// src/services/tecnologiaOrquestrator.js
// Orquestador End-to-End para crear Tecnología, Protecciones (con archivos),
// Cotitularidad (delegada al orquestador de cotitularidad) y
// Acuerdo de Distribución de Autores (con autores + archivo tipo 'D').

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { uploadAndSaveArchivo } from './storage/archivosOrchestrator';
import { archivosApi } from './storage/archivosApi';

const idOf = (obj) => obj?.id ?? obj?.Id ?? null;
const toInt = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : null; };
const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;
const toShort01 = (v) => (v === true ? 1 : v === false ? 0 : Number(v) > 0 ? 1 : 0);

// ⚙️ Configurable (override vía options del mutation arg si tu backend usa otras rutas)
const DEFAULT_ENDPOINTS = {
  dspaceUpload: 'dspace/upload',    // POST: payload DSpace
  archivos: 'archivos',             // POST: { nombre, formato, tamano, url, idTEntidad, tipoEntidad }
  tecnologias: 'tecnologias',       // POST: tecnología
  protecciones: '/protecciones',// POST: protección
  cotitularidadOrch: 'cotitularidad-orch', // opcional (si deseas route dedic.); NO usada aquí
  cotitularidadTecno: 'cotitularidad-tecno', // (lo usa el orquestador delegado)
  acuerdosDistribAutores: 'acuerdos-distrib-autores', // POST: acuerdo
  autores: 'autores',               // POST: autor
};

// Normaliza body de creación de tecnología
function buildCreateTecnologiaBody(tecnologia) {
  if (!tecnologia) return null;
  return {
    idPersona: tecnologia.idPersona,
    titulo: tecnologia.titulo,
    descripcion: tecnologia.descripcion,
    estado: tecnologia.estado,           // 'D'/'N'
    cotitularidad: !!tecnologia.cotitularidad,
    // backend suele llamarlo "completado"
    completado: !!tecnologia.completed,
  };
}

// Construye body de protección
function buildCreateProteccionBody(idTecnologia, p) {
  const body = {
    idTecnologia: Number(idTecnologia),
    idTipoProteccion: Number(p.idTipoProteccion),         // cabe en SMALLINT
    fechaSolicitud: p.fechaSolicitud ?? null,             // ISO 'YYYY-MM-DD' ok
    concesion: toShort01(p.concesion),                    // ← SHORT 0/1
    solicitud: toShort01(p.solicitud ?? true),            // ← SHORT 0/1 (default 1)
    fechaConcesion: p.concesion ? (p.fechaConcesion ?? null) : null,
  };
  return body;
}


/**
 * Sube y registra archivo usando *exclusivamente* el orquestador de archivos.
 * - entityId: id de la entidad destino (protección, cotitularidadTecno, acuerdo, etc.)
 * - tipoEntidad: 'PI' | 'CO' | 'D' | ...
 * - metaDSpace: { idColeccion, titulo, identificacion }
 */
async function orqUploadArchivo({ api, file, entityId, tipoEntidad, metaDSpace = {} }) {
  if (!file) return { ok: true, skipped: true };

  // Envuelve los endpoints RTKQ como funciones que devuelven { data } | { error }
  const uploadToDspace = async (payload) => {
    try {
      const data = await api.dispatch(archivosApi.endpoints.uploadToDspace.initiate(payload)).unwrap();
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const createArchivo = async (dto) => {
    try {
      const data = await api.dispatch(archivosApi.endpoints.createArchivo.initiate(dto)).unwrap();
      return { data };
    } catch (error) {
      return { error };
    }
  };

  // Metadatos; si en protecciones te llega identificacion numérica, no pasa nada:
  // el orq de archivos ya la castea a string.
  const meta = {
    idTEntidad: entityId,
    tipoEntidad,
    idColeccion: metaDSpace.idColeccion ?? 155,
    titulo: isNonEmpty(metaDSpace.titulo) ? metaDSpace.titulo : 'Documento',
    identificacion: String(metaDSpace.identificacion) ?? "",
  };

  try {
    const res = await uploadAndSaveArchivo({ file, meta, uploadToDspace, createArchivo });
    return { ok: true, data: res };
  } catch (e) {
    return { ok: false, error: { status: 500, data: e?.message || 'Error subiendo archivo' } };
  }
}


export const technologyOrchestratorApi = createApi({
  reducerPath: 'technologyOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /**
     * Ejecuta el flujo completo contra el backend.
     * args: {
     *   payload: <payload gigante>,
     *   options?: { endpoints?: Partial<DEFAULT_ENDPOINTS> }
     * }
     */
    createFullTechnologyFlow: builder.mutation({
      async queryFn(args, _api, _extra, baseQuery) {
        const payload = args?.payload ?? {};
        const endpoints = { ...DEFAULT_ENDPOINTS, ...(args?.options?.endpoints || {}) };

        // ───────────────────────── 1) Crear Tecnología ─────────────────────────
        const techBody = buildCreateTecnologiaBody(payload.tecnologia);
        if (!techBody) return { error: { status: 400, data: 'Falta bloque "tecnologia" en el payload.' } };

        const resTec = await baseQuery({
          url: endpoints.tecnologias,
          method: 'POST',
          body: techBody,
        });
        if (resTec.error) return { error: resTec.error };
        const idTecnologia = toInt(idOf(resTec.data));
        if (!idTecnologia) return { error: { status: 500, data: 'No se obtuvo idTecnologia.' } };

        // ───────────────────────── 2) Protecciones + 3) Archivos PI ────────────
        const protecciones = Array.isArray(payload.protecciones) ? payload.protecciones : [];
        const proteccionResults = [];

        for (const p of protecciones) {
          // 2) Crear protección
          const bodyProt = buildCreateProteccionBody(idTecnologia, p);
          const resProt = await baseQuery({
            url: endpoints.protecciones,
            method: 'POST',
            body: bodyProt,
          });
          if (resProt.error) return { error: resProt.error };
          const idProteccion = toInt(idOf(resProt.data));
          if (!idProteccion) return { error: { status: 500, data: 'No se obtuvo idProteccion.' } };

          // 3) Subir archivos de la protección como tipoEntidad 'PI'
          const archivos = Array.isArray(p.archivosProteccion) ? p.archivosProteccion : [];
          for (const a of archivos) {
            const file = a?.file ?? null;
            const metaDS = a?.metadataDSpace ?? {};
            const up = await orqUploadArchivo({
              api: _api,
              file,
              entityId: idProteccion,
              tipoEntidad: 'PI',
              metaDSpace: metaDS,
            });
            if (!up.ok) return { error: up.error };
          }

          proteccionResults.push({ idProteccion, body: bodyProt });
        }

        // ───────────────────────── 4–7) Delegar Cotitularidad ──────────────────
        // Estandariza input para el orquestador de cotitularidad
        const cotiBlock = payload?.cotitularidad || null;
        let cotiResult = null;

        if (cotiBlock) {
          // import dinámico para evitar ciclos si fuera el caso
          const mod = await import('./cotitularidadOrchestratorApi');
          const cotiApi = mod.cotitularidadOrchestratorApi;

          // Ejecutamos calls vía baseQuery "manual" (sin hooks):
          // - creamos CotitularidadTecno
          const resCotiTec = await baseQuery({
            url: endpoints.cotitularidadTecno,
            method: 'POST',
            body: { idTecnologia },
          });
          if (resCotiTec.error) return { error: resCotiTec.error };
          const idCotitularidadTecno = toInt(idOf(resCotiTec.data));
          if (!idCotitularidadTecno) return { error: { status: 500, data: 'No se obtuvo idCotitularidadTecno.' } };

          // 6) Subimos archivo CO si existe
          if (cotiBlock.archivoCotitularidad?.file) {
            const upCO = await orqUploadArchivo({
              api: _api,
              file: cotiBlock.archivoCotitularidad.file,
              entityId: idCotitularidadTecno,
              tipoEntidad: 'CO',
              metaDSpace: { titulo: 'Acuerdo de cotitularidad' },
            });
            if (!upCO.ok) return { error: upCO.error };
          }

          // 5 & 7) Creamos cotitularidadInst nuevas y luego cotitulares
          // Reutilizamos el orquestador corregido: le pasamos el shape estándar
          // Nota: el orquestador interno CREARÁ inst y cotitulares; aquí ya creamos cotiTecno.
          const cotiPayload = {
            idTecnologia,                   // para logging
            idCotitularidadTecno,          // clave de trabajo
            cotitulares: cotiBlock.cotitulares || [],
            skipCreateCotitularidadTecno: true, // ya creado
          };

          // Ejecutamos la queryFn "a mano"
          const resCoti = await cotiApi.endpoints.createFullCotitularidad.initiate(cotiPayload, { dispatch: _api.dispatch, subscribe: false, forceRefetch: true });
          // resCoti es un subscription ref; mejor disparamos directamente con baseQuery? -> Usamos un "atajo":
          // Para evitar dependencias del store, llamemos manualmente a la queryFn interna:
          // => Simplificamos y movemos toda la lógica dentro de cotitularidadOrchestratorApi a baseQuery aquí:
          // PERO para no duplicar lógica, hacemos una llamada HTTP ficticia: NO. Mejor replanteo:
          // ------------------------------------------------------------------------------
          // ✅ Simples llamados HTTP equivalentes, in-line:
          const createdInstIds = [];
          const createdCotIds = [];

          const EXPECTS_PERCENT_FRACTION = true;
          const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
          const pctToDb = (val) => {
            const n = Number(val);
            if (!Number.isFinite(n)) return null;
            if (EXPECTS_PERCENT_FRACTION) return Number(clamp(n / 100, 0, 1).toFixed(4));
            return Number(clamp(n, 0, 100).toFixed(2));
          };

          // 5) Crear cotitularidadInst para NO ESPOL y mapear
          const instMap = new Map(); // key=index or object ref -> idInst
          (cotiBlock.cotitulares || []).forEach((c, idx) => {
            if (!c?.perteneceEspol && c?.cotitularInst) instMap.set(idx, null);
          });

          for (const [idx] of instMap) {
            const ci = cotiBlock.cotitulares[idx].cotitularInst;
            const resInst = await baseQuery({
              url: 'cotitularidad-institucional',
              method: 'POST',
              body: { nombre: ci.nombre?.trim(), correo: ci.correo?.trim(), ruc: ci.ruc?.trim() },
            });
            if (resInst.error) return { error: resInst.error };
            const idInst = toInt(idOf(resInst.data));
            if (!idInst) return { error: { status: 500, data: 'No se obtuvo idCotitularidadInst.' } };
            instMap.set(idx, idInst);
            createdInstIds.push(idInst);
          }

          // 7) Crear cotitular
          for (let i = 0; i < (cotiBlock.cotitulares || []).length; i++) {
            const c = cotiBlock.cotitulares[i];
            const porcentaje = pctToDb(c?.porcCotitularidad);
            if (porcentaje == null) return { error: { status: 400, data: `Cotitular #${i + 1}: porcentaje inválido.` } };

            const idCotitularidadInst = c?.perteneceEspol ? (toInt(c?.idCotitularInst) || 1) : toInt(instMap.get(i));
            if (!idCotitularidadInst) return { error: { status: 500, data: `Cotitular #${i + 1}: idCotitularidadInst inválido.` } };

            const idPersona = toInt(c?.idPersona);
            if (!idPersona) return { error: { status: 400, data: `Cotitular #${i + 1}: idPersona requerido.` } };

            const resCot = await baseQuery({
              url: 'cotitulares',
              method: 'POST',
              body: { idCotitularidadTecno, idCotitularidadInst, idPersona, porcentaje },
            });
            if (resCot.error) return { error: resCot.error };
            const idCot = toInt(idOf(resCot.data));
            if (idCot) createdCotIds.push(idCot);
          }

          cotiResult = { idCotitularidadTecno, createdInstIds, createdCotIds };
        }

        // ─────────────── 8–10) Acuerdo de Distribución + Autores + Archivo D ───────────────
        const acu = payload?.acuerdoDistribAutores || null;
        let acuerdoOut = null;

        if (acu) {
          // 8) Crear acuerdo con idTecnologia
          const resAcuerdo = await baseQuery({
            url: endpoints.acuerdosDistribAutores,
            method: 'POST',
            body: { idTecnologia },
          });
          if (resAcuerdo.error) return { error: resAcuerdo.error };
          const idAcuerdo = toInt(idOf(resAcuerdo.data));
          if (!idAcuerdo) return { error: { status: 500, data: 'No se obtuvo id del acuerdo de distribución.' } };

          // 9) Crear autores
          const autores = Array.isArray(acu.autores) ? acu.autores : [];
          const autoresIds = [];
          for (let i = 0; i < autores.length; i++) {
            const a = autores[i];
            const bodyAutor = {
              idOtriTtAcuerdoDistribAutores: idAcuerdo,
              idUnidad: a.idUnidad,
              idPersona: a.idPersona,
              porcAutor: Number(a.porcAutor),
              porcUnidad: Number(a.porcUnidad),
            };
            const resAutor = await baseQuery({
              url: endpoints.autores,
              method: 'POST',
              body: bodyAutor,
            });
            if (resAutor.error) return { error: resAutor.error };
            const idAutor = toInt(idOf(resAutor.data));
            if (idAutor) autoresIds.push(idAutor);
          }

          // 10) Subir archivo tipo 'D' del acuerdo
          if (acu.archivo?.file) {
            const upD = await orqUploadArchivo({
              api: _api,
              file: acu.archivo.file,
              entityId: idAcuerdo,
              tipoEntidad: 'D',
              metaDSpace: { titulo: 'Acuerdo de distribución de autores' },
            });
            if (!upD.ok) return { error: upD.error };
          }

          acuerdoOut = { idAcuerdo, autoresIds };
        }

        // Resultado del orquestador
        return {
          data: {
            tecnologia: { idTecnologia, raw: resTec.data },
            protecciones: proteccionResults,
            cotitularidad: cotiResult,
            acuerdoDistribAutores: acuerdoOut,
          },
        };
      },
    }),
  }),
});

export const { useCreateFullTechnologyFlowMutation } = technologyOrchestratorApi;
