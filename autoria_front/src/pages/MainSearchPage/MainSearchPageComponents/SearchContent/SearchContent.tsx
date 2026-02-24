import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchContent.css';
import SearchCarCard from './SearchContetComponents/SearchCarCard';

const API = 'http://localhost:5174';
const PAGE_SIZE = 9;

interface CarItem {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    year?: number;
    city?: { name: string };
    mileage?: number;
    transmissionType?: { name: string };
    fuelTypes?: { name: string };
    engineVolume?: { volume: string };
    price?: number;
    photos?: { name: string }[];
    vin?: string;
}

interface FilterState {
    stage: string;
    transportType: string;
    carBrand: string;
    carModel: string;
    bodyType: string;
    yearFrom: string;
    yearTo: string;
    priceFrom: string;
    priceTo: string;
    city: string;
    fuelType: string;
    transmissionType: string;
    mileageFrom: string;
    mileageTo: string;
    engineVolume: string;
    numberOfSeats: string;
}

const defaultFilters: FilterState = {
    stage: '', transportType: '', carBrand: '', carModel: '', bodyType: '',
    yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', city: '',
    fuelType: '', transmissionType: '', mileageFrom: '', mileageTo: '',
    engineVolume: '', numberOfSeats: '',
};

const YEARS = Array.from({ length: 40 }, (_, i) => 2025 - i);

const SearchContent: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [allCars, setAllCars] = useState<CarItem[]>([]);
    const [displayedCars, setDisplayedCars] = useState<CarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [sortBy, setSortBy] = useState('default');

    // Dropdown data
    const [brands, setBrands] = useState<{ id: number; name: string; models: { id: number; name: string }[] }[]>([]);
    const [models, setModels] = useState<{ id: number; name: string }[]>([]);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [fuelTypes, setFuelTypes] = useState<{ id: number; name: string }[]>([]);
    const [transmissions, setTransmissions] = useState<{ id: number; name: string }[]>([]);
    const [transportTypes, setTransportTypes] = useState<{ id: number; name: string }[]>([]);
    const [bodyTypes, setBodyTypes] = useState<{ id: number; name: string }[]>([]);
    const [engineVolumes, setEngineVolumes] = useState<{ id: number; volume: string }[]>([]);
    const [numberOfSeats, setNumberOfSeats] = useState<{ id: number; number: number }[]>([]);

    // Load dropdown data for filter modal
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [bmRes, regRes, ftRes, trRes, ttRes, btRes, evRes, nsRes] = await Promise.all([
                    axios.get(`${API}/api/TechnicalSpecifications/brandsandmodels`),
                    axios.get(`${API}/api/RegionalAndPricing`),
                    axios.get(`${API}/api/TechnicalSpecifications/fueltypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/transmissiontypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/transporttypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/bodytypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/enginevolumes`),
                    axios.get(`${API}/api/TechnicalSpecifications/numberofseats`),
                ]);
                setBrands(bmRes.data || []);
                setFuelTypes(ftRes.data || []);
                setTransmissions(trRes.data || []);
                setTransportTypes(ttRes.data || []);
                setBodyTypes(btRes.data || []);
                setEngineVolumes(evRes.data || []);
                setNumberOfSeats(nsRes.data || []);
                const allCities: { id: number; name: string }[] = [];
                (regRes.data as any[]).forEach(r => r.cities?.forEach((c: any) => allCities.push(c)));
                setCities(allCities);
            } catch (e) { console.error(e); }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        const found = brands.find(b => b.name === filters.carBrand);
        setModels(found?.models || []);
    }, [filters.carBrand, brands]);

    // Load cars — from location.state or fetch all
    useEffect(() => {
        const loadCars = async () => {
            setLoading(true);
            try {
                // Якщо прийшли з пошуку (є state) — показуємо результати пошуку (навіть якщо порожні)
                if (location.state?.cars !== undefined) {
                    setAllCars(location.state.cars || []);
                } else {
                    // Якщо зайшли напряму на /search без пошуку — завантажуємо всі авто
                    const res = await axios.get(`${API}/api/Car`);
                    setAllCars(res.data || []);
                }
            } catch (e) {
                console.error(e);
                setAllCars([]);
            } finally {
                setLoading(false);
            }
        };
        loadCars();
    }, [location.state]);

    // Sort
    const sorted = [...allCars].sort((a, b) => {
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'year_desc') return (b.year || 0) - (a.year || 0);
        return 0;
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginatedCars = sorted.slice(0, currentPage * PAGE_SIZE);
    const hasMore = currentPage * PAGE_SIZE < sorted.length;

    const handleShowMore = () => setCurrentPage(p => p + 1);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'carBrand') setFilters(prev => ({ ...prev, carBrand: value, carModel: '' }));
    };

    const handleApplyFilter = async () => {
        setLoading(true);
        setShowFilter(false);
        setCurrentPage(1);
        try {
            const searchRequest = {
                carType: filters.transportType || null,
                searchType: filters.stage || null,
                selectedBrand: filters.carBrand || null,
                selectedModel: filters.carModel || null,
                bodyType: filters.bodyType || null,
                year: filters.yearFrom || null,
                region: filters.city || null,
                price: (filters.priceFrom || filters.priceTo)
                    ? `${filters.priceFrom || '0'}-${filters.priceTo || '999999'}`
                    : null,
                fuelType: filters.fuelType || null,
                transmissionType: filters.transmissionType || null,
                mileage: (filters.mileageFrom || filters.mileageTo)
                    ? `${filters.mileageFrom || '0'}-${filters.mileageTo || '9999999'}`
                    : null,
                engineVolume: filters.engineVolume || null,
                numberOfSeats: filters.numberOfSeats || null,
                vinChecked: false,
            };
            const res = await axios.post(`${API}/api/Car/search`, searchRequest);
            setAllCars(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters(defaultFilters);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    // Pagination pages array
    const getPagesArray = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [1];
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="sc-wrapper">
            {/* Breadcrumb */}
            <div className="sc-breadcrumb">
                <span onClick={() => navigate('/')} className="sc-breadcrumb-link">Головна</span>
                <span className="sc-breadcrumb-sep">/</span>
                <span>Усі оголошення</span>
            </div>

            {/* Search bar */}
            <div className="sc-search-bar">
                <span className="sc-search-icon">🔍</span>
                <input className="sc-search-input" placeholder="Пошук" readOnly />
            </div>

            {/* Toolbar */}
            <div className="sc-toolbar">
                <button className="sc-filter-btn" onClick={() => setShowFilter(true)}>
                    <span>⚙</span> Фільтри
                    {activeFiltersCount > 0 && <span className="sc-filter-badge">{activeFiltersCount}</span>}
                </button>
                <div className="sc-sort">
                    <span>Сортувати</span>
                    <select className="sc-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="default">за замовчуванням</option>
                        <option value="price_asc">ціна ↑</option>
                        <option value="price_desc">ціна ↓</option>
                        <option value="year_desc">рік ↓</option>
                    </select>
                </div>
            </div>

            {/* Cars grid */}
            {loading ? (
                <div className="sc-loading">Завантаження...</div>
            ) : paginatedCars.length === 0 ? (
                <div className="sc-empty">
                    <p>Нічого не знайдено. Спробуйте змінити параметри пошуку.</p>
                </div>
            ) : (
                <div className="sc-grid">
                    {paginatedCars.map(car => (
                        <SearchCarCard key={car.id} {...(car as any)} />
                    ))}
                </div>
            )}

            {/* Show more button */}
            {hasMore && !loading && (
                <div className="sc-show-more">
                    <button className="sc-show-more-btn" onClick={handleShowMore}>
                        Показати ще
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="sc-pagination">
                    <button
                        className="sc-page-btn sc-page-arrow"
                        onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >‹</button>

                    {getPagesArray().map((p, i) => (
                        p === '...'
                            ? <span key={`dots-${i}`} className="sc-page-dots">...</span>
                            : <button
                                key={p}
                                className={`sc-page-btn ${currentPage === p ? 'active' : ''}`}
                                onClick={() => handlePageClick(p as number)}
                            >{p}</button>
                    ))}

                    <button
                        className="sc-page-btn sc-page-arrow"
                        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >›</button>
                </div>
            )}

            {/* Filter Modal */}
            {showFilter && (
                <div className="sc-modal-overlay" onClick={() => setShowFilter(false)}>
                    <div className="sc-filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="sc-filter-header">
                            <h3>Шукати за фільтрами</h3>
                            <div className="sc-filter-header-actions">
                                <button className="sc-filter-clear" onClick={handleClearFilters}>Очистити фільтр</button>
                                <button className="sc-filter-close" onClick={() => setShowFilter(false)}>✕</button>
                            </div>
                        </div>

                        <div className="sc-filter-body">
                            {/* Тип транспорту */}
                            <div className="sc-filter-section">
                                <h4>Тип транспорту</h4>
                                <div className="sc-filter-chips">
                                    <button className={`sc-chip ${filters.transportType === '' ? 'active' : ''}`} onClick={() => handleFilterChange('transportType', '')}>Всі</button>
                                    {transportTypes.map(t => (
                                        <button key={t.id} className={`sc-chip ${filters.transportType === t.name ? 'active' : ''}`} onClick={() => handleFilterChange('transportType', t.name)}>{t.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Стан */}
                            <div className="sc-filter-section">
                                <h4>Стан</h4>
                                <div className="sc-filter-chips">
                                    {['', 'Новий', 'Вживаний'].map(s => (
                                        <button
                                            key={s}
                                            className={`sc-chip ${filters.stage === s ? 'active' : ''}`}
                                            onClick={() => handleFilterChange('stage', s)}
                                        >{s || 'Всі'}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Марка / Модель / Рік */}
                            <div className="sc-filter-section">
                                <h4>Марка</h4>
                                <div className="sc-filter-row-3">
                                    <select className="sc-filter-select" value={filters.carBrand} onChange={e => handleFilterChange('carBrand', e.target.value)}>
                                        <option value="">Марка</option>
                                        {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                    <select className="sc-filter-select" value={filters.carModel} onChange={e => handleFilterChange('carModel', e.target.value)} disabled={!filters.carBrand}>
                                        <option value="">Модель</option>
                                        {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                    <select className="sc-filter-select" value={filters.yearFrom} onChange={e => handleFilterChange('yearFrom', e.target.value)}>
                                        <option value="">Рік випуску</option>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Тип кузова */}
                            <div className="sc-filter-section">
                                <h4>Тип кузова</h4>
                                <div className="sc-filter-chips">
                                    <button className={`sc-chip ${filters.bodyType === '' ? 'active' : ''}`} onClick={() => handleFilterChange('bodyType', '')}>Всі</button>
                                    {bodyTypes.map(b => (
                                        <button key={b.id} className={`sc-chip ${filters.bodyType === b.name ? 'active' : ''}`} onClick={() => handleFilterChange('bodyType', b.name)}>{b.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Коробка передач */}
                            <div className="sc-filter-section">
                                <h4>Коробка передач</h4>
                                <div className="sc-filter-chips">
                                    <button className={`sc-chip ${filters.transmissionType === '' ? 'active' : ''}`} onClick={() => handleFilterChange('transmissionType', '')}>Всі</button>
                                    {transmissions.map(t => (
                                        <button key={t.id} className={`sc-chip ${filters.transmissionType === t.name ? 'active' : ''}`} onClick={() => handleFilterChange('transmissionType', t.name)}>{t.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Паливо */}
                            <div className="sc-filter-section">
                                <h4>Паливо</h4>
                                <div className="sc-filter-chips">
                                    <button className={`sc-chip ${filters.fuelType === '' ? 'active' : ''}`} onClick={() => handleFilterChange('fuelType', '')}>Всі</button>
                                    {fuelTypes.map(f => (
                                        <button key={f.id} className={`sc-chip ${filters.fuelType === f.name ? 'active' : ''}`} onClick={() => handleFilterChange('fuelType', f.name)}>{f.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Пробіг */}
                            <div className="sc-filter-section">
                                <h4>Пробіг</h4>
                                <div className="sc-range-inputs">
                                    <span>від</span>
                                    <input type="number" className="sc-range-input" placeholder="0" value={filters.mileageFrom} onChange={e => handleFilterChange('mileageFrom', e.target.value)} min={0} />
                                    <span>до</span>
                                    <input type="number" className="sc-range-input" placeholder="0" value={filters.mileageTo} onChange={e => handleFilterChange('mileageTo', e.target.value)} min={0} />
                                    <span>км</span>
                                </div>
                            </div>

                            {/* Об'єм двигуна */}
                            <div className="sc-filter-section">
                                <h4>Об'єм двигуна</h4>
                                <select className="sc-filter-select" value={filters.engineVolume} onChange={e => handleFilterChange('engineVolume', e.target.value)}>
                                    <option value="">Будь-який</option>
                                    {engineVolumes.map(e => <option key={e.id} value={e.volume}>{e.volume} л</option>)}
                                </select>
                            </div>

                            {/* Кількість місць */}
                            <div className="sc-filter-section">
                                <h4>Кількість місць</h4>
                                <div className="sc-filter-chips">
                                    <button className={`sc-chip ${filters.numberOfSeats === '' ? 'active' : ''}`} onClick={() => handleFilterChange('numberOfSeats', '')}>Будь-яка</button>
                                    {[...numberOfSeats].sort((a, b) => a.number - b.number).map(n => (
                                        <button key={n.id} className={`sc-chip ${filters.numberOfSeats === String(n.number) ? 'active' : ''}`} onClick={() => handleFilterChange('numberOfSeats', String(n.number))}>{n.number}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Ціна */}
                            <div className="sc-filter-section">
                                <h4>Ціна</h4>
                                <div className="sc-range-inputs">
                                    <span>від</span>
                                    <input type="number" className="sc-range-input" placeholder="0 $" value={filters.priceFrom} onChange={e => handleFilterChange('priceFrom', e.target.value)} min={0} />
                                    <span>до</span>
                                    <input type="number" className="sc-range-input" placeholder="0 $" value={filters.priceTo} onChange={e => handleFilterChange('priceTo', e.target.value)} min={0} />
                                    <span>$</span>
                                </div>
                            </div>

                            {/* Регіон */}
                            <div className="sc-filter-section">
                                <h4>Регіон України</h4>
                                <select className="sc-filter-select" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)}>
                                    <option value="">Вся Україна</option>
                                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="sc-filter-footer">
                            <button className="sc-filter-apply-btn" onClick={handleApplyFilter}>
                                Показати результати
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchContent;
