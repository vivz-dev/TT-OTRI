import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// Mapea el char Estado del backend a texto de UI:
const mapEstado = (c) => {
  // Ajusta si tus códigos difieren. Ejemplos:
  // 'D' -> Disponible, 'N' -> No Disponible
  if (c === 'D') return 'Disponible';
  if (c === 'N') return 'No Disponible';
  // fallback: muestra el char tal cual
  return String(c ?? '');
};

// Normaliza un registro del backend al shape que usa CardScroll
const toCardItem = (t) => ({
  id:          t.id,
  estado:      mapEstado(t.estado),
  completed:   !!t.completado,
  titulo:      t.titulo,
  descripcion: t.descripcion,
  // CardScroll espera texto/fecha. Puedes dejar ISO o formatear en el componente.
  fecha:       t.fechaCreacion,
  // Si luego quieres mostrar nombre, aquí hoy solo tenemos el IdPersona:
  usuario:     t.idPersona,
});



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
        body,
      }),
      invalidatesTags: [{ type: 'Technology', id: 'LIST' }],
    }),

    // PATCH /api/tecnologias/{id}
    updateTechnology: builder.mutation({
      // acepta { id, data } o { id, ...campos }
      query: ({ id, data, ...rest }) => ({
        url: `tecnologias/${id}`,
        method: 'PATCH',
        body: data ?? rest,
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
