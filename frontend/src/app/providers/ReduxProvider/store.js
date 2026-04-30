import { configureStore } from '@reduxjs/toolkit';
import { api } from '../../../shared/api';
import { authReducer } from '@entities/user';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});
