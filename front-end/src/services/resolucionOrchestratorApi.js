// src/services/resolucionOrchestratorApi.js
/**
 * Orquestador: crea resolución + distribuciones + beneficiarios
 * Reglas:
 *   - Si MontoMaximo viene null/undefined/'' => enviar 0
 *   - Siempre enviar IdUsuarioCrea en /distrib-benef-instituciones (requerido por DB)
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ensureAppJwt, getIdPersonaFromAppJwt } from "./api";
import { removeNullish, coalesceZero } from "./_utils";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const appToken = await ensureAppJwt();
    headers.set("Authorization", `Bearer ${appToken}`);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return headers;
  },
});

const reauthWrapper = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && [401, 403].includes(result.error.status)) {
    try {
      await ensureAppJwt();
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }
  return result;
};

const normalizeId = (resp) => {
  if (resp == null) return null;
  if (typeof resp === "number") return resp;
  if (typeof resp === "string") {
    const n = Number(resp);
    return Number.isFinite(n) ? n : null;
  }
  return resp.id ?? resp.Id ?? resp.idResolucion ?? resp.IdResolucion ?? null;
};

export const resolucionOrchestratorApi = createApi({
  reducerPath: "resolucionOrchestratorApi",
  baseQuery: reauthWrapper,
  endpoints: (builder) => ({
    createResolucionCompleta: builder.mutation({
      async queryFn(payload, api, _extra, baseQuery) {
        try {
          const { resolucion, distribuciones = [] } = payload ?? {};
          if (!resolucion) return { error: { status: 400, data: "Falta resolucion en el payload." } };

          // 1) Resolución
          const resRes = await baseQuery({ url: "/resoluciones", method: "POST", body: resolucion });
          if (resRes.error) return { error: resRes.error };
          const resolutionId = normalizeId(resRes.data);
          if (!resolutionId) return { error: { status: 500, data: "No se obtuvo id de resolución." } };

          // 2) Distribuciones
          const IdUsuarioCrea = getIdPersonaFromAppJwt() ?? 0;
          const distributions = [];

          for (let i = 0; i < distribuciones.length; i++) {
            const d = distribuciones[i];

            const bodyDist = removeNullish({
              IdResolucion: resolutionId,
              MontoMaximo: coalesceZero(d?.MontoMaximo),
              MontoMinimo: Number(d?.MontoMinimo ?? 0),
              PorcSubtotalAutores: Number(d?.PorcSubtotalAutores ?? 0),
              PorcSubtotalInstitut: Number(d?.PorcSubtotalInstitut ?? 0),
              IdUsuarioCrea,
            });

            console.debug("[ORQ] POST /resoluciones/{id}/distribuciones body =", bodyDist);
            const resDist = await baseQuery({
              url: `/resoluciones/${resolutionId}/distribuciones`,
              method: "POST",
              body: bodyDist,
            });
            if (resDist.error) return { error: resDist.error };

            const distributionId = normalizeId(resDist.data);
            if (!distributionId) return { error: { status: 500, data: `No se obtuvo id de la distribución #${i + 1}.` } };

            // 3) Beneficiarios institucionales (⚠️ ahora con IdUsuarioCrea)
            const biResults = [];
            const beneficiarios = Array.isArray(d?.beneficiarios) ? d.beneficiarios : [];

            for (let j = 0; j < beneficiarios.length; j++) {
              const b = beneficiarios[j];
              const bodyBI = {
                IdDistribucionResolucion: distributionId,
                IdBenefInstitucion: Number(b?.IdBenefInstitucion),
                Porcentaje: Number(b?.Porcentaje ?? 0), // 0..1
                IdUsuarioCrea,                           // ← REQUERIDO POR DB (NOT NULL)
              };

              console.debug("[ORQ] POST /distrib-benef-instituciones body =", bodyBI);
              const resBI = await baseQuery({ url: "/distrib-benef-instituciones", method: "POST", body: bodyBI });
              if (resBI.error) return { error: resBI.error };

              biResults.push({
                id: normalizeId(resBI.data) ?? resBI.data?.id ?? resBI.data?.Id ?? null,
                raw: resBI.data,
              });
            }

            distributions.push({ id: distributionId, raw: resDist.data, beneficiarios: biResults });
          }

          return { data: { resolutionId, rawResolution: resRes.data, distributions } };
        } catch (e) {
          return { error: { status: 500, data: e?.message ?? "Error en orquestador" } };
        }
      },
    }),
  }),
});

export const { useCreateResolucionCompletaMutation } = resolucionOrchestratorApi;
