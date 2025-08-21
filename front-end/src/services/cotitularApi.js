import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, normalizeId } from "./baseQuery";

const idOf = (obj) => normalizeId(obj) ?? obj?.id ?? obj?.Id ?? null;

export const cotitularApi = createApi({
  reducerPath: "cotitularApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createCotitular: builder.mutation({
      query: (body) => ({ url: "cotitulares", method: "POST", body }),
      transformResponse: (resp) => ({ id: idOf(resp), raw: resp }),
    }),
    getCotitularById: builder.query({
      query: (id) => `cotitulares/${id}`,
    }),
  }),
});

export const {
  useCreateCotitularMutation,
  useGetCotitularByIdQuery,
} = cotitularApi;
