import React from 'react';
import './SearchCarCard.css';
import { Car } from '../../../../../interfaces/Car';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../../../../hooks/useFavorites';

const API = 'http://localhost:5174';

const SearchCarCard: React.FC<Car> = ({
                                          id, carBrand, carModel, year, city,
                                          fuelTypes, transmissionType, mileage, photos, price
                                      }) => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const imgSrc = photos?.[0]?.name
        ? `${API}/images/400_${photos[0].name}`
        : null;

    const title = `${carBrand?.name || ''} ${carModel?.name || ''} ${year || ''}`.trim();

    const tags = [
        mileage ? `${Math.round(mileage / 1000)} тис. км` : null,
        transmissionType?.name || null,
        fuelTypes?.name || null,
    ].filter(Boolean);

    const favorite = isFavorite(id);
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="scc-card" onClick={() => navigate(`/product/${id}`)}>
            {isLoggedIn && (
                <button
                    className={`scc-fav-btn ${favorite ? 'active' : ''}`}
                    onClick={e => toggleFavorite(id, e)}
                    title={favorite ? 'Видалити з улюблених' : 'Додати в улюблені'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24"
                         fill={favorite ? 'currentColor' : 'none'}
                         stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </button>
            )}
            <div className="scc-img">
                {imgSrc
                    ? <img src={imgSrc} alt={title} />
                    : <div className="scc-no-img">📷</div>
                }
            </div>
            <div className="scc-body">
                <h3 className="scc-title">{title}</h3>
                {city?.name && <div className="scc-city">📍 {city.name}</div>}
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
