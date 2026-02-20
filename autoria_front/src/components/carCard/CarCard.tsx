import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CarCard.css';
import defaultImg from '../../images/default.png';

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
                                             id,
                                             image,
                                             title,
                                             location,
                                             mileage,
                                             transmission,
                                             fuel,
                                             priceUsd,
                                             priceUah,
                                         }) => {
    const navigate = useNavigate();

    return (
        <div className="car-card" onClick={() => id && navigate(`/product/${id}`)}>
            <img
                className="car-card-image"
                src={image || defaultImg}
                alt={title}
                onError={(e) => { (e.target as HTMLImageElement).src = defaultImg; }}
            />
            <div className="car-card-body">
                <div className="car-card-title">{title}</div>

                {location && (
                    <div className="car-card-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
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
                </div>
            </div>
        </div>
    );
};

export default CarCard;
