import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeContent.css';
import CarCarousel from './HomeContentComponents/CarCarousel/CarCarousel';
import CarCard from '../../../../components/carCard/CarCard';
import axios from 'axios';

interface CarVm {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    year?: number;
    city?: { name: string };
    mileage?: number;
    transmissionType?: { name: string };
    fuelTypes?: { name: string };
    price?: { amount: number; currencyType?: { name: string } };
    photos?: { name: string }[];
}

const mapCarVmToCard = (car: CarVm) => ({
    id: car.id,
    title: `${car.carBrand?.name || ''} ${car.carModel?.name || ''} ${car.year || ''}`.trim(),
    location: car.city?.name,
    mileage: car.mileage ? `${Math.round(car.mileage / 1000)} тис. км` : undefined,
    transmission: car.transmissionType?.name,
    fuel: car.fuelTypes?.name,
    priceUsd: car.price?.amount || 0,
    image: car.photos?.[0]?.name
        ? `http://localhost:5174/images/800_${car.photos[0].name}`
        : undefined,
});

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

const HomeContent: React.FC = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState<CarVm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const res = await axios.get('http://localhost:5174/api/Car');
                setCars(res.data || []);
            } catch (e) {
                console.error('Error fetching cars:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    const topCars = cars.slice(0, 3);
    const latestCars = cars.slice(0, 6);

    return (
        <div className="home-content">
            {/* TOP Carousel */}
            <CarCarousel cars={topCars.map(mapCarVmToCard)} />

            {/* Latest ads */}
            <section className="latest-ads-section">
                <div className="section-header">
                    <h2 className="section-title">Останні додані оголошення</h2>
                </div>

                {loading ? (
                    <div className="ads-empty"><p>Завантаження...</p></div>
                ) : latestCars.length === 0 ? (
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
                                <CarCard key={car.id} {...mapCarVmToCard(car)} />
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

            {/* Info text */}
            <div className="info-text-section">
                <div className="info-text-inner">
                    <h2>Купівля та продаж авто в Україні з Autly</h2>
                    <p>Autly — це вебплатформа для купівлі і продажу автомобілів в Україні, розроблена з метою спрощення пошуку транспортних засобів та взаємодії між продавцями і покупцями.</p>
                    <p>Головна сторінка сервісу містить зручний пошуковий блок, який дозволяє здійснювати підбір автомобілів за основними параметрами: марка, модель, рік випуску, тип пального, коробка передач і вартість.</p>
                    <p>Для продавців платформа Autly забезпечує простий механізм розміщення оголошень. Процес додавання автомобіля є інтуїтивно зрозумілим і не потребує значних часових витрат.</p>
                    <p>З метою підвищення безпеки та інформативності сервіс надає додаткові функції, зокрема перевірку автомобіля за VIN-кодом та оцінку ринкової вартості.</p>
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
