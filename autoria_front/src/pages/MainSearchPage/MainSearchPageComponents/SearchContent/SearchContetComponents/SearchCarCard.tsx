import React from 'react';
import './SearchCarCard.css';
import { Car } from '../../../../../interfaces/Car';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5174';

const SearchCarCard: React.FC<Car> = ({
                                          id, carBrand, carModel, year, city,
                                          fuelTypes, transmissionType, mileage, photos, price
                                      }) => {
    const navigate = useNavigate();

    const imgSrc = photos?.[0]?.name
        ? `${API}/images/400_${photos[0].name}`
        : null;

    const title = `${carBrand?.name || ''} ${carModel?.name || ''} ${year || ''}`.trim();

    const tags = [
        mileage ? `${Math.round(mileage / 1000)} тис. км` : null,
        transmissionType?.name || null,
        fuelTypes?.name || null,
    ].filter(Boolean);

    return (
        <div className="scc-card" onClick={() => navigate(`/product/${id}`)}>
            <div className="scc-img">
                {imgSrc
                    ? <img src={imgSrc} alt={title} />
                    : <div className="scc-no-img">📷</div>
                }
            </div>
            <div className="scc-body">
                <h3 className="scc-title">{title}</h3>
                {city?.name && (
                    <div className="scc-city">📍 {city.name}</div>
                )}
                <div className="scc-tags">
                    {tags.map((t, i) => <span key={i} className="scc-tag">{t}</span>)}
                </div>
                <div className="scc-price">
                    {price ? `${price.toLocaleString()} $` : '—'}
                </div>
            </div>
        </div>
    );
};

export default SearchCarCard;
