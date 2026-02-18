import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeContent.css';
import CarCarousel from './HomeContentComponents/CarCarousel/CarCarousel';
import CarCard from '../../../../components/carCard/CarCard';

// Пропси — в майбутньому передавайте дані з API/Redux
interface Car {
    id: number | string;
    title: string;
    location?: string;
    mileage?: string;
    transmission?: string;
    fuel?: string;
    priceUsd: number;
    priceUah?: number;
    image?: string;
}

interface HomeContentProps {
    topCars?: Car[];
    latestCars?: Car[];
}

const services = [
    {
        title: 'Розміщення оголошення',
        description:
            'Швидке розміщення продажу автомобіля на платформі. Сервіс дозволяє користувачам створювати оголошення, додавати опис, фотографії та контактну інформацію для потенційних покупців.',
        btnLabel: 'Додати оголошення',
        route: '/post-ad',
    },
    {
        title: 'Обране та порівняння',
        description:
            'Зручна робота з обраними пропозиціями. Користувачі можуть зберігати оголошення до обраного та порівнювати їх між собою за ключовими параметрами.',
        btnLabel: 'Переглянути обране',
        route: '/account',
    },
    {
        title: 'Сповіщення про нові оголошення',
        description:
            'Актуальна інформація для користувача. Система сповіщень інформує користувача про нові оголошення відповідно до заданих параметрів пошуку.',
        btnLabel: 'Налаштувати сповіщення',
        route: '/account',
    },
];

const HomeContent: React.FC<HomeContentProps> = ({ topCars = [], latestCars = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="home-content">
            {/* TOP Carousel */}
            <CarCarousel cars={topCars} />

            {/* Latest ads */}
            <section className="latest-ads-section">
                <div className="section-header">
                    <h2 className="section-title">Останні додані оголошення</h2>
                </div>

                {latestCars.length === 0 ? (
                    <div className="ads-empty">
                        <span>📋</span>
                        <p>Оголошень поки немає. Додайте перше!</p>
                        <button className="btn-primary" onClick={() => navigate('/post-ad')}>
                            + Додати оголошення
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="ads-grid">
                            {latestCars.map(car => (
                                <CarCard key={car.id} {...car} />
                            ))}
                        </div>
                        <div className="btn-view-all-wrap">
                            <button className="btn-view-all" onClick={() => navigate('/search')}>
                                Дивитись всі оголошення
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* Info text section */}
            <div className="info-text-section">
                <div className="info-text-inner">
                    <h2>Купівля та продаж авто в Україні з Autly</h2>
                    <p>
                        Autly — це вебплатформа для купівлі і продажу автомобілів в Україні, розроблена з метою спрощення пошуку
                        транспортних засобів та взаємодії між продавцями і покупцями. Система об'єднує оголошення від приватних осіб
                        і автосалонів, надаючи користувачам доступ до актуальної інформації про автомобілі різних категорій.
                    </p>
                    <p>
                        Головна сторінка сервісу містить зручний пошуковий блок, який дозволяє здійснювати підбір автомобілів за основними
                        параметрами: марка, модель, рік випуску, тип пального, коробка передач і вартість. Користувачі мають можливість
                        переглядати як базові пошукові запити, так і транспортні засоби з пробігом, порівнювати оголошення та зберігати обрані варіанти.
                    </p>
                    <p>
                        Для продавців платформа Autly забезпечує простий механізм розміщення оголошень. Процес додавання автомобіля є
                        інтуїтивно зрозумілим і не потребує значних часових витрат. Користувачі можуть редагувати будь-яке активне оголошення,
                        відстежувати його актуальність та коригувати контактну інформацію.
                    </p>
                    <p>
                        З метою підвищення безпеки та інформативності сервіс надає додаткові функції, зокрема перевірку автомобіля за VIN-
                        кодом, оцінку ринкової вартості та інструменти для попереднього розрахунку витрат.
                    </p>
                </div>
            </div>

            {/* Services */}
            <div className="services-section">
                <div className="services-inner">
                    <h2>Корисні сервіси</h2>
                    <p>Платформа Autly надає користувачам набір допоміжних сервісів для зручної купівлі та продажу автомобілів.</p>
                    <div className="services-grid">
                        {services.map(s => (
                            <div className="service-card" key={s.title}>
                                <h3>{s.title}</h3>
                                <p>{s.description}</p>
                                <button className="btn-service" onClick={() => navigate(s.route)}>
                                    {s.btnLabel}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeContent;
