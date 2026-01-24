import {Row} from 'antd';
import {useGetAllProductsQuery} from "../../../services/apiProducts.ts";
import ProductCard from "../../../components/ui/card/ProductCard.tsx";
import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";



export const ProductsPage: React.FC = () => {
    const {data: products, isLoading, isError} = useGetAllProductsQuery();

    if (isError) return <p>Помилка при завантаженні продуктів</p>;

    const uniqueProducts = products
        ? products.filter((product, index, self) =>
            index === self.findIndex((p) => p.slug === product.slug)
        )
        : [];

    return (
        <>
            {isLoading && <LoadingOverlay/>}
            <div style={{padding: 24}}>
                <Row gutter={[16, 16]}>
                    {uniqueProducts.map((product) => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </Row>
            </div>
        </>
    );
};


export default ProductsPage