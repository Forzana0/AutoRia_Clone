import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CarSearchForm.css';
import Avtobusu from '../../../../../images/avtobusu.png'
import Lehkovi from '../../../../../images/lehkovi.png';
import Vantashni from '../../../../../images/vantashni.png';
import Komertsini from '../../../../../images/komertsini.png';
import Moto from '../../../../../images/moto.png';
import Spestehnika from '../../../../../images/spestehnika.png';
import Pruchepu from '../../../../../images/pruchepu.png';
import Vodnui from '../../../../../images/vodnui.png';

const API = 'http://localhost:5174';

interface BrandVm { id: number; name: string; models: { id: number; name: string }[]; }
interface RegionVm { id: number; name: string; cities: { id: number; name: string }[]; }
interface TransportType { id: number; name: string; }

// SVG іконки транспорту — точно за дизайном
const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
    'Легковий': <img src={Lehkovi} width={38} height={15} alt="car" />,
    'Легкові':  <img src={Lehkovi} width={38} height={15} alt="car" />,
    'Вантажний': <img src={Vantashni} width={38} height={18} alt="car" />,
    'Вантажні':  <img src={Vantashni} width={38} height={18} alt="car" />,
    'Комерційний': <img src={Komertsini} width={36} height={16} alt="car" />,
    'Комерційні':  <img src={Komertsini} width={36} height={16} alt="car" />,
    'Автобус':  <img src={Avtobusu} width={36} height={15} alt="car" />,
    'Автобуси': <img src={Avtobusu} width={36} height={15} alt="car" />,
    'Мото': <img src={Moto} width={36} height={18} alt="car" />,
    'Спецтехніка': <img src={Spestehnika} width={36} height={18} alt="car" />,
    'Причіп':  <img src={Pruchepu} width={36} height={18} alt="car" />,
    'Причепи': <img src={Pruchepu} width={36} height={18} alt="car" />,
    'Водний': <img src={Vodnui} width={36} height={18} alt="car" />,
    'Водні':  <img src={Vodnui} width={36} height={18} alt="car" />,
};

const getTransportIcon = (name: string): React.ReactNode => {
    if (TRANSPORT_ICONS[name]) return TRANSPORT_ICONS[name];
    const key = Object.keys(TRANSPORT_ICONS).find(k =>
        k.toLowerCase().startsWith(name.toLowerCase().slice(0, 4)) ||
        name.toLowerCase().startsWith(k.toLowerCase().slice(0, 4))
    );
    return key ? TRANSPORT_ICONS[key] : TRANSPORT_ICONS['Легкові'];
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
                            {getTransportIcon(t.name)}
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
