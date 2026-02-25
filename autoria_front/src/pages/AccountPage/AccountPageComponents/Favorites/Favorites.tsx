import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';

const API = 'http://localhost:5174';
interface CarVm {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    year?: number;
    city?: { name: string };
    mileage?: number;
    transmissionType?: { name: string };
    fuelTypes?: { name: string };
    price?: number;
    photos?: { name: string; priority: number }[];
}

const Favorites: React.FC = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState<CarVm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        fetch(`${API}/api/Favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setCars(Array.isArray(data) ? data : []))
            .catch(e => console.error('Favorites error:', e))
            .finally(() => setLoading(false));
    }, []);

    const removeFavorite = async (carId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) return;
        setCars(prev => prev.filter(c => c.id !== carId));
        await fetch(`${API}/api/Favorites/${carId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    if (loading) return <div className="fav-loading">Завантаження...</div>;

    if (cars.length === 0) return (
        <div className="fav-wrapper">
            <div className="fav-empty">
                <div className="fav-empty-icon">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <p>У вас ще немає улюблених оголошень</p>
                <button className="fav-browse-btn" onClick={() => navigate('/search')}>
                    ★&nbsp; Більше оголошень
                </button>
            </div>
        </div>
    );

    return (
        <div className="fav-wrapper">
            {cars.map(car => {
                const title = `${car.carBrand?.name || ''} ${car.carModel?.name || ''} ${car.year || ''}`.trim();
                const sortedPhotos = [...(car.photos || [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
                const img = sortedPhotos[0]?.name ? `${API}/images/400_${sortedPhotos[0].name}` : null;
                const tags = [
                    car.mileage ? `${Math.round(car.mileage / 1000)} тис. км` : null,
                    car.transmissionType?.name || null,
                    car.fuelTypes?.name || null,
                ].filter(Boolean);
                return (
                    <div key={car.id} className="fav-card" onClick={() => navigate(`/product/${car.id}`)}>
                        <div className="fav-img">
                            {img
                                ? <img src={img} alt={title} />
                                : <div className="fav-no-img">📷</div>
                            }
                        </div>

                        <div className="fav-body">
                            <h3 className="fav-title">{title}</h3>
                            {car.city?.name && (
                                <div className="fav-city">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#3b5bdb">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span>{car.city.name}</span>
                                </div>
                            )}
                            <div className="fav-tags">
                                {tags.map((t, i) => <span key={i} className="fav-tag">{t}</span>)}
                            </div>
                        </div>

                        <div className="fav-right" onClick={e => e.stopPropagation()}>
                            <span className="fav-price-usd">{car.price ? `${car.price.toLocaleString()} $` : '—'}</span>
                            <button
                                className="fav-remove-btn"
                                onClick={e => removeFavorite(car.id, e)}
                                title="Видалити з улюблених"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}

            <p className="fav-empty-hint">На жаль у вас більше немає улюблених оголошень!</p>
            <div className="fav-footer">
                <button className="fav-browse-btn" onClick={() => navigate('/search')}>
                    ★&nbsp; Більше оголошень
                </button>
            </div>
        </div>
    );
};

export default Favorites;
