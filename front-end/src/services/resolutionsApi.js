/**
 * RTK Query – Resolutions / Distributions
 * ---------------------------------------
 *  • GET    /resoluciones
 *  • POST   /resoluciones
 *  • PATCH  /resoluciones/:id
 *
 *  • GET    /resoluciones/:id/distribuciones
 *  • POST   /resoluciones/:id/distribuciones
 *  • PATCH  /distribuciones/:id
 *
 *  TagTypes: Resolution | Distribution
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:5196/api';

export const resolutionsApi = createApi({
  reducerPath: 'resolutionsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Resolution', 'Distribution'],
  endpoints: (builder) => ({
    /* ---------- RESOLUCIONES ---------- */
    getResolutions: builder.query({
      query: () => '/resoluciones',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Resolution', id })),
              { type: 'Resolution', id: 'LIST' },
            ]
          : [{ type: 'Resolution', id: 'LIST' }],
    }),

    createResolution: builder.mutation({
      query: (body) => ({
        url: '/resoluciones',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Resolution', id: 'LIST' }],
    }),

    patchResolution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/resoluciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'Resolution', id },
        { type: 'Resolution', id: 'LIST' },
      ],
    }),

    /* ---------- DISTRIBUCIONES ---------- */
    getDistributionsByResolution: builder.query({
      query: (resolutionId) => `/resoluciones/${resolutionId}/distribuciones`,
      providesTags: (result, _, resolutionId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Distribution', id })),
              { type: 'Resolution', id: resolutionId },
            ]
          : [{ type: 'Resolution', id: resolutionId }],
    }),

    createDistribution: builder.mutation({
      query: ({ resolutionId, body }) => ({
        url: `/resoluciones/${resolutionId}/distribuciones`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { resolutionId }) => [
        { type: 'Resolution', id: resolutionId },
      ],
    }),

    patchDistribution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/distribuciones/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Distribution', id }],
    }),
  }),
});

/* Hooks auto-generados -------------------------------------------------- */
export const {
  useGetResolutionsQuery,
  useCreateResolutionMutation,
  usePatchResolutionMutation,
  useGetDistributionsByResolutionQuery,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} = resolutionsApi;
