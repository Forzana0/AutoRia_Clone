import './AccountHeader.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileCard from "./HeaderComponents/ProfileCard";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { logout } from '../../../../redux/authSlice';
import axios from 'axios';

interface DecodedToken {
    firstName?: string;
    lastName?: string;
    id?: string;
}

const decodeToken = (token: string): DecodedToken | null => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

const AccountHeader: React.FC = () => {
    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const token = tokenFromRedux || localStorage.getItem('token');
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Динамічні лічильники
    const [adsCount, setAdsCount] = useState<number>(0);

    let profileData = { name: 'Невідомий користувач', id: '0' };
    if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
            profileData = {
                name: decoded.firstName ? `${decoded.firstName} ${decoded.lastName}` : 'Невідомий користувач',
                id: decoded.id || '0',
            };
        }
    }

    // Завантаження кількості оголошень
    useEffect(() => {
        const fetchAdsCount = async () => {
            if (!profileData.id || profileData.id === '0') return;
            try {
                const response = await axios.get(`http://localhost:5174/api/Car/user/${profileData.id}`);
                setAdsCount(response.data?.length ?? 0);
            } catch {
                setAdsCount(0);
            }
        };
        fetchAdsCount();
    }, [profileData.id]);

    const NAV_ITEMS = [
        { key: 'ads',           label: 'Список оголошень',  count: adsCount, path: '/account/ads' },
        { key: 'personal',      label: 'Особистий рахунок', count: null,     path: '/account/personal' },
        { key: 'messages',      label: 'Повідомлення',      count: 0,        path: '/account/messages' },
        { key: 'favorites',     label: 'Улюблене',          count: 0,        path: '/account/favorites' },
        { key: 'notifications', label: 'Сповіщення',        count: 0,        path: '/account/notifications' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <aside className={`account-sidebar ${collapsed ? 'collapsed' : ''}`}>

            {/* Profile Card */}
            <div className="sidebar-card profile-section">
                <ProfileCard name={profileData.name} id={profileData.id} collapsed={collapsed} />
                <div className="sidebar-tab-buttons">
                    <button
                        className={`tab-btn ${location.pathname === '/account' ? 'active' : ''}`}
                        onClick={() => navigate('/account')}
                        title="Статистика"
                    >
                        {collapsed ? '📊' : 'Статистика'}
                    </button>
                    <button
                        className={`tab-btn ${location.pathname === '/account/edit' ? 'active' : ''}`}
                        onClick={() => navigate('/account/edit')}
                        title="Налаштування"
                    >
                        {collapsed ? '⚙️' : 'Налаштування'}
                    </button>
                </div>
            </div>

            {/* Balance — статично 0 грн поки немає API */}
            <div className="sidebar-card balance-section">
                <div className="balance-icon">💰</div>
                {!collapsed && (
                    <>
                        <div className="balance-info">
                            <span className="balance-amount">0 грн</span>
                            <span className="balance-label">Баланс на сайті</span>
                        </div>
                        <button className="sidebar-action-btn">Поповнити</button>
                    </>
                )}
            </div>

            {/* Listings */}
            <div className="sidebar-card listings-section">
                <div className="balance-icon">🚗</div>
                {!collapsed && (
                    <>
                        <div className="balance-info">
                            <span className="balance-amount">Оголошення</span>
                            <span className="balance-label">Кількість: {adsCount}</span>
                        </div>
                        <button
                            className="sidebar-action-btn"
                            onClick={() => navigate('/post-ad')}
                        >
                            Додати
                        </button>
                    </>
                )}
            </div>

            {/* Collapse toggle */}
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? '›' : '‹'}
            </button>

            {/* Navigation */}
            <div className="sidebar-card nav-section">
                {NAV_ITEMS.map((item, idx) => (
                    <Link
                        key={item.key}
                        to={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        style={{ borderBottom: idx < NAV_ITEMS.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    >
                        {collapsed ? (
                            <span className="nav-count">{item.count !== null ? `(${item.count})` : '·'}</span>
                        ) : (
                            <>
                                <span className="nav-label">
                                    {item.label}{item.count !== null ? ` (${item.count})` : ''}
                                </span>
                                <span className="nav-arrow">›</span>
                            </>
                        )}
                    </Link>
                ))}
            </div>

            <button className="logout-btn" onClick={handleLogout}>Вийти</button>
        </aside>
    );
};

export default AccountHeader;
