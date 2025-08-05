import { configureStore } from '@reduxjs/toolkit';
import { resolutionsApi } from './services/resolutionsApi';

export const store = configureStore({
  reducer: {
    // RTK Query slice reducer
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(resolutionsApi.middleware),
});
