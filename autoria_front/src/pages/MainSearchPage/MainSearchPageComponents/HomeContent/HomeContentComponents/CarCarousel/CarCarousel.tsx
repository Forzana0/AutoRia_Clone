import React, { useState } from 'react';
import './CarCarousel.css';
import CarCard from '../../../../../../components/carCard/CarCard';

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

interface CarCarouselProps {
    cars?: Car[];
}

const ITEMS_PER_PAGE = 3;

const CarCarousel: React.FC<CarCarouselProps> = ({ cars = [] }) => {
    const [page, setPage] = useState(0);
    const total = Math.ceil(cars.length / ITEMS_PER_PAGE);
    const visible = cars.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    return (
        <section className="car-carousel-section">
            <div className="section-header">
                <h2 className="section-title">ТОП-пропозиції</h2>
                {cars.length > ITEMS_PER_PAGE && (
                    <div className="carousel-controls">
                        <button
                            className="carousel-btn"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            className="carousel-btn"
                            onClick={() => setPage(p => Math.min(total - 1, p + 1))}
                            disabled={page >= total - 1}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {cars.length === 0 ? (
                <div className="carousel-empty">
                    <span>🚗</span>
                    <p>Поки що немає оголошень. Будьте першим!</p>
                </div>
            ) : (
                <div className="carousel-grid">
                    {visible.map(car => (
                        <CarCard key={car.id} {...car} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default CarCarousel;
