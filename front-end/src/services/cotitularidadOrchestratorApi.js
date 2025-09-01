// src/services/cotitularidadOrchestratorApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getPersonaIdByEmail } from './espolUsers';
import { getIdPersonaFromAppJwt, getAppUser } from './api';
import { uploadAndSaveArchivo } from './storage/archivosOrchestrator';

const DEBUG_ORCH = true;

// 👉 Cambia esto a false si tu DB guarda 0..100
const EXPECTS_PERCENT_FRACTION = true; // true => guarda 0..1

/** ───────────── Helpers ───────────── **/
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const pctToDb = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  if (EXPECTS_PERCENT_FRACTION) return Number(clamp(n / 100, 0, 1).toFixed(4));
  return Number(clamp(n, 0, 100).toFixed(2));
};

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/** Resolve idPersona del usuario autenticado */
const resolvePersonaIdFromSession = async () => {
  const direct = getIdPersonaFromAppJwt?.();
  if (Number.isFinite(direct) && direct > 0) return direct;

  const user = getAppUser?.();
  const email = user?.email || user?.Email || null;
  if (isNonEmpty(email)) return getPersonaIdByEmail(email);

  throw new Error('No se pudo resolver idPersona del usuario autenticado.');
};

export const cotitularidadOrchestratorApi = createApi({
  reducerPath: 'cotitularidadOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /**
     * Crea la cotitularidad completa:
     * payload:
     * {
     *   idTecnologia?: number,
     *   idCotitularidadTecno?: number,      // si ya existe
     *   cotitulares: [{
     *     perteneceEspol: boolean,
     *     porcCotitularidad: number (0..100),
     *     nombre, correo, telefono,
     *     idPersona?: number,               // preferido si viene
     *     idCotitularInst?: number,         // usar para ESPOL (p.ej. 1)
     *     cotitularInst?: { nombre, correo, ruc } // solo para NO ESPOL
     *   }],
     *   archivoCotitularidad?: { file, nombre, ... },
     *   skipCreateCotitularidadTecno?: boolean
     * }
     */
    createFullCotitularidad: builder.mutation({
      async queryFn(payload, _api, _extra, baseQuery) {
        try {
          if (DEBUG_ORCH) console.log('[COTI-ORCH] IN payload =>', payload);

          const idTecnologia = toInt(payload?.idTecnologia) || null;

          // 1) Crear cotitularidad-tecno (a menos que ya nos pasen el id)
          let idCotitularidadTecno = toInt(payload?.idCotitularidadTecno);
          if (!payload?.skipCreateCotitularidadTecno && !idCotitularidadTecno) {
            if (!idTecnologia) return { error: { status: 400, data: 'Falta idTecnologia para crear cotitularidad-tecno.' } };
            const resCotiTec = await baseQuery({
              url: 'cotitularidad-tecno',
              method: 'POST',
              body: { idTecnologia },
            });
            if (resCotiTec.error) return { error: resCotiTec.error };
            idCotitularidadTecno = toInt(resCotiTec.data?.id ?? resCotiTec.data?.Id);
            if (!idCotitularidadTecno) {
              return { error: { status: 500, data: 'No se obtuvo idCotitularidadTecno.' } };
            }
          }
          if (!idCotitularidadTecno) return { error: { status: 400, data: 'Falta idCotitularidadTecno.' } };

          // 2) Archivo de cotitularidad (tipoEntidad 'CO')
          if (payload?.archivoCotitularidad?.file) {
            const uploadToDspace = (p) => baseQuery({ url: 'dspace/upload', method: 'POST', body: p });
            const createArchivo  = (dto) => baseQuery({ url: 'archivos',     method: 'POST', body: dto });

            try {
              await uploadAndSaveArchivo({
                file: payload.archivoCotitularidad.file,
                meta: { idTEntidad: idCotitularidadTecno, tipoEntidad: 'CO', titulo: 'Acuerdo de cotitularidad' },
                uploadToDspace,
                createArchivo,
              });
            } catch (e) {
              return { error: { status: 500, data: e?.message || 'Error subiendo archivo de cotitularidad.' } };
            }
          }

          // 3) Crear cotitularidadInst para NO ESPOL
          const cotitulares = Array.isArray(payload?.cotitulares) ? payload.cotitulares : [];
          const instIds = [];    // ids creados (solo nuevos)
          const createdCotIds = [];

          const instMap = new Map(); // key=index -> idInst
          cotitulares.forEach((c, i) => {
            if (!c?.perteneceEspol && c?.cotitularInst) instMap.set(i, null);
          });

          for (const [idx] of instMap) {
            const ci = cotitulares[idx].cotitularInst;
            const resInst = await baseQuery({
              url: 'cotitularidad-institucional',
              method: 'POST',
              body: { nombre: ci.nombre?.trim(), correo: ci.correo?.trim(), ruc: ci.ruc?.trim() },
            });
            if (resInst.error) return { error: resInst.error };
            const idInst = toInt(resInst.data?.id ?? resInst.data?.Id);
            if (!idInst) return { error: { status: 500, data: 'No se obtuvo idCotitularidadInst.' } };
            instMap.set(idx, idInst);
            instIds.push(idInst);
          }

          // 4) Crear cotitulares
          for (let i = 0; i < cotitulares.length; i++) {
            const c = cotitulares[i];

            const porcentaje = pctToDb(c?.porcCotitularidad);
            if (porcentaje == null) return { error: { status: 400, data: `Cotitular #${i + 1}: porcentaje inválido.` } };

            let idCotitularidadInst = null;
            if (c?.perteneceEspol) {
              idCotitularidadInst = toInt(c?.idCotitularInst) || 1; // default ESPOL
            } else {
              idCotitularidadInst = toInt(instMap.get(i));
            }
            if (!idCotitularidadInst) return { error: { status: 500, data: `Cotitular #${i + 1}: idCotitularidadInst inválido.` } };

            // idPersona preferido si viene; si no:
            let idPersona = toInt(c?.idPersona);
            if (!idPersona && isNonEmpty(c?.correo)) {
              idPersona = toInt(await getPersonaIdByEmail(String(c.correo).trim()));
            }
            if (!idPersona && !c?.perteneceEspol) {
              idPersona = toInt(await resolvePersonaIdFromSession());
            }
            if (!idPersona) return { error: { status: 400, data: `Cotitular #${i + 1}: idPersona requerido.` } };

            const resCot = await baseQuery({
              url: 'cotitulares',
              method: 'POST',
              body: { idCotitularidadTecno, idCotitularidadInst, idPersona, porcentaje },
            });
            if (resCot.error) return { error: resCot.error };
            const idCot = toInt(resCot.data?.id ?? resCot.data?.Id);
            if (idCot) createdCotIds.push(idCot);
          }

          const data = {
            idCotitularidadTecno,
            cotitularesInst: instIds,
            cotitulares: createdCotIds,
          };
          if (DEBUG_ORCH) console.log('[COTI-ORCH] OUT =>', data);
          return { data };
        } catch (e) {
          if (DEBUG_ORCH) console.error('[COTI-ORCH] Fatal error:', e);
          return { error: { status: 500, data: e?.message || 'Error en orquestador de cotitularidad.' } };
        }
      },
    }),
  }),
});

export const { useCreateFullCotitularidadMutation } = cotitularidadOrchestratorApi;
