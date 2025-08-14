import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const technologiesApi = createApi({
  reducerPath: 'technologiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5196/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Technology'],
  endpoints: (builder) => ({
    // GET /api/tecnologias
    getTechnologies: builder.query({
      query: () => 'tecnologias',
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'Technology', id: t.id })),
              { type: 'Technology', id: 'LIST' },
            ]
          : [{ type: 'Technology', id: 'LIST' }],
    }),

    // (Opcional) GET /api/tecnologias/{id}
    getTechnology: builder.query({
      query: (id) => `tecnologias/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Technology', id }],
    }),

    // POST /api/tecnologias
    createTechnology: builder.mutation({
      query: (body) => ({
        url: 'tecnologias',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Technology', id: 'LIST' }],
    }),

    // PUT /api/tecnologias/{id}  (cambia a PATCH si tu backend así lo define)
    updateTechnology: builder.mutation({
      // acepta { id, ...patch } o { id, data: {...} }
      query: ({ id, data, ...rest }) => ({
        url: `tecnologias/${id}`,
        method: 'PUT', // <-- usa 'PATCH' si corresponde
        body: data ?? rest, // si pasas {id, ...campos}, usa esos campos; si pasas {id, data}, usa data
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Technology', id },
        { type: 'Technology', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTechnologiesQuery,
  useGetTechnologyQuery,      // si no usas GET by id, puedes no importarlo
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
} = technologiesApi;
