import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    useAddProductMutation,
    useGetIngredientsQuery,
    useGetSizesQuery,
} from "../../../../services/apiProducts.ts";
import {useGetAllCategoriesQuery} from "../../../../services/apiCategory.ts";
import type {IProductCreate} from "../../../../services/types.ts";
import type {UploadFile} from "antd";
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Typography,
    message,
} from "antd";
import LoadingOverlay from "../../../../components/ui/loading/LoadingOverlay.tsx";
import DragDropUpload from "../../../../components/ui/images/DragDropUpload.tsx";
import type {RcFile} from "antd/es/upload";

const {Title} = Typography;

const AdminProductCreatePage: React.FC = () => {
    const [form] = Form.useForm();
    const [images, setImages] = useState<UploadFile[]>([]);
    const [ingredientIds, setIngredientIds] = useState<number[]>([]);

    const navigate = useNavigate();

    const {data: sizes = []} = useGetSizesQuery();
    const {data: categories = []} = useGetAllCategoriesQuery();
    const {data: ingredients = []} = useGetIngredientsQuery();
    const [createProduct, {isLoading}] = useAddProductMutation();

    const handleIngredientToggle = (id: number) => {
        setIngredientIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const onFinish = async (values: IProductCreate) => {
        try {
            // console.log("values", values);
            const imageFiles = images
                .map((f) => f.originFileObj)
                .filter((f): f is RcFile => f instanceof File);

            const dto: IProductCreate = {
                ...values,
                ingredientIds,
                imageFiles: imageFiles
            };

            // console.log("Pera", dto);
            await createProduct(dto).unwrap();
            navigate('/admin/products');

        } catch (err: any) {
            console.error(err);
            message.error("Помилка створення продукту");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Title level={3}>Створення продукту</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    name: "",
                    slug: "",
                    price: 0,
                    weight: 0,
                    categoryId: undefined,
                    productSizeId: undefined,
                }}
            >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border rounded-2xl p-4 h-full">
                        <DragDropUpload fileList={images} setFileList={setImages}/>
                    </div>

                    <div className="border rounded-2xl p-4 h-full">
                        <Form.Item
                            label="Назва"
                            name="name"
                            rules={[{required: true, message: "Введіть назву"}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="Слаг (латинськими)"
                            name="slug"
                            rules={[{required: true, message: "Введіть слаг"}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="Вага (г)"
                            name="weight"
                            rules={[{required: true, message: "Введіть вагу"}]}
                        >
                            <InputNumber className="w-full" min={0}/>
                        </Form.Item>

                        <Form.Item
                            label="Ціна (грн)"
                            name="price"
                            rules={[{required: true, message: "Введіть ціну"}]}
                        >
                            <InputNumber className="w-full" min={0}/>
                        </Form.Item>

                        <Form.Item
                            label="Розмір"
                            name="productSizeId"
                            rules={[{required: true, message: "Оберіть розмір"}]}
                        >
                            <Select placeholder="Оберіть розмір">
                                {sizes.map((size) => (
                                    <Select.Option key={size.id} value={size.id}>
                                        {size.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Категорія"
                            name="categoryId"
                            rules={[{required: true, message: "Оберіть категорію"}]}
                        >
                            <Select placeholder="Оберіть категорію">
                                {categories.map((cat) => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Додати продукт
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </Form>

            <div className="border rounded-2xl p-4">
                <h5 className="text-lg font-semibold mb-3">Інгредієнти</h5>
                <div className="flex flex-wrap gap-3">
                    {ingredients.length === 0 && (
                        <span className="text-gray-500">Завантаження інгредієнтів...</span>
                    )}
                    {ingredients.map((ing) => {
                        const selected = ingredientIds.includes(ing.id);
                        return (
                            <div
                                key={ing.id}
                                onClick={() => handleIngredientToggle(ing.id)}
                                className={`cursor-pointer px-3 py-1 rounded-lg border ${
                                    selected
                                        ? "border-green-500 bg-green-100"
                                        : "border-gray-300 bg-gray-100"
                                }`}
                            >
                                {ing.name}
                            </div>
                        );
                    })}
                    {ingredientIds.length === 0 && (
                        <span className="text-sm text-gray-400">
              Жодного інгредієнта не додано
            </span>
                    )}
                </div>
            </div>
            {isLoading && (
                <LoadingOverlay/>
            )}
        </div>
    );
};

export default AdminProductCreatePage;
