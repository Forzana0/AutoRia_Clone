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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        setDropdownOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            {/* Top row */}
            <div className="navbar-top">
                <div className="navbar-left">
                    <div className="burger-icon">
                        <span /><span /><span />
                    </div>
                    <span>Усі оголошення</span>
                </div>

                <Link to="/" className="navbar-logo">AUTLY</Link>

                <div className="navbar-right">
                    <button className="btn-add-ad" onClick={() => navigate('/post-ad')}>
                        + Додати оголошення
                    </button>

                    <div className="profile-dropdown-wrap" ref={dropdownRef}>
                        <div
                            className={`profile-icon ${dropdownOpen ? 'active' : ''}`}
                            onClick={() => setDropdownOpen(v => !v)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>

                        {dropdownOpen && (
                            <div className="profile-dropdown">
                                {isLoggedIn ? (
                                    <>
                                        <button className="dropdown-item" onClick={() => { navigate('/account'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Мій профіль
                                        </button>
                                        <button className="dropdown-item" onClick={() => { navigate('/account/edit'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Налаштування
                                        </button>
                                        <button className="dropdown-item" onClick={() => { navigate('/account/ads'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <path d="M3 9h18M9 21V9" />
                                            </svg>
                                            Мої оголошення
                                        </button>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Вийти
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="dropdown-item" onClick={() => { navigate('/auth'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                                <polyline points="10 17 15 12 10 7" />
                                                <line x1="15" y1="12" x2="3" y2="12" />
                                            </svg>
                                            Увійти
                                        </button>
                                        <button className="dropdown-item" onClick={() => { navigate('/auth'); setDropdownOpen(false); }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Зареєструватись
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom row */}
            <div className="navbar-bottom">
                <ul className="nav-links">
                    <li><a href="#">Нові авто</a></li>
                    <li><span>|</span></li>
                    <li><a href="#">Вживані авто</a></li>
                    <li><span>|</span></li>
                    <li><a href="#">Мото</a></li>
                    <li><span>|</span></li>
                    <li><a href="#">Допомога</a></li>
                    <li><span>|</span></li>
                    <li><a href="#">Про Нас</a></li>
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
