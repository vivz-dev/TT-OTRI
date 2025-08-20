import { configureStore } from '@reduxjs/toolkit';

/** Existentes (tuyos) */
import { resolutionsApi } from './services/resolutionsApi';
import { transfersApi } from './services/transfersApi';
import { technologiesApi } from './services/technologiesApi';
import { tiposProteccionApi } from './services/tiposProteccionApi';
import { cotitularesApi } from './services/cotitularesApi';
import { benefInstitucionesApi } from './services/benefInstitucionesApi';
import { resolucionOrchestratorApi } from './services/resolucionOrchestratorApi';
import { archivosApi } from './services/storage/archivosApi';
import { distribBenefInstitucionesApi } from './services/distribBenefInstitucionesApi';

/** Nuevos (generados en la respuesta anterior) */
import { acuerdosDistribAutoresApi } from './services/acuerdosDistribAutoresApi';
import { proteccionesApi } from './services/proteccionesApi';
import { cotitularidadInstApi } from './services/cotitularidadInstApi';
import { cotitularidadTecnoApi } from './services/cotitularidadTecnoApi';

import { technologyOrchestratorApi } from './services/technologyOrchestratorApi';
import { tecnologiaProteccionesApi } from './services/tecnologiaProteccionesApi';


export const store = configureStore({
  reducer: {
    // ---- Existentes
    [technologiesApi.reducerPath]: technologiesApi.reducer,
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
    [transfersApi.reducerPath]: transfersApi.reducer,
    [tiposProteccionApi.reducerPath]: tiposProteccionApi.reducer,
    [cotitularesApi.reducerPath]: cotitularesApi.reducer,
    [benefInstitucionesApi.reducerPath]: benefInstitucionesApi.reducer,
    [archivosApi.reducerPath]: archivosApi.reducer,
    [distribBenefInstitucionesApi.reducerPath]: distribBenefInstitucionesApi.reducer,
    [resolucionOrchestratorApi.reducerPath]: resolucionOrchestratorApi.reducer,

    // ---- Nuevos
    [acuerdosDistribAutoresApi.reducerPath]: acuerdosDistribAutoresApi.reducer,
    [proteccionesApi.reducerPath]: proteccionesApi.reducer,
    [cotitularidadInstApi.reducerPath]: cotitularidadInstApi.reducer,
    [cotitularidadTecnoApi.reducerPath]: cotitularidadTecnoApi.reducer,
    [technologyOrchestratorApi.reducerPath]: technologyOrchestratorApi.reducer,
    [tecnologiaProteccionesApi.reducerPath]: tecnologiaProteccionesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // ---- Existentes
      .concat(technologiesApi.middleware)
      .concat(resolutionsApi.middleware)
      .concat(transfersApi.middleware)
      .concat(tiposProteccionApi.middleware)
      .concat(cotitularesApi.middleware)
      .concat(benefInstitucionesApi.middleware)
      .concat(archivosApi.middleware)
      .concat(distribBenefInstitucionesApi.middleware)
      .concat(resolucionOrchestratorApi.middleware)

      // ---- Nuevos
      .concat(acuerdosDistribAutoresApi.middleware)
      .concat(proteccionesApi.middleware)
      .concat(cotitularidadInstApi.middleware)
      .concat(cotitularidadTecnoApi.middleware)

      .concat(technologyOrchestratorApi.middleware)
      .concat(tecnologiaProteccionesApi.middleware)
});
