// src/services/technologyDetailsApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { technologiesApi } from './technologiesApi';
import { proteccionesApi } from './proteccionesApi';
import { tiposProteccionApi } from './tiposProteccionApi';
import { cotitularidadTecnoApi } from './cotitularidadTecnoApi';
import { cotitularApi } from './cotitularApi';
import { cotitularidadInstApi } from './cotitularidadInstApi';
import { acuerdosDistribAutoresApi } from './acuerdosDistribAutoresApi';
import { autoresApi } from './autoresApi';
import { archivosApi } from './storage/archivosApi';

export const technologyDetailsApi = createApi({
  reducerPath: 'technologyDetailsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getFullTechnologyDetails: builder.query({
      async queryFn(id, _api, _extraOptions, baseQuery) {
        try {
          console.log('Obteniendo detalles completos para tecnología ID:', id);

          // 1. Obtener información básica de la tecnología
          console.log('1. Obteniendo información de tecnología...');
          const techResult = await _api.dispatch(
            technologiesApi.endpoints.getTechnologyRaw.initiate(id)
          );
          
          if (techResult.error) {
            console.error('Error obteniendo tecnología:', techResult.error);
            return { error: techResult.error };
          }
          
          const tecnologia = techResult.data;
          console.log('Tecnología obtenida:', tecnologia);

          // 2. Obtener protecciones relacionadas
          console.log('2. Obteniendo protecciones...');
          const proteccionesResult = await _api.dispatch(
            proteccionesApi.endpoints.getProtecciones.initiate()
          );
          
          if (proteccionesResult.error) {
            console.error('Error obteniendo protecciones:', proteccionesResult.error);
            return { error: proteccionesResult.error };
          }
          
          const protecciones = proteccionesResult.data.filter(
            p => p.idTecnologia === id
          );
          console.log('Protecciones filtradas por tecnología:', protecciones);

          // 3. Obtener tipos de protección
          console.log('3. Obteniendo tipos de protección...');
          const tiposProteccionResult = await _api.dispatch(
            tiposProteccionApi.endpoints.getTipos.initiate()
          );
          
          if (tiposProteccionResult.error) {
            console.error('Error obteniendo tipos de protección:', tiposProteccionResult.error);
            return { error: tiposProteccionResult.error };
          }
          
          const tiposProteccion = tiposProteccionResult.data;
          console.log('Tipos de protección obtenidos:', tiposProteccion);

          // 4. Obtener archivos de protecciones y combinar con tipos
          console.log('4. Obteniendo archivos de protecciones...');
          const proteccionesCompletas = await Promise.all(
            protecciones.map(async (proteccion) => {
              const archivosResult = await _api.dispatch(
                archivosApi.endpoints.getArchivosByEntidad.initiate({
                  idTEntidad: proteccion.id,
                  tipoEntidad: 'PI'
                })
              );
              
              // Encontrar el tipo de protección correspondiente
              const tipoProteccion = tiposProteccion.find(
                tp => tp.id === proteccion.idTipoProteccion
              );
              
              console.log(`Protección ${proteccion.id}:`, {
                proteccion,
                tipoProteccion,
                archivos: archivosResult.data || []
              });
              
              return {
                ...proteccion,
                tipoProteccion: tipoProteccion || null,
                archivos: archivosResult.data || []
              };
            })
          );

          console.log('Protecciones completas con tipos:', proteccionesCompletas);

          // 5. Obtener cotitularidad de la tecnología
          console.log('5. Obteniendo cotitularidad...');
          let cotitularidadTecno = null;
          let cotitulares = [];
          let instituciones = [];

          // PRIMERO: Obtener todas las cotitularidades usando baseQuery directamente
          console.log('5.1. Obteniendo todas las cotitularidades...');
          const allCotitularidadesResult = await baseQuery({
            url: 'cotitularidad-tecno',
            method: 'GET',
          });
          
          if (allCotitularidadesResult.error) {
            console.error('Error obteniendo cotitularidades:', allCotitularidadesResult.error);
          } else if (allCotitularidadesResult.data) {
            // Filtrar por idTecnologia
            cotitularidadTecno = allCotitularidadesResult.data.find(
              ct => ct.idTecnologia === id
            ) || null;

            if (cotitularidadTecno) {
              console.log('Cotitularidad encontrada:', cotitularidadTecno);
              
              // 6. Obtener archivo de cotitularidad
              console.log('6. Obteniendo archivos de cotitularidad...');
              const archivosCotitularidadResult = await _api.dispatch(
                archivosApi.endpoints.getArchivosByEntidad.initiate({
                  idTEntidad: cotitularidadTecno.id,
                  tipoEntidad: 'CO'
                })
              );

              cotitularidadTecno = {
                ...cotitularidadTecno,
                archivos: archivosCotitularidadResult.data || []
              };

              // 7. Obtener todos los cotitulares usando baseQuery
              console.log('7. Obteniendo cotitulares...');
              const allCotitularesResult = await baseQuery({
                url: 'cotitulares',
                method: 'GET',
              });
              
              if (allCotitularesResult.data) {
                cotitulares = allCotitularesResult.data.filter(
                  c => c.idCotitularidadTecno === cotitularidadTecno.id
                );
                console.log('Cotitulares filtrados:', cotitulares);

                // 8. Obtener información de instituciones usando baseQuery
                console.log('8. Obteniendo instituciones...');
                const allInstitucionesResult = await baseQuery({
                  url: 'cotitularidad-institucional',
                  method: 'GET',
                });
                
                if (allInstitucionesResult.data) {
                  // Obtener IDs de instituciones de los cotitulares
                  const instIds = cotitulares.map(c => c.idCotitularidadInst);
                  instituciones = allInstitucionesResult.data.filter(
                    inst => instIds.includes(inst.id)
                  );
                  console.log('Instituciones encontradas:', instituciones);
                }
              }
            } else {
              console.log('No se encontró cotitularidad para esta tecnología');
            }
          }

          // 9. Obtener acuerdo de distribución
          console.log('9. Obteniendo acuerdos de distribución...');
          const acuerdosResult = await _api.dispatch(
            acuerdosDistribAutoresApi.endpoints.getAcuerdos.initiate()
          );
          
          let acuerdoDistribucion = null;
          let autores = [];

          if (acuerdosResult.data) {
            acuerdoDistribucion = acuerdosResult.data.find(
              a => a.idTecnologia === id
            ) || null;

            if (acuerdoDistribucion) {
              console.log('Acuerdo de distribución encontrado:', acuerdoDistribucion);
              
              // 10. Obtener autores del acuerdo
              console.log('10. Obteniendo autores...');
              const autoresResult = await _api.dispatch(
                autoresApi.endpoints.getByAcuerdoDistrib.initiate(acuerdoDistribucion.id)
              );
              
              if (autoresResult.data) {
                autores = autoresResult.data;
                console.log('Autores encontrados:', autores);
              }

              // 11. Obtener archivo del acuerdo
              console.log('11. Obteniendo archivos de acuerdo...');
              const archivosAcuerdoResult = await _api.dispatch(
                archivosApi.endpoints.getArchivosByEntidad.initiate({
                  idTEntidad: acuerdoDistribucion.id,
                  tipoEntidad: 'D'
                })
              );
              
              acuerdoDistribucion = {
                ...acuerdoDistribucion,
                archivos: archivosAcuerdoResult.data || [],
                autores: autores
              };
            } else {
              console.log('No se encontró acuerdo de distribución para esta tecnología');
            }
          }

          // Estructurar la respuesta final
          const result = {
            tecnologia,
            protecciones: proteccionesCompletas,
            cotitularidad: cotitularidadTecno ? {
              ...cotitularidadTecno,
              cotitulares: cotitulares.map(c => ({
                ...c,
                institucion: instituciones.find(inst => inst.id === c.idCotitularidadInst) || null
              }))
            } : null,
            acuerdoDistribucion
          };

          console.log('Resultado final completo:', result);
          return { data: result };
        } catch (error) {
          console.error('Error en getFullTechnologyDetails:', error);
          return { error: { status: 500, data: error.message } };
        }
      },
    }),
  }),
});

export const { useGetFullTechnologyDetailsQuery } = technologyDetailsApi;