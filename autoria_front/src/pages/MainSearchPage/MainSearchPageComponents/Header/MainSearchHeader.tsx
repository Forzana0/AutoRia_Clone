import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainSearchHeader.css';
import heroCar from '../../../../images/hero-car.png'; // замініть на вашу картинку

const MainSearchHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="main-search-header">
            {/* Hero image - замініть src на реальне фото */}
            <img
                className="hero-image"
                src={heroCar}
                alt="Hero Car"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)';
                }}
            />
            <div className="hero-overlay" />

            {/* Search bar */}
            <div className="hero-search-bar">
        <span className="hero-search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
                <input type="text" placeholder="Пошук..." />
            </div>

            {/* Info card */}
            <div className="hero-info-card">
                <h2>Твій автомобіль — на відстані одного кліку</h2>
                <p>Обирай, порівнюй та купуй авто без зайвих клопотів</p>
                <div className="hero-card-buttons">
                    <button className="btn-primary" onClick={() => navigate('/search')}>Знайти авто</button>
                    <button className="btn-outline" onClick={() => navigate('/post-ad')}>+ Додати оголошення</button>
                </div>
            </div>
        </div>
    );
};

export default MainSearchHeader;
