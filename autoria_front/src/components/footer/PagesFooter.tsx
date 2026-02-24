import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PagesFooter.css';

const PagesFooter: React.FC = () => {
    const navigate = useNavigate();
    const goSearch = (carType: string) => navigate('/search', { state: { searchParams: { carType } } });
    return (
        <footer className="pages-footer">
            <div className="footer-inner">
                {/* Logo + socials */}
                <div className="footer-col">
                    <span className="footer-logo">AUTLY</span>
                    <div className="footer-socials">
                        <a className="social-icon" href="https://www.youtube.com/" aria-label="YouTube">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                                <polygon fill="#111318" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
                            </svg>
                        </a>
                        <a className="social-icon" href="https://www.instagram.com/" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <circle cx="12" cy="12" r="5" />
                                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                            </svg>
                        </a>
                        <a className="social-icon" href="https://web.telegram.org" aria-label="Telegram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Car types */}
                <div className="footer-col">
                    <h4>Тип автомобіля</h4>
                    <ul>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Легкові'); }}>Легкові</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Комерційні'); }}>Комерційні</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Вантажні'); }}>Вантажні</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Причепи'); }}>Причепи</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Спецтехніка'); }}>Спецтехніка</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Автобуси'); }}>Автобуси</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Мото'); }}>Мото</a></li>
                        <li><a href="#" onClick={e => { e.preventDefault(); goSearch('Водний'); }}>Водний</a></li>
                    </ul>
                </div>

                {/* Info */}
                <div className="footer-col">
                    <h4>Інформація</h4>
                    <ul>
                        <li><Link to="/about">Про Нас</Link></li>
                        <li><Link to="/help">Допомога</Link></li>
                        <li><a href="#">Правила користування</a></li>
                        <li><a href="#">Договір оферти</a></li>
                        <li><a href="#">Політика конфіденційності</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div className="footer-col">
                    <h4>Служба підтримки:</h4>
                    <p className="footer-phone">+380931005270</p>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Autly. Всі права захищені.</span>
                <span>Made in Ukraine 🇺🇦</span>
            </div>
        </footer>
    );
};

export default PagesFooter;
