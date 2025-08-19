import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

/* ---------------- helpers de mapeo ---------------- */

// Mapea el char Estado del backend a texto de UI:
const mapEstado = (c) => {
  if (c === 'D') return 'Disponible';
  if (c === 'N') return 'No Disponible';
  return String(c ?? '');
};

// Normaliza un registro del backend (TecnologiaReadDto) al shape que usa CardScroll
const toCardItem = (t) => ({
  id:            t.id,
  estado:        mapEstado(t.estado),
  completed:     !!t.completado,
  cotitularidad: !!t.cotitularidad,
  titulo:        t.titulo,
  descripcion:   t.descripcion,
  fecha:         t.fechaCreacion,   // ISO string
  ultimoCambio:  t.ultimoCambio,    // ISO string
  usuario:       t.idPersona,       // IdPersona (puedes resolver nombre en otro servicio)
});


/* ---------------- RTK Query API ---------------- */

export const technologiesApi = createApi({
  reducerPath: 'technologiesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Technology'],
  endpoints: (builder) => ({
    // GET /api/tecnologias
    getTechnologies: builder.query({
      query: () => 'tecnologias',
      transformResponse: (res) => Array.isArray(res) ? res.map(toCardItem) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'Technology', id: t.id })),
              { type: 'Technology', id: 'LIST' },
            ]
          : [{ type: 'Technology', id: 'LIST' }],
    }),

    // GET /api/tecnologias/{id}
    getTechnology: builder.query({
      query: (id) => `tecnologias/${id}`,
      transformResponse: (t) => (t ? toCardItem(t) : null),
      providesTags: (_res, _err, id) => [{ type: 'Technology', id }],
    }),

    // POST /api/tecnologias
    createTechnology: builder.mutation({
      query: (body) => ({
        url: 'tecnologias',
        method: 'POST',
        body, // body debe seguir el shape de TecnologiaCreateDto
      }),
      invalidatesTags: [{ type: 'Technology', id: 'LIST' }],
    }),

    // PATCH /api/tecnologias/{id}
    updateTechnology: builder.mutation({
      query: ({ id, data, ...rest }) => ({
        url: `tecnologias/${id}`,
        method: 'PATCH',
        body: data ?? rest, // body debe seguir el shape de TecnologiaPatchDto
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
  useGetTechnologyQuery,
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
} = technologiesApi;
