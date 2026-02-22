import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import rootReducers from './rootReducers';
import { rtkBaseApi } from '../apiCall/rtkBaseApi';

// Preloaded state from localStorage
const preloadedState = localStorage.getItem('preloadedState')
    ? JSON.parse(localStorage.getItem('preloadedState'))
    : {};

export const store = configureStore({
    reducer: rootReducers,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(rtkBaseApi.middleware),
});

setupListeners(store.dispatch);

export default store;
