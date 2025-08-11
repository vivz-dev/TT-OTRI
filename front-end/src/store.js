import { configureStore } from '@reduxjs/toolkit';
import { resolutionsApi } from './services/resolutionsApi';
import { transfersApi }   from './services/transfersApi';

export const store = configureStore({
  reducer: {
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
    [transfersApi.reducerPath]  : transfersApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault()
      .concat(resolutionsApi.middleware)
      .concat(transfersApi.middleware),
});
