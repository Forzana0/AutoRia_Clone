import {useNavigate, useSearchParams} from "react-router";
import {useResetPasswordMutation, useValidateResetTokenQuery} from "../../../services/apiAccount.ts";
import {Button, Form, Input} from "antd";
import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";

interface INewPasswords {
    newPassword: string;
    confirmPassword: string
}

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = decodeURIComponent(searchParams.get("token") ?? "");
    const email = decodeURIComponent(searchParams.get("email") ?? "");

    const { data, isLoading } = useValidateResetTokenQuery({ token, email });
    const [resetPassword] = useResetPasswordMutation();

    const [form] = Form.useForm<INewPasswords>();
    const navigate = useNavigate();

    const onFinish = async (values: INewPasswords) => {
        if (values.newPassword !== values.confirmPassword) {
            form.setFields([
                {
                    name: "newPassword",
                    errors: ["Паролі не збігаються"]
                }
            ]);
            return;
        }

        try {
            await resetPassword({ newPassword: values.newPassword, token, email }).unwrap();
            console.log("Пароль успішно змінено");
            navigate("/login");
        } catch (err) {
            console.log("Помилка при зміні паролю", err);
        }
    };

    if (isLoading) return <LoadingOverlay />;

    if (!data?.isValid) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gray-100 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-red-500">Недійсне або протерміноване посилання</h2>
                    <p className="text-gray-600">Спробуйте повторити відновлення пароля ще раз.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[600px] flex items-center justify-center px-4 bg-gray-100">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 animate-fade-in">
                {isLoading && <LoadingOverlay />}

                <h2 className="text-2xl font-semibold text-center text-orange-500 mb-6">Скидання паролю</h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="space-y-4"
                >
                    <Form.Item<INewPasswords>
                        name="newPassword"
                        label={<span className="text-gray-700 dark:text-white font-medium">Новий пароль</span>}
                        rules={[{ required: true, message: 'Вкажіть новий пароль' }]}
                    >
                        <Input.Password className="rounded-lg py-2 px-4 dark:bg-gray-800 dark:text-white" />
                    </Form.Item>

                    <Form.Item<INewPasswords>
                        name="confirmPassword"
                        label={<span className="text-gray-700 dark:text-white font-medium">Повторіть пароль</span>}
                        rules={[{ required: true, message: 'Повторіть пароль' }]}
                    >
                        <Input.Password className="rounded-lg py-2 px-4 dark:bg-gray-800 dark:text-white" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            htmlType="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition"
                        >
                            Змінити пароль
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );

}

export default ResetPasswordPage;