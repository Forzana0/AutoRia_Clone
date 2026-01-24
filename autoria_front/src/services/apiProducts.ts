import {createApi} from "@reduxjs/toolkit/query/react";
import {createBaseQuery} from "../utilities/createBaseQuery.ts";
import type {IProductCreate, ProductIngredientModel, ProductItemModel, ProductSizeModel} from "./types.ts";
import {serialize} from "object-to-formdata";

export const apiProducts = createApi({
    reducerPath: 'api/products',
    baseQuery: createBaseQuery('products'),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getAllProducts: builder.query<ProductItemModel[], void>({
            query: () => '',
            providesTags: ['Products'],
        }),
        addProduct: builder.mutation<void, IProductCreate>({
            query: (product) => {
                // const formData = serialize(product, { indices: false });
                const formData = serialize(product);

                return {
                    url: "create",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ['Products'],
        }),
        getIngredients: builder.query<ProductIngredientModel[], void>({
            query: () => {

                return {
                    url: "ingredients",
                    method: "GET"
                };
            }
        }),
        getSizes: builder.query<ProductSizeModel[], void>({
            query: () => {

                return {
                    url: "sizes",
                    method: "GET"
                };
            }
        }),
    }),
});

export const {
    useGetAllProductsQuery,
    useAddProductMutation,
    useGetIngredientsQuery,
    useGetSizesQuery} = apiProducts;