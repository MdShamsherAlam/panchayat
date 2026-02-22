import { combineReducers } from '@reduxjs/toolkit';
import { rtkBaseApi } from '../apiCall/rtkBaseApi';

const rootReducers = combineReducers({
    [rtkBaseApi.reducerPath]: rtkBaseApi.reducer,
    // Add other slices here
});

export default rootReducers;
