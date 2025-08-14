import { configureStore } from '@reduxjs/toolkit';
import { resolutionsApi } from './services/resolutionsApi';
import { transfersApi }   from './services/transfersApi';
import { technologiesApi } from './services/technologiesApi';
import { tiposProteccionApi } from './services/tiposProteccionApi';
import { cotitularidadesApi } from './services/cotitularidadesApi';
import { cotitularesApi } from './services/cotitularesApi';
import { cotitularInstitApi } from './services/cotitularInstitApi';


export const store = configureStore({
  reducer: {
    [technologiesApi.reducerPath]: technologiesApi.reducer,
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
    [transfersApi.reducerPath]  : transfersApi.reducer,
    [tiposProteccionApi.reducerPath]: tiposProteccionApi.reducer,
    [cotitularidadesApi.reducerPath]: cotitularidadesApi.reducer,
    [cotitularesApi.reducerPath]: cotitularesApi.reducer,
    [cotitularInstitApi.reducerPath]: cotitularInstitApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(technologiesApi.middleware)
      .concat(tiposProteccionApi.middleware)
      .concat(resolutionsApi.middleware)
      .concat(cotitularidadesApi.middleware)
      .concat(cotitularesApi.middleware)
      .concat(cotitularInstitApi.middleware),

});
