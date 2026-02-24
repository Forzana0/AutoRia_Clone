import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/authSlice';
import './Navbar.css';

const Navbar: React.FC = () => {
    const [lang, setLang] = useState<'UA' | 'ENG'>('UA');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const isLoggedIn = !!tokenFromRedux || !!localStorage.getItem('token');

    // Закриваємо дропдауни при кліку поза
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        setDropdownOpen(false);
        navigate('/');
    };

    const handleAddAd = () => {
        navigate(isLoggedIn ? '/post-ad' : '/auth');
    };

    return (
        <nav className="navbar">
            <div className="navbar-top">
                <div className="navbar-left">
                    <div className="burger-icon"><span /><span /><span /></div>
                    <span>Усі оголошення</span>
                </div>

                <Link to="/" className="navbar-logo">AUTLY</Link>

                <div className="navbar-right">
                    <button className="btn-add-ad" onClick={handleAddAd}>+ Додати оголошення</button>

                    <div className="profile-dropdown-wrap" ref={dropdownRef}>
                        <div
                            className={`profile-icon ${dropdownOpen ? 'active' : ''}`}
                            onClick={() => setDropdownOpen(v => !v)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>

                        {dropdownOpen && (
                            <div className="profile-dropdown">
                                {isLoggedIn ? (
                                    <>
                                        <button className="dropdown-item" onClick={() => { navigate('/account'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            Мій профіль
                                        </button>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                                            </svg>
                                            Вийти
                                        </button>
                                    </>
                                ) : (
                                    <button className="dropdown-item" onClick={() => { navigate('/auth'); setDropdownOpen(false); }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                                        </svg>
                                        Увійти
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="navbar-bottom">
                <ul className="nav-links">
                    <li><a href="/search" onClick={e => { e.preventDefault(); navigate('/search', { state: { cars: undefined, searchParams: { searchType: 'Новий' } } }); }}>Нові авто</a></li>
                    <li><span>|</span></li>
                    <li><a href="/search" onClick={e => { e.preventDefault(); navigate('/search', { state: { cars: undefined, searchParams: { searchType: 'Вживаний' } } }); }}>Вживані авто</a></li>
                    <li><span>|</span></li>
                    <li><a href="/search" onClick={e => { e.preventDefault(); navigate('/search', { state: { cars: undefined, searchParams: { carType: 'Мото' } } }); }}>Мото</a></li>
                    <li><span>|</span></li>
                    <li><a href="/help" onClick={e => { e.preventDefault(); navigate('/help'); }}>Допомога</a></li>
                    <li><span>|</span></li>
                    <li><a href="/about" onClick={e => { e.preventDefault(); navigate('/about'); }}>Про Нас</a></li>
                </ul>

                <div className="lang-switcher">
                    <button className={`lang-btn ${lang === 'UA' ? 'active' : ''}`} onClick={() => setLang('UA')}>UA</button>
                    <span className="lang-divider">/</span>
                    <button className={`lang-btn ${lang === 'ENG' ? 'active' : ''}`} onClick={() => setLang('ENG')}>ENG</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
