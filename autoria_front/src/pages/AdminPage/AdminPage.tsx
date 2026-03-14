import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPage.css';

const API = 'http://localhost:5174';

const decodeToken = (token: string) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

interface Stats {
    usersCount: number;
    carsCount: number;
    messagesCount: number;
    favoritesCount: number;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber?: string;
    photo?: string;
    rating?: string;
    city?: string;
    region?: string;
    carsCount: number;
}

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    dateCreated: string;
    city: string;
    photo?: string;
    ownerId: number;
    ownerName: string;
}

type Tab = 'dashboard' | 'users' | 'cars';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;

    const [tab, setTab] = useState<Tab>('dashboard');
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'car'; id: number; name: string } | null>(null);
    const [editPrice, setEditPrice] = useState<{ id: number; value: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Перевірка ролі
    useEffect(() => {
        if (!token) { navigate('/auth'); return; }
        const roles = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded?.role;
        const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
        if (!isAdmin) navigate('/');
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/api/Admin/GetStats`);
            setStats(r.data);
        } catch {}
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const r = await axios.get(`${API}/api/Admin/GetUsers`);
            setUsers(r.data);
        } catch {} finally { setLoading(false); }
    }, []);

    const loadCars = useCallback(async () => {
        setLoading(true);
        try {
            const r = await axios.get(`${API}/api/Admin/GetCars`);
            setCars(r.data);
        } catch {} finally { setLoading(false); }
    }, []);

    useEffect(() => { loadStats(); }, []);
    useEffect(() => { if (tab === 'users') loadUsers(); }, [tab]);
    useEffect(() => { if (tab === 'cars') loadCars(); }, [tab]);

    const handleDeleteUser = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`${API}/api/Admin/DeleteUser/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            loadStats();
        } catch {} finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const handleDeleteCar = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`${API}/api/Admin/DeleteCar/${id}`);
            setCars(prev => prev.filter(c => c.id !== id));
            loadStats();
        } catch {} finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const handleSavePrice = async (carId: number) => {
        if (!editPrice) return;
        try {
            await axios.patch(`${API}/api/Admin/UpdateCarPrice/${carId}`, { price: Number(editPrice.value) });
            setCars(prev => prev.map(c => c.id === carId ? { ...c, price: Number(editPrice.value) } : c));
        } catch {} finally { setEditPrice(null); }
    };

    const filteredUsers = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email} ${u.userName}`.toLowerCase().includes(search.toLowerCase())
    );

    const filteredCars = cars.filter(c =>
        `${c.brand} ${c.model} ${c.year} ${c.ownerName}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="adm-page">
            {/* Sidebar */}
            <aside className="adm-sidebar">
                <div className="adm-logo">
                    <span className="adm-logo-icon">⚡</span>
                    <span className="adm-logo-text">Адмін панель</span>
                </div>
                <nav className="adm-nav">
                    {([
                        { key: 'dashboard', icon: '📊', label: 'Дашборд' },
                        { key: 'users',     icon: '👥', label: 'Користувачі' },
                        { key: 'cars',      icon: '🚗', label: 'Оголошення' },
                    ] as { key: Tab; icon: string; label: string }[]).map(item => (
                        <button
                            key={item.key}
                            className={`adm-nav-item ${tab === item.key ? 'active' : ''}`}
                            onClick={() => { setTab(item.key); setSearch(''); }}
                        >
                            <span className="adm-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button className="adm-back-btn" onClick={() => navigate('/account')}>
                    ← На сайт
                </button>
            </aside>

            {/* Main content */}
            <main className="adm-main">

                {/* ── DASHBOARD ── */}
                {tab === 'dashboard' && (
                    <div className="adm-content">
                        <div className="adm-heading">
                            <h1>Дашборд</h1>
                            <p>Загальна статистика платформи</p>
                        </div>
                        <div className="adm-stats-grid">
                            {[
                                { label: 'Користувачів', value: stats?.usersCount ?? '—', icon: '👥', color: '#3b5bdb' },
                                { label: 'Оголошень',    value: stats?.carsCount ?? '—',  icon: '🚗', color: '#0ca678' },
                                { label: 'Повідомлень',  value: stats?.messagesCount ?? '—', icon: '💬', color: '#f59f00' },
                                { label: 'Обраних',      value: stats?.favoritesCount ?? '—', icon: '❤️', color: '#e64980' },
                            ].map((s, i) => (
                                <div key={i} className="adm-stat-card" style={{ '--accent': s.color } as React.CSSProperties}>
                                    <div className="adm-stat-icon">{s.icon}</div>
                                    <div className="adm-stat-info">
                                        <div className="adm-stat-value">{s.value}</div>
                                        <div className="adm-stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="adm-quick">
                            <h2>Швидкі дії</h2>
                            <div className="adm-quick-grid">
                                <button className="adm-quick-card" onClick={() => setTab('users')}>
                                    <span>👥</span>
                                    <span>Управління користувачами</span>
                                </button>
                                <button className="adm-quick-card" onClick={() => setTab('cars')}>
                                    <span>🚗</span>
                                    <span>Управління оголошеннями</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USERS ── */}
                {tab === 'users' && (
                    <div className="adm-content">
                        <div className="adm-heading">
                            <h1>Користувачі</h1>
                            <p>{users.length} зареєстрованих</p>
                        </div>
                        <div className="adm-toolbar">
                            <input
                                className="adm-search"
                                placeholder="🔍  Пошук по імені, email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {loading ? (
                            <div className="adm-loading">Завантаження...</div>
                        ) : (
                            <div className="adm-table-wrap">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Користувач</th>
                                            <th>Email</th>
                                            <th>Телефон</th>
                                            <th>Місто</th>
                                            <th>Рейтинг</th>
                                            <th>Оголошень</th>
                                            <th>Дії</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="adm-user-cell">
                                                        <div className="adm-avatar">
                                                            {user.photo
                                                                ? <img src={`${API}/images/200_${user.photo}`} alt="" />
                                                                : <span>{(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}</span>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div className="adm-user-name">{user.firstName} {user.lastName}</div>
                                                            <div className="adm-user-sub">@{user.userName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="adm-td-muted">{user.email}</td>
                                                <td className="adm-td-muted">{user.phoneNumber || '—'}</td>
                                                <td className="adm-td-muted">{user.city || '—'}</td>
                                                <td>
                                                    <span className="adm-badge adm-badge-rating">
                                                        ★ {parseFloat(user.rating || '0').toFixed(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="adm-badge">{user.carsCount}</span>
                                                </td>
                                                <td>
                                                    <div className="adm-actions">
                                                        <button
                                                            className="adm-btn adm-btn-view"
                                                            onClick={() => navigate(`/seller/${user.id}`)}
                                                            title="Переглянути"
                                                        >👁</button>
                                                        <button
                                                            className="adm-btn adm-btn-del"
                                                            onClick={() => setConfirmDelete({ type: 'user', id: user.id, name: `${user.firstName} ${user.lastName}` })}
                                                            title="Видалити"
                                                        >🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CARS ── */}
                {tab === 'cars' && (
                    <div className="adm-content">
                        <div className="adm-heading">
                            <h1>Оголошення</h1>
                            <p>{cars.length} активних оголошень</p>
                        </div>
                        <div className="adm-toolbar">
                            <input
                                className="adm-search"
                                placeholder="🔍  Пошук по марці, моделі, власнику..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {loading ? (
                            <div className="adm-loading">Завантаження...</div>
                        ) : (
                            <div className="adm-table-wrap">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Авто</th>
                                            <th>Рік</th>
                                            <th>Ціна</th>
                                            <th>Пробіг</th>
                                            <th>Місто</th>
                                            <th>Власник</th>
                                            <th>Дата</th>
                                            <th>Дії</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCars.map(car => (
                                            <tr key={car.id}>
                                                <td>
                                                    <div className="adm-car-cell">
                                                        <div className="adm-car-thumb">
                                                            {car.photo
                                                                ? <img src={`${API}/images/200_${car.photo}`} alt="" />
                                                                : <span>🚗</span>
                                                            }
                                                        </div>
                                                        <span className="adm-user-name">{car.brand} {car.model}</span>
                                                    </div>
                                                </td>
                                                <td className="adm-td-muted">{car.year}</td>
                                                <td>
                                                    {editPrice?.id === car.id ? (
                                                        <div className="adm-price-edit">
                                                            <input
                                                                className="adm-price-input"
                                                                value={editPrice.value}
                                                                onChange={e => setEditPrice({ id: car.id, value: e.target.value })}
                                                                onKeyDown={e => e.key === 'Enter' && handleSavePrice(car.id)}
                                                                autoFocus
                                                            />
                                                            <button className="adm-btn adm-btn-save" onClick={() => handleSavePrice(car.id)}>✓</button>
                                                            <button className="adm-btn adm-btn-cancel" onClick={() => setEditPrice(null)}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className="adm-price-val"
                                                            onClick={() => setEditPrice({ id: car.id, value: String(car.price) })}
                                                            title="Клікни щоб змінити"
                                                        >
                                                            {car.price?.toLocaleString()} $ ✎
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="adm-td-muted">{car.mileage ? `${Number(car.mileage).toLocaleString()} км` : '—'}</td>
                                                <td className="adm-td-muted">{car.city || '—'}</td>
                                                <td>
                                                    <button
                                                        className="adm-link"
                                                        onClick={() => navigate(`/seller/${car.ownerId}`)}
                                                    >{car.ownerName || '—'}</button>
                                                </td>
                                                <td className="adm-td-muted">
                                                    {new Date(car.dateCreated).toLocaleDateString('uk-UA')}
                                                </td>
                                                <td>
                                                    <div className="adm-actions">
                                                        <button
                                                            className="adm-btn adm-btn-view"
                                                            onClick={() => navigate(`/product/${car.id}`)}
                                                            title="Переглянути"
                                                        >👁</button>
                                                        <button
                                                            className="adm-btn adm-btn-del"
                                                            onClick={() => setConfirmDelete({ type: 'car', id: car.id, name: `${car.brand} ${car.model} ${car.year}` })}
                                                            title="Видалити"
                                                        >🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Confirm modal */}
            {confirmDelete && (
                <div className="adm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="adm-modal" onClick={e => e.stopPropagation()}>
                        <div className="adm-modal-icon">⚠️</div>
                        <h3>Підтвердження видалення</h3>
                        <p>Ви впевнені що хочете видалити<br />
                            <strong>{confirmDelete.name}</strong>?
                            {confirmDelete.type === 'user' && <><br /><span className="adm-warn">Всі оголошення юзера також будуть видалені</span></>}
                        </p>
                        <div className="adm-modal-btns">
                            <button className="adm-modal-cancel" onClick={() => setConfirmDelete(null)}>Скасувати</button>
                            <button
                                className="adm-modal-confirm"
                                disabled={deletingId !== null}
                                onClick={() => {
                                    if (confirmDelete.type === 'user') handleDeleteUser(confirmDelete.id);
                                    else handleDeleteCar(confirmDelete.id);
                                }}
                            >
                                {deletingId !== null ? 'Видалення...' : 'Видалити'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
