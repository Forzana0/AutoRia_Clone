import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyAds.css';
import { RootState } from '../../../../redux/store';
import EditAdModal from './EditAdModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const API = 'http://localhost:5174';
const PAGE_SIZE = 5;

interface CarItem {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    year?: number;
    city?: { name: string };
    price?: number;
    photos?: { name: string }[];
}

const decodeToken = (token: string) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const MyAds: React.FC = () => {
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const token = tokenFromRedux || localStorage.getItem('token');
    const userId = token ? decodeToken(token)?.id : null;

    const [cars, setCars] = useState<CarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingCarId, setEditingCarId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCars = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/Car/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCars(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCars(); }, [userId]);

    const confirmDelete = async () => {
        if (!deleteId) return;
        const carId = deleteId;
        setDeleteId(null);
        setDeletingId(carId);
        try {
            await axios.delete(`${API}/api/Car/${carId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCars(prev => {
                const updated = prev.filter(c => c.id !== carId);
                const newTotalPages = Math.ceil(updated.length / PAGE_SIZE);
                if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
                return updated;
            });
        } catch (e) {
            alert('Помилка при видаленні. Спробуйте ще раз.');
            console.error(e);
        } finally {
            setDeletingId(null);
        }
    };

    const totalPages = Math.ceil(cars.length / PAGE_SIZE);
    const paginatedCars = cars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        wrapperRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    };

    const getPagesArray = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [1];
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <>
            {deleteId && (
                <ConfirmModal
                    title="Видалити оголошення?"
                    message="Це оголошення буде назавжди видалено. Цю дію неможливо скасувати."
                    confirmText="Так, видалити"
                    cancelText="Скасувати"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                    danger
                />
            )}

            <div className="my-ads-wrapper" ref={wrapperRef}>
                {loading ? (
                    <p className="my-ads-loading">Завантаження...</p>
                ) : cars.length === 0 ? (
                    <div className="my-ads-empty">
                        <p>На жаль у вас більше немає оголошень!</p>
                        <button className="my-ads-add-btn" onClick={() => navigate('/post-ad')}>
                            + Додати оголошення
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="my-ads-list">
                            {paginatedCars.map(car => {
                                const title = `${car.carBrand?.name || ''} ${car.carModel?.name || ''} ${car.year || ''}`.trim();
                                const img = car.photos?.[0]?.name
                                    ? `${API}/images/400_${car.photos[0].name}`
                                    : null;

                                return (
                                    <div key={car.id} className="my-ad-card" onClick={() => navigate(`/product/${car.id}`)}>
                                        <div className="my-ad-img">
                                            {img
                                                ? <img src={img} alt={title} />
                                                : <div className="my-ad-no-img">📷</div>
                                            }
                                        </div>
                                        <div className="my-ad-info">
                                            <span className="my-ad-title">{title}</span>
                                            {car.city?.name && (
                                                <span className="my-ad-city">📍 {car.city.name}</span>
                                            )}
                                        </div>
                                        <div className="my-ad-right" onClick={e => e.stopPropagation()}>
                                            <span className="my-ad-price">
                                                {car.price ? `${car.price.toLocaleString()} $` : '—'}
                                            </span>
                                            <div className="my-ad-actions">
                                                <button
                                                    className="my-ad-edit-btn"
                                                    onClick={() => setEditingCarId(car.id)}
                                                    title="Редагувати оголошення"
                                                >
                                                    ✏️ Редагувати
                                                </button>
                                                <button
                                                    className="my-ad-delete-btn"
                                                    onClick={() => setDeleteId(car.id)}
                                                    disabled={deletingId === car.id}
                                                >
                                                    {deletingId === car.id ? '...' : 'Видалити'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="my-ads-pagination">
                                <button
                                    className="my-ads-page-btn arrow"
                                    onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >‹</button>

                                {getPagesArray().map((p, i) =>
                                    p === '...'
                                        ? <span key={`d${i}`} className="my-ads-page-dots">...</span>
                                        : <button
                                            key={p}
                                            className={`my-ads-page-btn ${currentPage === p ? 'active' : ''}`}
                                            onClick={() => handlePageClick(p as number)}
                                        >{p}</button>
                                )}

                                <button
                                    className="my-ads-page-btn arrow"
                                    onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >›</button>
                            </div>
                        )}

                        <div className="my-ads-footer">
                            <button className="my-ads-add-btn" onClick={() => navigate('/post-ad')}>
                                + Додати оголошення
                            </button>
                        </div>
                    </>
                )}
            </div>

            {editingCarId !== null && token && (
                <EditAdModal
                    carId={editingCarId}
                    token={token}
                    onClose={() => setEditingCarId(null)}
                    onSaved={fetchCars}
                />
            )}
        </>
    );
};

export default MyAds;
