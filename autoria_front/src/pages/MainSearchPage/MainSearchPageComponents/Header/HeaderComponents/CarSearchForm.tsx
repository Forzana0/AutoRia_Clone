import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CarSearchForm.css';

const API = 'http://localhost:5174';

interface BrandVm { id: number; name: string; models: { id: number; name: string }[]; }
interface RegionVm { id: number; name: string; cities: { id: number; name: string }[]; }
interface TransportType { id: number; name: string; }

// SVG іконки транспорту
const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
    'Легковий': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M54 28l-6-12a4 4 0 00-3.6-2.2H19.6A4 4 0 0016 16l-6 12H8a2 2 0 00-2 2v10a2 2 0 002 2h2a6 6 0 0012 0h20a6 6 0 0012 0h2a2 2 0 002-2V30a2 2 0 00-2-2h-2zM20 42a3 3 0 110-6 3 3 0 010 6zm24 0a3 3 0 110-6 3 3 0 010 6zM14.8 28l4.4-8.8A2 2 0 0121 18h22a2 2 0 011.8 1.2L49.2 28H14.8z"/>
        </svg>
    ),
    'Вантажний': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M58 32l-6-10H40V18H8a2 2 0 00-2 2v22h4a6 6 0 0012 0h16a6 6 0 0012 0h4a2 2 0 002-2v-6a2 2 0 00-.9-1.7L58 32zM18 46a3 3 0 110-6 3 3 0 010 6zm28 0a3 3 0 110-6 3 3 0 010 6zM40 36V26h9.6l4.8 8H40z"/>
        </svg>
    ),
    'Комерційний': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M56 20H8a4 4 0 00-4 4v18h4a6 6 0 0012 0h24a6 6 0 0012 0h4V24a4 4 0 00-4-4zM16 46a3 3 0 110-6 3 3 0 010 6zm32 0a3 3 0 110-6 3 3 0 010 6zM8 34V26h48v8H8z"/>
        </svg>
    ),
    'Автобус': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M52 14H12a4 4 0 00-4 4v28h4a6 6 0 0012 0h16a6 6 0 0012 0h4V18a4 4 0 00-4-4zM18 46a3 3 0 110-6 3 3 0 010 6zm28 0a3 3 0 110-6 3 3 0 010 6zM10 30V20h44v10H10zm0 8v-6h44v6H10z"/>
        </svg>
    ),
    'Мото': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M50 28a12 12 0 00-4.6.9l-3.8-7.9H36l-4 8H22l-2-4h4v-4H12v4h4l4 8a12 12 0 1016.4 10.2l-2.8-5.6A8 8 0 1118 38a8 8 0 018 8 8 8 0 0016 0 8 8 0 00-8-8 8 8 0 00-4 1.1l-2-4h10.6l3.8-7.6A12 12 0 1050 28zm0 16a4 4 0 110-8 4 4 0 010 8zM26 46a4 4 0 110-8 4 4 0 010 8z"/>
        </svg>
    ),
    'Спецтехніка': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M56 34H44V22h-6l-8-8H16a4 4 0 00-4 4v24h4a6 6 0 0012 0h16a6 6 0 0012 0h4v-6a2 2 0 00-2-2zM22 46a3 3 0 110-6 3 3 0 010 6zm20 0a3 3 0 110-6 3 3 0 010 6zM14 36V20h10.4l8 8H38v8H14z"/>
        </svg>
    ),
    'Причіп': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M56 22H20a4 4 0 00-4 4v14H8v4h4a6 6 0 0012 0h24a6 6 0 0012 0h4V26a4 4 0 00-4-4zM16 46a3 3 0 110-6 3 3 0 010 6zm32 0a3 3 0 110-6 3 3 0 010 6zM18 36V28h36v8H18z"/>
        </svg>
    ),
    'Водний': (
        <svg viewBox="0 0 64 64" fill="currentColor" width="36" height="36">
            <path d="M54 32H36V20l-6-6H14a4 4 0 00-4 4v14H6l-2 4 4 4h4a6 6 0 0012 0h20a6 6 0 0012 0h4l2-4-2-4h-6zM20 46a3 3 0 110-6 3 3 0 010 6zm24 0a3 3 0 110-6 3 3 0 010 6zM12 32V20h16.4L34 25.6V32H12z"/>
        </svg>
    ),
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
        <div className="csf-wrapper">
            {/* Header */}
            <div className="csf-header">
                <span className="csf-title">Пошук</span>
            </div>

            {/* Transport type grid */}
            <div className="csf-transport-grid">
                {transportTypes.map((t, idx) => (
                    <button
                        key={t.id ?? idx}
                        className={`csf-transport-btn ${activeTransport === t.name ? 'active' : ''}`}
                        onClick={() => setActiveTransport(prev => prev === t.name ? '' : t.name)}
                        type="button"
                    >
                        <span className="csf-transport-icon">
                            {TRANSPORT_ICONS[t.name] || TRANSPORT_ICONS['Легковий']}
                        </span>
                        <span className="csf-transport-label">{t.name}</span>
                    </button>
                ))}
            </div>

            {/* Filters row */}
            <div className="csf-filters-row">
                <select className="csf-select" value={selectedStage} onChange={e => setSelectedStage(e.target.value)}>
                    <option value="">Стан</option>
                    <option value="Новий">Новий</option>
                    <option value="Вживаний">Вживаний</option>
                </select>

                <select className="csf-select" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                    <option value="">Марка</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>

                <select className="csf-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand}>
                    <option value="">Модель</option>
                    {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>

                <select className="csf-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="">Рік випуску</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Ціна */}
                <div className="csf-price-wrap">
                    <button
                        className={`csf-select csf-price-btn ${showPriceDropdown ? 'open' : ''}`}
                        onClick={() => setShowPriceDropdown(v => !v)}
                        type="button"
                    >
                        <span>{priceLabel}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    {showPriceDropdown && (
                        <div className="csf-price-dropdown">
                            <div className="csf-price-inputs">
                                <input type="number" placeholder="Від $" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} min={0} />
                                <span>—</span>
                                <input type="number" placeholder="До $" value={priceTo} onChange={e => setPriceTo(e.target.value)} min={0} />
                            </div>
                            <button className="csf-price-apply" onClick={() => setShowPriceDropdown(false)}>
                                Застосувати
                            </button>
                        </div>
                    )}
                </div>

                <select className="csf-select csf-select-region" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                    <option value="">Вся Україна</option>
                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            {/* Search button centered */}
            <div className="csf-search-wrap">
                <button className="csf-search-btn" onClick={handleSearch}>
                    Шукати
                </button>
            </div>
        </div>
    );
};

export default CarSearchForm;
