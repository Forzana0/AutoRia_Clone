import { Link } from "react-router-dom";
import {useGetAllCategoriesQuery} from "../../services/apiCategory.ts";
import {APP_ENV} from "../../env";

const UserHomePage: React.FC = () => {
    // Отримуємо категорії з API
    const { data: categories, error, isLoading } = useGetAllCategoriesQuery();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="px-6 pt-20 pb-32 text-center bg-gradient-to-b from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                    Смачна доставка — просто додому
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Обирай улюблені страви з нашого меню та отримуй їх швидко і гарячими.
                </p>
                <Link
                    to="/products"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-lg transition"
                >
                    Переглянути меню
                </Link>
            </section>

            {/* Categories / Features */}
            <section className="px-6 max-w-7xl mx-auto mt-10">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                    Популярні категорії
                </h2>

                {isLoading && (
                    <p className="text-center text-gray-500 dark:text-gray-400">Завантаження...</p>
                )}
                {error && (
                    <p className="text-center text-red-600 dark:text-red-400">
                        Помилка завантаження категорій
                    </p>
                )}
                {categories && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Link
                                to={`/menu/${cat.slug}`}
                                key={cat.id}
                                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition"
                            >
                                <img
                                    src={`${APP_ENV.IMAGES_400_URL}${cat.image}`}
                                    alt={cat.name}
                                    className="w-full h-48 object-cover transform group-hover:scale-105 transition"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-white text-lg font-medium">
                                    {cat.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Section */}
            <section className="mt-24 px-6 py-16 bg-orange-50 dark:bg-gray-800 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Знижка 10% на перше замовлення!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Використай промокод <span className="font-semibold">WELCOME10</span> при оформленні замовлення.
                </p>
                <Link
                    to="/menu"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg"
                >
                    Замовити зараз
                </Link>
            </section>
        </div>
    );
};

export default UserHomePage;
