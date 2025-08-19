import { configureStore } from '@reduxjs/toolkit';

import { resolutionsApi } from './services/resolutionsApi';
import { transfersApi }   from './services/transfersApi';
import { technologiesApi } from './services/technologiesApi';
import { tiposProteccionApi } from './services/tiposProteccionApi';
import { cotitularidadesApi } from './services/cotitularidadesApi';
import { cotitularesApi } from './services/cotitularesApi';
import { cotitularInstitApi } from './services/cotitularInstitApi';
import { benefInstitucionesApi } from './services/benefInstitucionesApi';
import { resolucionOrchestratorApi } from './services/resolucionOrchestratorApi';


// ✅ nuevos
import { archivosApi } from './services/archivosApi';
import { distribBenefInstitucionesApi } from './services/distribBenefInstitucionesApi';
// (Si estuvieras usando un servicio separado para distribuciones, impórtalo también)

export const store = configureStore({
  reducer: {
    [technologiesApi.reducerPath]: technologiesApi.reducer,
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
    [transfersApi.reducerPath]  : transfersApi.reducer,
    [tiposProteccionApi.reducerPath]: tiposProteccionApi.reducer,
    [cotitularidadesApi.reducerPath]: cotitularidadesApi.reducer,
    [cotitularesApi.reducerPath]: cotitularesApi.reducer,
    [cotitularInstitApi.reducerPath]: cotitularInstitApi.reducer,
    [benefInstitucionesApi.reducerPath]: benefInstitucionesApi.reducer,

    // ✅ nuevos
    [archivosApi.reducerPath]: archivosApi.reducer,
    [distribBenefInstitucionesApi.reducerPath]: distribBenefInstitucionesApi.reducer,
    [resolucionOrchestratorApi.reducerPath]: resolucionOrchestratorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(technologiesApi.middleware)
      .concat(tiposProteccionApi.middleware)
      .concat(resolutionsApi.middleware)
      .concat(cotitularidadesApi.middleware)
      .concat(cotitularesApi.middleware)
      .concat(cotitularInstitApi.middleware)
      .concat(benefInstitucionesApi.middleware)

      // ✅ nuevos
      .concat(archivosApi.middleware)
      .concat(distribBenefInstitucionesApi.middleware)
      .concat(resolucionOrchestratorApi.middleware),
});
