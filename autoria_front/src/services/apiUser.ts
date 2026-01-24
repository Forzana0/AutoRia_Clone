import {createApi} from "@reduxjs/toolkit/query/react";
import {createBaseQuery} from "../utilities/createBaseQuery.ts";
import type {
    IAdminUserItem, ISearchResult, IUserSearchParams
} from "./types.ts";

export const apiUser = createApi({
    reducerPath: 'api/user',
    baseQuery: createBaseQuery('Users'),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        getAllUsers: builder.query<IAdminUserItem[], void>({
            query: () => 'list',
            providesTags: ['Users'],
        }),
        searchUsers: builder.query<ISearchResult<IAdminUserItem>, IUserSearchParams>({
            query: (params) => ({
                url: 'search',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map((u: IAdminUserItem) => ({ type: 'Users' as const, id: u.id })),
                        { type: 'Users', id: 'PARTIAL-LIST' },
                    ]
                    : [{ type: 'Users', id: 'PARTIAL-LIST' }],
        }),
    }),
});


export const {
    useGetAllUsersQuery,
    useSearchUsersQuery
} = apiUser;