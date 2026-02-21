import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductPage.css';
import { UserCar } from '../../interfaces/Car';
import CarCard from '../../components/carCard/CarCard';

const API = 'http://localhost:5174';

const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [car, setCar] = useState<UserCar | null>(null);
    const [latestCars, setLatestCars] = useState<any[]>([]);
    const [sellerAdsCount, setSellerAdsCount] = useState<number | null>(null);
    const [sellerDescription, setSellerDescription] = useState<string | null>(null);
    const [sellerRating, setSellerRating] = useState<number>(0);
    const [sellerId, setSellerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePhoto, setActivePhoto] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carRes, allCarsRes] = await Promise.all([
                    axios.get(`${API}/api/Car/${id}`),
                    axios.get(`${API}/api/Car`),
                ]);
                const carData: UserCar = carRes.data;
                setCar(carData);

                const others = (allCarsRes.data as any[]).filter(c => c.id !== Number(id)).slice(0, 6);
                setLatestCars(others);

                // userId може бути як userId так і id в залежності від API
                const uid = carData.user?.userId || (carData.user as any)?.id;
                if (uid) {
                    setSellerId(uid);
                    try {
                        const [userAdsRes, userRes] = await Promise.all([
                            axios.get(`${API}/api/Car/user/${uid}`),
                            axios.get(`${API}/api/Accounts/GetUserById/${uid}`),
                        ]);
                        setSellerAdsCount(Array.isArray(userAdsRes.data) ? userAdsRes.data.length : 0);
                        setSellerDescription(userRes.data?.description || null);
                        setSellerRating(Number(userRes.data?.rating) || 0);
                    } catch {
                        setSellerAdsCount(0);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="pp-loading">Завантаження...</div>;
    if (!car) return <div className="pp-loading">Оголошення не знайдено</div>;

    const photos = car.photos || [];
    const mainPhoto = photos[activePhoto]?.name
        ? `${API}/images/1200_${photos[activePhoto].name}`
        : null;

    const sellerPhoto = car.user?.photo
        ? `${API}/images/200_${car.user.photo}`
        : null;

    const sellerName = car.user
        ? `${car.user.firstName || ''} ${car.user.lastName || ''}`.trim() || car.user.userName
        : 'Продавець';

    const details = [
        { icon: '📅', label: `${car.year} рік` },
        { icon: '📍', label: car.city?.name || '—' },
        { icon: '🛣️', label: `${car.mileage?.toLocaleString()} км` },
        { icon: '⚡', label: car.engineVolume ? `${car.engineVolume.volume} — об'єм двигуна` : '—' },
        { icon: '⛽', label: car.fuelTypes?.name || '—' },
        { icon: '🚗', label: car.bodyType?.name || car.transmissionType?.name || '—' },
    ].filter(d => d.label !== '—');

    const allDetails = [
        { label: 'Рік випуску', value: car.year },
        { label: 'Марка', value: car.carBrand?.name },
        { label: 'Модель', value: car.carModel?.name },
        { label: 'Тип кузова', value: car.bodyType?.name },
        { label: 'Стан', value: car.stage },
        { label: 'Пробіг', value: `${car.mileage?.toLocaleString()} км` },
        { label: 'VIN', value: car.vin },
        { label: 'Коробка передач', value: car.transmissionType?.name },
        { label: 'К-сть місць', value: car.numberOfSeats ? `${car.numberOfSeats.number} (${car.numberOfSeats.seatType})` : null },
        { label: 'Тип палива', value: car.fuelTypes?.name },
        { label: "Об'єм двигуна", value: car.engineVolume ? `${car.engineVolume.volume} л` : null },
        { label: 'Тип транспорту', value: car.transportType?.name },
        { label: 'Місто', value: car.city?.name },
        { label: 'Колір', value: car.color ? `${car.color.color}${car.metallic ? ' (Металік)' : ''}` : null },
        { label: 'Участь в ДТП', value: car.accidentParticipation ? 'Так' : 'Ні' },
        { label: 'Кондиціонер', value: car.hasAirConditioning ? 'Так' : null },
        { label: 'Підігрів сидінь', value: car.hasHeatedSeats ? 'Так' : null },
        { label: 'Шкіряний салон', value: car.hasLeatherInterior ? 'Так' : null },
        { label: 'Електросклопідйомники', value: car.hasPowerWindows ? 'Так' : null },
        { label: 'Гідропідсилювач', value: car.hasPowerSteering ? 'Так' : null },
        { label: 'Торг', value: car.isBargainAvailable ? 'Так' : null },
        { label: 'Обмін', value: car.isExchangeAvailable ? 'Так' : null },
        { label: 'Розстрочка', value: car.isInstallmentAvailable ? 'Так' : null },
        { label: 'Розмитнений', value: car.isNotCustomsCleared ? 'Ні' : 'Так' },
    ].filter(d => d.value != null && d.value !== '');

    return (
        <div className="pp-wrapper">
            <div className="pp-hero">
                <div className="pp-gallery">
                    <div className="pp-main-photo">
                        {mainPhoto
                            ? <img src={mainPhoto} alt="car" />
                            : <div className="pp-no-photo">Фото відсутнє</div>
                        }
                    </div>
                    {photos.length > 1 && (
                        <div className="pp-thumbs">
                            {photos.map((p, i) => (
                                <div
                                    key={i}
                                    className={`pp-thumb ${i === activePhoto ? 'active' : ''}`}
                                    onClick={() => setActivePhoto(i)}
                                >
                                    <img src={`${API}/images/200_${p.name}`} alt={`photo-${i}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pp-seller-card">
                    {/* Реальний рейтинг з API */}
                    <div className="pp-seller-rating">
                        {car.user ? `${sellerRating}/5 ★` : ''}
                    </div>
                    <div className="pp-seller-top">
                        <div className="pp-seller-avatar">
                            {sellerPhoto
                                ? <img src={sellerPhoto} alt={sellerName} />
                                : <div className="pp-seller-initials">
                                    {sellerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            }
                        </div>
                        <h3 className="pp-seller-name">{sellerName}</h3>
                    </div>

                    {car.user && (
                        <div className="pp-seller-info">
                            {sellerDescription && (
                                <p className="pp-seller-desc">{sellerDescription}</p>
                            )}
                            {sellerAdsCount !== null && (
                                <span className="pp-seller-ads-count">
                                    📋 Оголошень: {sellerAdsCount}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="pp-seller-actions">
                        <button
                            className="pp-btn-profile"
                            onClick={() => {
                                const uid = sellerId
                                    || car.user?.userId
                                    || (car.user as any)?.id
                                    || (car.user as any)?.userId;
                                if (uid) navigate(`/seller/${uid}`);
                            }}
                        >
                            Профіль
                        </button>
                    </div>

                    <div className="pp-verified">
                        ✓ Продавець перевірений банком
                    </div>
                </div>
            </div>

            <div className="pp-content">
                <div className="pp-info-left">
                    <div className="pp-title-block">
                        <div className="pp-car-title">
                            <span className="pp-brand">{car.carBrand?.name} / {car.carModel?.name}</span>
                            {car.stage && <span className="pp-stage">• {car.stage}</span>}
                        </div>
                        <div className="pp-price-block">
                            <span className="pp-price-usd">$ {car.price?.toLocaleString()}</span>
                        </div>
                        <div className="pp-date">
                            📅 {new Date(car.dateCreated).toLocaleDateString('uk-UA')}
                        </div>
                    </div>

                    <div className="pp-quick-details">
                        {details.map((d, i) => (
                            <div key={i} className="pp-detail-item">
                                <span className="pp-detail-icon">{d.icon}</span>
                                <span>{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pp-description">
                    <p>{car.description || 'Опис відсутній'}</p>
                </div>
            </div>

            <div className="pp-all-details">
                <h3 className="pp-section-title">Всі характеристики</h3>
                <div className="pp-details-grid">
                    {allDetails.map((d, i) => (
                        <div key={i} className="pp-detail-row">
                            <span className="pp-detail-label">{d.label}</span>
                            <span className="pp-detail-value">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {latestCars.length > 0 && (
                <div className="pp-latest">
                    <h3 className="pp-section-title">Останні додані оголошення</h3>
                    <div className="pp-latest-grid">
                        {latestCars.map(c => (
                            <CarCard
                                key={c.id}
                                id={c.id}
                                title={`${c.carBrand?.name || ''} ${c.carModel?.name || ''} ${c.year || ''}`.trim()}
                                location={c.city?.name}
                                mileage={c.mileage ? `${Math.round(c.mileage / 1000)} тис. км` : undefined}
                                transmission={c.transmissionType?.name}
                                fuel={c.fuelTypes?.name}
                                priceUsd={c.price || 0}
                                image={c.photos?.[0]?.name ? `${API}/images/800_${c.photos[0].name}` : undefined}
                            />
                        ))}
                    </div>
                    <div className="pp-view-all">
                        <button onClick={() => navigate('/search')}>Дивитись всі оголошення</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
