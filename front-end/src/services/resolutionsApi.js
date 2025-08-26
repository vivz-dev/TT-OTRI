/**
 * RTK Query – Resolutions / Distributions
 * --------------------------------------------------------------
 *  • GET    /resoluciones
 *  • GET    /resoluciones/:id           <-- NUEVO
 *  • POST   /resoluciones               -> transformResponse => { id }
 *  • PATCH  /resoluciones/:id
 *
 *  • GET    /resoluciones/:id/distribuciones
 *  • POST   /resoluciones/:id/distribuciones
 *  • PATCH  /distribuciones/:id
 *
 *  TagTypes: Resolution | Distribution
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';

export const resolutionsApi = createApi({
  reducerPath: 'resolutionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Resolution', 'Distribution'],
  endpoints: (builder) => ({

    /* ---------- RESOLUCIONES ---------- */
    getResolutions: builder.query({
      query: () => '/resoluciones',
      providesTags: (result) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Resolution', id: x.id ?? x.Id })),
              { type: 'Resolution', id: 'LIST' },
            ]
          : [{ type: 'Resolution', id: 'LIST' }],
    }),

    // <-- NUEVO
    getResolutionById: builder.query({
      query: (id) => `/resoluciones/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Resolution', id }],
    }),

    createResolution: builder.mutation({
      query: (body) => ({
        url: '/resoluciones',
        method: 'POST',
        body,
      }),
      transformResponse: (response, meta) => {
        const id = normalizeId(response);
        return { id, raw: response, status: meta?.response?.status };
      },
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
      providesTags: (result, _err, resolutionId) =>
        result
          ? [
              ...result.map((x) => ({ type: 'Distribution', id: x.id ?? x.Id })),
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
      invalidatesTags: (_res, _err, { resolutionId }) => [
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

export const {
  useGetResolutionsQuery,
  useGetResolutionByIdQuery, // <-- NUEVO
  useCreateResolutionMutation,
  usePatchResolutionMutation,
  useGetDistributionsByResolutionQuery,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} = resolutionsApi;
