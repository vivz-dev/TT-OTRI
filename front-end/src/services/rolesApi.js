import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth, normalizeId } from './baseQuery';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Roles', 'RoleCatalog'],
  endpoints: (builder) => ({
    getPersonasConRoles: builder.query({
      query: () => '/roles-persona',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ idPersona }) => ({ 
                type: 'Roles', 
                id: idPersona 
              })),
              { type: 'Roles', id: 'LIST' },
            ]
          : [{ type: 'Roles', id: 'LIST' }],
    }),
    
    getRolesOtri: builder.query({
      query: () => '/espol/roles/otri',
      providesTags: ['RoleCatalog'],
    }),
    
    createRolPersona: builder.mutation({
      query: (body) => ({
        url: '/roles-persona',
        method: 'POST',
        body,
      }),
      transformResponse: (response, meta) => {
        const id = normalizeId(response);
        return { id, raw: response, status: meta?.response?.status };
      },
      invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
    }),
    
    updateRolPersona: builder.mutation({
      query: ({ idRolPersona, ...body }) => ({
        url: `/roles-persona/${idRolPersona}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (r, e, { idRolPersona }) => [
        { type: 'Roles', id: idRolPersona },
        { type: 'Roles', id: 'LIST' },
      ],
    }),
    
    deleteRolPersona: builder.mutation({
      query: (idRolPersona) => ({
        url: `/roles-persona/${idRolPersona}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, idRolPersona) => [
        { type: 'Roles', id: idRolPersona },
        { type: 'Roles', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPersonasConRolesQuery,
  useGetRolesOtriQuery,
  useCreateRolPersonaMutation,
  useUpdateRolPersonaMutation,
  useDeleteRolPersonaMutation,
} = rolesApi;