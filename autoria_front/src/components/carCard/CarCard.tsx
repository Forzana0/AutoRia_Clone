import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CarCard.css';
import defaultImg from '../../images/default.png';
import { useFavorites } from '../../hooks/useFavorites';

interface CarCardProps {
    id?: number | string;
    image?: string;
    title: string;
    location?: string;
    mileage?: string;
    transmission?: string;
    fuel?: string;
    priceUsd: number;
    priceUah?: number;
}

const CarCard: React.FC<CarCardProps> = ({
                                             id, image, title, location, mileage, transmission, fuel, priceUsd, priceUah,
                                         }) => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const numId = id ? Number(id) : 0;
    const favorite = numId ? isFavorite(numId) : false;
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="car-card" onClick={() => id && navigate(`/product/${id}`)}>
            <img
                className="car-card-image"
                src={image || defaultImg}
                alt={title}
                onError={e => { (e.target as HTMLImageElement).src = defaultImg; }}
            />
            <div className="car-card-body">
                <div className="car-card-title">{title}</div>

                {location && (
                    <div className="car-card-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {location}
                    </div>
                )}

                <div className="car-card-tags">
                    {mileage && <span className="car-tag">{mileage}</span>}
                    {transmission && <span className="car-tag">{transmission}</span>}
                    {fuel && <span className="car-tag">{fuel}</span>}
                </div>

                <div className="car-card-price">
                    <span className="price-usd">{priceUsd.toLocaleString()} $</span>
                    {priceUah && <span className="price-uah">{priceUah.toLocaleString()} ₴</span>}

                    {isLoggedIn && numId > 0 && (
                        <button
                            className={`car-card-fav-btn ${favorite ? 'active' : ''}`}
                            onClick={e => toggleFavorite(numId, e)}
                            title={favorite ? 'Видалити з улюблених' : 'Додати в улюблені'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24"
                                 fill={favorite ? 'currentColor' : 'none'}
                                 stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarCard;
