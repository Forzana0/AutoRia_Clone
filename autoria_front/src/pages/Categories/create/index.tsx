import {Button, Form, type FormProps, Input, message} from "antd";
import type {ICategoryCreate, ServerError} from "../../../services/types.ts";
import ImageUploadFormItem from "../../../components/ui/form/ImageUploadFormItem.tsx";
import {useCreateCategoryMutation} from "../../../services/apiCategory.ts";
import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";
import {useFormServerErrors} from "../../../utilities/useFormServerErrors.ts";
import {useNavigate} from "react-router";


const CategoriesCreatePage: React.FC = () => {

    const navigate = useNavigate();

    const [createCategory, {isLoading}] = useCreateCategoryMutation();

    const [form] = Form.useForm<ICategoryCreate>();
    const setServerErrors = useFormServerErrors(form);

    const onFinish: FormProps<ICategoryCreate>['onFinish'] = async (values) => {
        try {
            const result = await createCategory(values).unwrap();
            message.success(`Категорія "${result.name}" створена успішно`);
            navigate('/admin/categories');
        } catch (error) {
            const serverError = error as ServerError;

            if (serverError?.status === 400 && serverError?.data?.errors) {
                setServerErrors(serverError.data.errors);
            } else {
                message.error("Сталася помилка при створенні категорії");
            }
        }
    };


    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {isLoading && <LoadingOverlay />}
            <div className="max-w-full overflow-x-auto">
                <h1>Додати категорію</h1>
                <Form
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onFinish={onFinish}
                    layout="horizontal"
                >
                    <Form.Item<ICategoryCreate>
                        label="Назва"
                        name="name"
                        rules={[{ required: true, message: 'Вкажіть назву категорії' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<ICategoryCreate>
                        label="Слаг"
                        name="slug"
                        rules={[{ required: true, message: 'Вкажіть слаг категорії' }]}
                    >
                        <Input />
                    </Form.Item>


                    <ImageUploadFormItem name="imageFile" label="Фоточка" />

                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Додати
                        </Button>
                    </Form.Item>
                </Form>

            </div>
        </div>
    );
}

export default CategoriesCreatePage;