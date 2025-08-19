// src/services/resolucionOrchestratorApi.js
/**
 * Orquestador: crea resolución + distribuciones + beneficiarios
 * Reglas:
 *   - Si MontoMaximo viene null/undefined/'' => enviar 0
 *   - Siempre enviar IdUsuarioCrea en /distrib-benef-instituciones (requerido por DB)
 * Consistencia:
 *   - Si falla algún paso, borra lo creado (beneficiarios -> distribución -> resolución)
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';
import { getIdPersonaFromAppJwt } from './api';

// utils locales
const isNullish = (v) => v === null || v === undefined;
const removeNullish = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => !isNullish(v)));
const coalesceZero = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v || 0));

// defensa: clamp a [0,1]
const clamp01 = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

export const resolucionOrchestratorApi = createApi({
  reducerPath: 'resolucionOrchestratorApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createResolucionCompleta: builder.mutation({
      async queryFn(payload, api, _extra, baseQuery) {
        // contenedores para compensación
        const created = {
          resolutionId: null,
          distributionIds: [],
          benefIdsByDistrib: new Map(), // distribId -> [benefId...]
        };

        // helpers HTTP
        const doPost = async (url, body) => baseQuery({ url, method: 'POST', body });
        const doDelete = async (url) => baseQuery({ url, method: 'DELETE' });

        // compensación (best-effort)
        const compensate = async () => {
          try {
            // 1) borrar beneficiarios creados
            for (const [distId, ids] of created.benefIdsByDistrib.entries()) {
              for (const bid of ids) {
                await doDelete(`/distrib-benef-instituciones/${bid}`);
              }
            }
          } catch {}
          try {
            // 2) borrar distribuciones creadas
            for (const distId of created.distributionIds.reverse()) {
              await doDelete(`/distribuciones/${distId}`);
            }
          } catch {}
          try {
            // 3) borrar resolución creada
            if (created.resolutionId) {
              await doDelete(`/resoluciones/${created.resolutionId}`);
            }
          } catch {}
        };

        try {
          const { resolucion, distribuciones = [] } = payload ?? {};
          if (!resolucion) {
            return { error: { status: 400, data: 'Falta resolucion en el payload.' } };
          }

          // 1) RESOLUCIÓN
          const resRes = await doPost('/resoluciones', resolucion);
          if (resRes.error) return { error: resRes.error };

          const resolutionId =
            normalizeId(resRes.data) ??
            resRes.data?.id ??
            resRes.data?.Id ??
            resRes.data?.idResolucion ??
            null;

          if (!resolutionId) {
            // no dejes basura si tu backend devolvió algo pero sin id
            await compensate();
            return { error: { status: 500, data: 'No se obtuvo id de resolución.' } };
          }
          created.resolutionId = resolutionId;

          // 2) DISTRIBUCIONES + BENEFICIARIOS
          const IdUsuarioCrea = getIdPersonaFromAppJwt() ?? 0;
          const distributions = [];

          for (let i = 0; i < distribuciones.length; i++) {
            const d = distribuciones[i] || {};
            const bodyDist = removeNullish({
              IdResolucion: resolutionId,
              MontoMinimo: Number(d?.MontoMinimo ?? 0),
              MontoMaximo: coalesceZero(d?.MontoMaximo), // ← regla: null/'' => 0
              PorcSubtotalAutores: clamp01(d?.PorcSubtotalAutores ?? 0),
              PorcSubtotalInstitut:
                clamp01(d?.PorcSubtotalInstituciones ?? d?.PorcSubtotalInstitut ?? 0),
              IdUsuarioCrea,
            });

            // (opcional) verificación de suma de % (no rompe, pero avisa)
            const sumaPct =
              Number(bodyDist.PorcSubtotalAutores || 0) +
              Number(bodyDist.PorcSubtotalInstitut || 0);
            if (Math.abs(sumaPct - 1) > 1e-6) {
              console.warn(
                `[ORQ] Distribución #${i + 1}: subtotales no suman 1 (=${sumaPct}). ` +
                  'La UI debería evitar esto; se procede con clamp01.'
              );
            }

            // crear distribución
            const resDist = await doPost(
              `/resoluciones/${resolutionId}/distribuciones`,
              bodyDist
            );
            if (resDist.error) {
              await compensate();
              return { error: resDist.error };
            }

            const distributionId =
              normalizeId(resDist.data) ??
              resDist.data?.id ??
              resDist.data?.Id ??
              resDist.data?.IdDistribucion ??
              null;
            if (!distributionId) {
              await compensate();
              return {
                error: { status: 500, data: `No se obtuvo id de la distribución #${i + 1}.` },
              };
            }
            created.distributionIds.push(distributionId);
            created.benefIdsByDistrib.set(distributionId, []);

            // beneficiarios institucionales
            const biResults = [];
            const beneficiarios = Array.isArray(d?.beneficiarios) ? d.beneficiarios : [];

            for (let j = 0; j < beneficiarios.length; j++) {
              const b = beneficiarios[j] || {};
              const bodyBI = {
                IdDistribucionResolucion: distributionId,
                IdBenefInstitucion: Number(b?.IdBenefInstitucion ?? 0),
                Porcentaje: clamp01(b?.Porcentaje ?? b?.porcentaje ?? 0), // fracción 0..1
                IdUsuarioCrea, // requerido por DB
              };

              const resBI = await doPost('/distrib-benef-instituciones', bodyBI);
              if (resBI.error) {
                await compensate();
                return { error: resBI.error };
              }

              const benefId =
                normalizeId(resBI.data) ??
                resBI.data?.id ??
                resBI.data?.Id ??
                resBI.data?.IdDistribBenefInstitucion ??
                null;

              if (benefId) {
                created.benefIdsByDistrib.get(distributionId)?.push(benefId);
              }

              biResults.push({ id: benefId, raw: resBI.data });
            }

            distributions.push({
              id: distributionId,
              raw: resDist.data,
              beneficiarios: biResults,
            });
          }

          return {
            data: {
              resolutionId,
              rawResolution: resRes.data,
              distributions,
            },
          };
        } catch (e) {
          await compensate();
          return { error: { status: 500, data: e?.message ?? 'Error en orquestador' } };
        }
      },
    }),
  }),
});

export const { useCreateResolucionCompletaMutation } = resolucionOrchestratorApi;
