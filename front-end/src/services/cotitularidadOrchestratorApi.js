// src/services/cotitularidadOrchestratorApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getPersonaIdByEmail } from './espolUsers';
import { getIdPersonaFromAppJwt, getAppUser } from './api';

const DEBUG_ORCH = true;

// 👉 Cambia esto a false si tu DB guarda 0..100
const EXPECTS_PERCENT_FRACTION = true; // true => guarda 0..1

/** ───────────── Helpers ───────────── **/
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const toDecimal_0_100 = (v) => {
  if (v === '' || v === null || typeof v === 'undefined') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const clamped = clamp(n, 0, 100);
  return Number(clamped.toFixed(4)); // más precisión para conversión a 0..1 si aplica
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
    createFullCotitularidad: builder.mutation({
      /**
       * payload:
       * {
       *   idTecnologia?: number,
       *   tecnologia?: {...},
       *   filas: [{
       *     esEspol: boolean,
       *     institucion, ruc, correo,
       *     representante: { nombre, username, correo, porcentaje }
       *   }]
       * }
       */
      async queryFn(payload, _api, _extra, baseQuery) {
        try {
          if (DEBUG_ORCH) console.log('[ORCH] IN payload =>', payload);

          // 1) idTecnologia (o crearla si vino "tecnologia")
          let idTecnologia = toInt(payload?.idTecnologia);
          if (!idTecnologia && payload?.tecnologia) {
            const resTec = await baseQuery({
              url: 'tecnologias',
              method: 'POST',
              body: { ...payload.tecnologia, completado: false },
            });
            if (resTec.error) return { error: resTec.error };
            idTecnologia = toInt(resTec.data?.id ?? resTec.data?.Id);
            if (!idTecnologia) {
              return { error: { status: 500, data: 'No se obtuvo idTecnologia.' } };
            }
          }
          if (!idTecnologia) {
            return { error: { status: 400, data: 'Falta idTecnologia en el payload.' } };
          }

          // 2) crear CotitularidadTecno
          const resCotiTec = await baseQuery({
            url: 'cotitularidad-tecno',
            method: 'POST',
            body: { idTecnologia },
          });
          if (resCotiTec.error) return { error: resCotiTec.error };
          const idCotitularidadTecno = toInt(resCotiTec.data?.id ?? resCotiTec.data?.Id);
          if (!idCotitularidadTecno) {
            return { error: { status: 500, data: 'No se obtuvo idCotitularidadTecno.' } };
          }

          // 3) filas -> crear Inst y Cotitular
          const filas = Array.isArray(payload?.filas) ? payload.filas : [];
          const createdInstIds = [];
          const createdCotitularIds = [];

          for (let i = 0; i < filas.length; i++) {
            const f = filas[i] || {};

            // 3.1) CotitularidadInst
            const bodyInst = {
              nombre: String(f?.institucion ?? '').trim(),
              correo: String(f?.correo ?? '').trim(),
              ruc: String(f?.ruc ?? '').trim(),
            };
            if (!isNonEmpty(bodyInst.nombre) || !isNonEmpty(bodyInst.ruc)) {
              return { error: { status: 400, data: `Fila ${i + 1}: institución y RUC son obligatorios.` } };
            }

            const resInst = await baseQuery({
              url: 'cotitularidad-institucional',
              method: 'POST',
              body: bodyInst,
            });
            if (resInst.error) return { error: resInst.error };
            const idCotitularidadInst = toInt(resInst.data?.id ?? resInst.data?.Id);
            if (!idCotitularidadInst) {
              return { error: { status: 500, data: `Fila ${i + 1}: no se obtuvo idCotitularidadInst.` } };
            }
            createdInstIds.push(idCotitularidadInst);

            // 3.2) idPersona
            let idPersona = null;
            if (f?.esEspol) {
              const email = isNonEmpty(f?.representante?.username)
                ? `${String(f.representante.username).trim()}@espol.edu.ec`
                : (f?.representante?.correo ?? '');
              if (!isNonEmpty(email)) {
                return { error: { status: 400, data: `Fila ${i + 1}: falta correo/username ESPOL.` } };
              }
              idPersona = await getPersonaIdByEmail(email);
            } else {
              idPersona = await resolvePersonaIdFromSession();
            }

            idPersona = toInt(idPersona);
            if (!idPersona) {
              return { error: { status: 500, data: `Fila ${i + 1}: idPersona inválido.` } };
            }

            // 3.3) porcentaje -> normaliza 0..100 y transforma si DB espera 0..1
            const pct0to100 = toDecimal_0_100(f?.representante?.porcentaje);
            if (pct0to100 === null) {
              return { error: { status: 400, data: `Fila ${i + 1}: porcentaje inválido.` } };
            }

            // 🔧 porcentaje → formato DB
            let porcentajeDb = pct0to100;
            if (EXPECTS_PERCENT_FRACTION) {
              // Si llega 0..100, lo llevamos a 0..1 con 4 decimales (p. ej., 100 => 1.0000)
              if (porcentajeDb > 1) porcentajeDb = porcentajeDb / 100;
              porcentajeDb = Number(clamp(porcentajeDb, 0, 1).toFixed(4));
            } else {
              // DB espera 0..100 (asegura 2 decimales)
              porcentajeDb = Number(clamp(porcentajeDb, 0, 100).toFixed(2));
            }

            const bodyCotitular = {
              idCotitularidadTecno,
              idCotitularidadInst,
              idPersona,
              porcentaje: porcentajeDb,
            };

            if (DEBUG_ORCH) {
              console.log(`[ORCH] POST /cotitulares (fila ${i + 1}) =>`, bodyCotitular);
            }

            const resCotit = await baseQuery({
              url: 'cotitulares',
              method: 'POST',
              body: bodyCotitular,
            });
            if (resCotit.error) {
              // Logguea payload para diagnóstico de rango
              console.error('[ORCH] Error POST /cotitulares con body =>', bodyCotitular);
              return { error: resCotit.error };
            }

            const idCot = toInt(resCotit.data?.id ?? resCotit.data?.Id);
            if (idCot) createdCotitularIds.push(idCot);
          }

          const data = {
            idTecnologia,
            idCotitularidadTecno,
            cotitularesInst: createdInstIds,
            cotitulares: createdCotitularIds,
          };
          if (DEBUG_ORCH) console.log('[ORCH] OUT result =>', data);
          return { data };
        } catch (e) {
          if (DEBUG_ORCH) console.error('[ORCH] Fatal error:', e);
          return { error: { status: 500, data: e?.message || 'Error en orquestador.' } };
        }
      },
    }),
  }),
});

export const { useCreateFullCotitularidadMutation } = cotitularidadOrchestratorApi;
