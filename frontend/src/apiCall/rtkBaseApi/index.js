import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const rtkBaseApi = createApi({
    reducerPath: 'rtkBaseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/v1',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: () => ({}),
});
