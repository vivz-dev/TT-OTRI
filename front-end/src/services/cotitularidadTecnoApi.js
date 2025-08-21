import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, normalizeId } from "./baseQuery";

const idOf = (obj) => normalizeId(obj) ?? obj?.id ?? obj?.Id ?? null;

export const cotitularidadTecnoApi = createApi({
  reducerPath: "cotitularidadTecnoApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createCotitularidadTecno: builder.mutation({
      query: (body) => ({ url: "cotitularidad-tecno", method: "POST", body }),
      transformResponse: (resp) => ({ id: idOf(resp), raw: resp }),
    }),
    getCotitularidadTecnoById: builder.query({
      query: (id) => `cotitularidad-tecno/${id}`,
    }),
  }),
});

export const {
  useCreateCotitularidadTecnoMutation,
  useGetCotitularidadTecnoByIdQuery,
} = cotitularidadTecnoApi;
