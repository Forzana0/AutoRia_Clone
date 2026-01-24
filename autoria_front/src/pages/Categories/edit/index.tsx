import { Button, Form, type FormProps, Input, message } from "antd";
import type { ICategoryEdit, ServerError } from "../../../services/types.ts";
import ImageUploadFormItem from "../../../components/ui/form/ImageUploadFormItem.tsx";
import { useEditCategoryMutation, useGetCategoryByIdQuery } from "../../../services/apiCategory.ts";
import { useNavigate, useParams } from "react-router";
import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";
import { useFormServerErrors } from "../../../utilities/useFormServerErrors.ts";
import {APP_ENV} from "../../../env";

const CategoriesEditPage: React.FC = () => {
    const navigate = useNavigate();
    //@ts-ignore
    const params = useParams<{ id: number }>();
    const id = params.id || 0;

    const { data: category, isLoading: isLoadingCategory, isError: isErrorCategory } = useGetCategoryByIdQuery(id);

    const [editCategory, { isLoading: isLoadingEdit }] = useEditCategoryMutation();

    const [form] = Form.useForm<ICategoryEdit>();
    const setServerErrors = useFormServerErrors(form);


    const onFinish: FormProps<ICategoryEdit>['onFinish'] = async (values) => {
        try {
            const result = await editCategory(values).unwrap();
            message.success(`Категорія "${result.name}" успішно змінена`);
            navigate('/admin/categories');
        } catch (error) {
            const serverError = error as ServerError;

            if (serverError?.status === 400 && serverError?.data?.errors) {
                setServerErrors(serverError.data.errors);
            } else {
                message.error("Сталася помилка при зміні категорії");
            }
        }
    };

    if (isLoadingCategory) return <p>Завантаження категорії...</p>;
    if (isErrorCategory || !category) return <p>Категорія не знайдена.</p>;



    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {(isLoadingEdit) && <LoadingOverlay />}
            <div className="max-w-full overflow-x-auto">
                <h1>Редагувати категорію</h1>
                <Form
                    form={form}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onFinish={onFinish}
                    layout="horizontal"
                    initialValues={category}
                >
                    {/* Ховаємо id у формі, бо потрібен для API, але не відображаємо */}
                    <Form.Item name="id" noStyle>
                        <Input type="hidden" />
                    </Form.Item>

                    <Form.Item<ICategoryEdit>
                        label="Назва"
                        name="name"
                        rules={[{ required: true, message: 'Вкажіть назву категорії' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<ICategoryEdit>
                        label="Слаг"
                        name="slug"
                        rules={[{ required: true, message: 'Вкажіть слаг категорії' }]}
                    >
                        <Input />
                    </Form.Item>

                    <ImageUploadFormItem name="imageFile"
                                         label="Нове фото"
                                         src={`${APP_ENV.IMAGES_400_URL}${category.image}`}
                    />

                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Змінити
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default CategoriesEditPage;
