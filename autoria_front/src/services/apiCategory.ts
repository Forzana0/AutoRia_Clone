import {createApi} from "@reduxjs/toolkit/query/react";
import type {ICategoryCreate, ICategoryEdit, ICategoryItem} from "./types.ts";
import {createBaseQuery} from "../utilities/createBaseQuery.ts";
import {serialize} from "object-to-formdata";

export const apiCategory = createApi({
    reducerPath: 'api',
    baseQuery: createBaseQuery('categories'),
    tagTypes: ['Categories','Category'],
    endpoints: (builder) => ({
        getAllCategories: builder.query<ICategoryItem[], void>({
            query: () => '',
            providesTags: ['Categories'],
        }),
        getCategoryById: builder.query<ICategoryItem, number>({
            query: (id) => `${id}`,
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation<ICategoryItem, ICategoryCreate>({
            query: (newCategory) => {
                try {
                    const formData = serialize(newCategory);
                    return {
                        url: '',
                        method: 'POST',
                        body: formData
                    }
                }
                catch {
                    throw new Error('Error create category');
                }
            },
            invalidatesTags: ['Categories'],
        }),
        editCategory: builder.mutation<ICategoryItem, ICategoryEdit>({
            query: (newCategory) => {
                try {
                    const formData = serialize(newCategory);
                    return {
                        url: '',
                        method: 'PUT',
                        body: formData,
                    };
                } catch {
                    throw new Error('Error edit category');
                }
            },
            invalidatesTags: ['Categories', 'Category'],
        }),
        deleteCategory: builder.mutation<void, number>({
            query: (id) => {
                return {
                    url: `${id}`,
                    method: "DELETE"
                }
            },
            invalidatesTags: ['Categories','Category'],
        }),
    }),
});

export const {
    useGetAllCategoriesQuery,
    useEditCategoryMutation,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
} = apiCategory;