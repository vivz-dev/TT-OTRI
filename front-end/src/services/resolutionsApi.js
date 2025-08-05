import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:5196/api';

export const resolutionsApi = createApi({
  reducerPath: 'resolutionsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Resolution'],
  endpoints: (builder) => ({
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
    /* ... tus mutations aquí (create, patch, etc.) ... */
  }),
});

/* Hooks auto-generados */
export const { useGetResolutionsQuery } = resolutionsApi;
