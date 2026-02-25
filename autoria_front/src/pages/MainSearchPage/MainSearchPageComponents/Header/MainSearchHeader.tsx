import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainSearchHeader.css';
import heroCar from '../../../../images/hero-car.png';

const API = 'http://localhost:5174';
const HISTORY_KEY = 'autly_search_history';
const MAX_HISTORY = 5;

const MainSearchHeader: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const mouseInDropdown = React.useRef(false);

    useEffect(() => {
        try {
            setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'));
        } catch { setHistory([]); }
    }, []);

    const saveToHistory = (q: string) => {
        if (!q.trim()) return;
        const updated = [q, ...history.filter(h => h !== q)].slice(0, MAX_HISTORY);
        setHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    };

    const handleSearch = async (q: string) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        saveToHistory(trimmed);
        setShowHistory(false);

        try {
            const res = await axios.post(`${API}/api/Car/search`, {
                textQuery: trimmed,
                carType: null, searchType: null, region: null, price: null, vinChecked: false,
                selectedBrand: null, selectedModel: null, year: null,
            });
            navigate('/search', { state: { cars: res.data, searchParams: { query: trimmed } } });
        } catch {
            navigate('/search', { state: { cars: [], searchParams: {} } });
        }
    };

    const deleteHistory = (item: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = history.filter(h => h !== item);
        setHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    };

    return (
        <div className="main-search-header">
            <img className="hero-image" src={heroCar} alt="Hero Car"
                 onError={e => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)'; }}
            />
            <div className="hero-overlay" />

            {/* Search bar */}
            <div className="hero-search-wrap">
                <div className={`hero-search-bar ${showHistory && history.length > 0 && !query ? 'open' : ''}`}>
                    <button className="hero-search-icon-btn" onClick={() => handleSearch(query)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                    </button>
                    <input
                        type="text"
                        placeholder="Пошук за маркою, моделлю, роком..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => { if (!mouseInDropdown.current) setShowHistory(false); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSearch(query); }}
                    />
                    {query && (
                        <button className="hero-search-clear" onClick={() => setQuery('')}>✕</button>
                    )}
                </div>

                {/* Dropdown з історією */}
                {showHistory && history.length > 0 && !query && (
                    <div className="hero-history-dropdown" onMouseDown={() => { mouseInDropdown.current = true; }} onMouseUp={() => { mouseInDropdown.current = false; }}>
                        {history.map((item, i) => (
                            <div key={i} className="hero-history-item" onMouseDown={() => handleSearch(item)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                                </svg>
                                <span>{item}</span>
                                <button className="hero-history-delete" onMouseDown={e => { e.preventDefault(); deleteHistory(item, e); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
