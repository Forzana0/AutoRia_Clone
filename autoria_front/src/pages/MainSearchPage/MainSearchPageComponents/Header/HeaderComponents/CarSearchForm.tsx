import React, { useState } from 'react';
import './CarSearchForm.css';

const categories = [
    { id: 'legkovi', label: 'Легкові', icon: '🚗' },
    { id: 'vantazhni', label: 'Вантажні', icon: '🚚' },
    { id: 'komertsiini', label: 'Комерційні', icon: '🚐' },
    { id: 'avtobusy', label: 'Автобуси', icon: '🚌' },
    { id: 'moto', label: 'Мото', icon: '🏍️' },
    { id: 'spetstekhnika', label: 'Спецтехніка', icon: '🚜' },
    { id: 'prychepy', label: 'Причепи', icon: '🚛' },
    { id: 'vodny', label: 'Водний', icon: '⛵' },
];

const CarSearchForm: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('legkovi');

    return (
        <div className="car-search-form-wrapper">
            <div className="search-form-header">
                <h3>Пошук</h3>
                <button className="btn-advanced">Розширений пошук</button>
            </div>

            {/* Category tabs */}
            <div className="category-tabs">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <span className="tab-icon">{cat.icon}</span>
                        <span className="tab-label">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-row">
                <select className="filter-select">
                    <option>Стан</option>
                    <option>Новий</option>
                    <option>Вживаний</option>
                </select>
                <select className="filter-select">
                    <option>Марка</option>
                    <option>Audi</option>
                    <option>BMW</option>
                    <option>Mercedes-Benz</option>
                    <option>Toyota</option>
                    <option>Volkswagen</option>
                </select>
                <select className="filter-select">
                    <option>Модель</option>
                </select>
                <select className="filter-select">
                    <option>Рік випуску</option>
                    {Array.from({ length: 30 }, (_, i) => 2024 - i).map(y => (
                        <option key={y}>{y}</option>
                    ))}
                </select>
                <select className="filter-select">
                    <option>Ціна</option>
                    <option>До 5 000 $</option>
                    <option>До 10 000 $</option>
                    <option>До 20 000 $</option>
                    <option>До 50 000 $</option>
                </select>
                <select className="filter-select">
                    <option>Вся Україна</option>
                    <option>Київ</option>
                    <option>Львів</option>
                    <option>Одеса</option>
                    <option>Харків</option>
                    <option>Дніпро</option>
                </select>
            </div>
        </div>
    );
};

export default CarSearchForm;
