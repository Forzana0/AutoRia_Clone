import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CarSearchForm.css';

const API = 'http://localhost:5174';

interface BrandVm { id: number; name: string; models: { id: number; name: string }[]; }
interface RegionVm { id: number; name: string; cities: { id: number; name: string }[]; }
interface TransportType { id: number; name: string; }

const TRANSPORT_ICONS: Record<string, string> = {
    'Легковий': '🚗', 'Вантажний': '🚚', 'Комерційний': '🚐',
    'Автобус': '🚌', 'Мото': '🏍️', 'Спецтехніка': '🚜',
    'Причіп': '🚛', 'Водний': '⛵',
};

const YEARS = Array.from({ length: 40 }, (_, i) => 2025 - i);

const CarSearchForm: React.FC = () => {
    const navigate = useNavigate();
    const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
    const [brands, setBrands] = useState<BrandVm[]>([]);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [models, setModels] = useState<{ id: number; name: string }[]>([]);

    const [activeTransport, setActiveTransport] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ttRes, bmRes, regRes] = await Promise.all([
                    axios.get(`${API}/api/TechnicalSpecifications/transporttypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/brandsandmodels`),
                    axios.get(`${API}/api/RegionalAndPricing`),
                ]);
                setTransportTypes(ttRes.data || []);
                setBrands(bmRes.data || []);
                const allCities: { id: number; name: string }[] = [];
                (regRes.data as RegionVm[]).forEach(r => r.cities?.forEach(c => allCities.push(c)));
                setCities(allCities);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const found = brands.find(b => b.name === selectedBrand);
        setModels(found?.models || []);
        setSelectedModel('');
    }, [selectedBrand, brands]);

    const handleSearch = async () => {
        try {
            const searchRequest = {
                carType: activeTransport || null,
                searchType: selectedStage || null,
                selectedBrand: selectedBrand || null,
                selectedModel: selectedModel || null,
                year: selectedYear || null,
                region: selectedCity || null,
                price: (priceFrom || priceTo) ? `${priceFrom || '0'}-${priceTo || '999999'}` : null,
                vinChecked: false,
            };
            const res = await axios.post(`${API}/api/Car/search`, searchRequest);
            navigate('/search', { state: { cars: res.data, searchParams: searchRequest } });
        } catch (e) {
            navigate('/search', { state: { cars: [], searchParams: {} } });
        }
    };

    const priceLabel = priceFrom || priceTo
        ? `${priceFrom || '0'} – ${priceTo || '∞'} $`
        : 'Ціна';

    return (
        <div className="car-search-form-wrapper">
            <div className="search-form-header">
                <h3>Пошук</h3>
            </div>

            <div className="category-tabs">
                {transportTypes.map((t, i) => (
                    <button
                        key={t.id ?? i}
                        className={`category-tab ${activeTransport === t.name ? 'active' : ''}`}
                        onClick={() => setActiveTransport(prev => prev === t.name ? '' : t.name)}
                    >
                        <span className="tab-icon">{TRANSPORT_ICONS[t.name] || '🚗'}</span>
                        <span className="tab-label">{t.name}</span>
                    </button>
                ))}
            </div>

            <div className="filter-row">
                {/* Стан */}
                <select className="filter-select" value={selectedStage} onChange={e => setSelectedStage(e.target.value)}>
                    <option value="">Стан</option>
                    <option value="Новий">Новий</option>
                    <option value="Вживаний">Вживаний</option>
                </select>

                {/* Марка */}
                <select className="filter-select" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                    <option value="">Марка</option>
                    {brands.map((b, i) => <option key={b.id ?? i} value={b.name}>{b.name}</option>)}
                </select>

                {/* Модель */}
                <select className="filter-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand}>
                    <option value="">Модель</option>
                    {models.map((m, i) => <option key={m.id ?? i} value={m.name}>{m.name}</option>)}
                </select>

                {/* Рік */}
                <select className="filter-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="">Рік випуску</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Ціна — діапазон */}
                <div className="filter-price-wrap">
                    <button
                        className={`filter-select filter-price-btn ${showPriceDropdown ? 'open' : ''}`}
                        onClick={() => setShowPriceDropdown(v => !v)}
                        type="button"
                    >
                        {priceLabel} <span className="price-chevron">▾</span>
                    </button>
                    {showPriceDropdown && (
                        <div className="price-dropdown">
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Від $"
                                    value={priceFrom}
                                    onChange={e => setPriceFrom(e.target.value)}
                                    min={0}
                                />
                                <span>—</span>
                                <input
                                    type="number"
                                    placeholder="До $"
                                    value={priceTo}
                                    onChange={e => setPriceTo(e.target.value)}
                                    min={0}
                                />
                            </div>
                            <button className="price-apply-btn" onClick={() => setShowPriceDropdown(false)}>
                                Застосувати
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="filter-row filter-row-bottom">
                {/* Місто */}
                <select className="filter-select" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                    <option value="">Вся Україна</option>
                    {cities.map((c, i) => <option key={c.id ?? i} value={c.name}>{c.name}</option>)}
                </select>

                {/* Пошук */}
                <button className="btn-search" onClick={handleSearch}>
                    Пошук
                </button>
            </div>
        </div>
    );
};

export default CarSearchForm;
