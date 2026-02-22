import { rtkBaseApi } from "../../rtkBaseApi";

export const homeApi = rtkBaseApi.injectEndpoints({
    endpoints: (builder) => ({
        getHomeData: builder.query({
            query: () => "/example/test",
        }),
    }),
});

export const { useGetHomeDataQuery } = homeApi;
