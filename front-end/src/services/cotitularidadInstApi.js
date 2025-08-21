import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, normalizeId } from "./baseQuery";

const idOf = (obj) => normalizeId(obj) ?? obj?.id ?? obj?.Id ?? null;

export const cotitularidadInstApi = createApi({
  reducerPath: "cotitularidadInstApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createCotitularidadInst: builder.mutation({
      query: (body) => ({
        url: "cotitularidad-institucional",
        method: "POST",
        body,
      }),
      transformResponse: (resp) => ({ id: idOf(resp), raw: resp }),
    }),
    getCotitularidadInstById: builder.query({
      query: (id) => `cotitularidad-institucional/${id}`,
    }),
  }),
});

export const {
  useCreateCotitularidadInstMutation,
  useGetCotitularidadInstByIdQuery,
} = cotitularidadInstApi;
