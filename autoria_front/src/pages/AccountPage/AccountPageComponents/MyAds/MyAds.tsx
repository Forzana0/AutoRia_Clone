import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyAds.css';
import { RootState } from '../../../../redux/store';
import EditAdModal from './EditAdModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const API = 'http://localhost:5174';

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
    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const token = tokenFromRedux || localStorage.getItem('token');
    const userId = token ? decodeToken(token)?.id : null;

    const [cars, setCars] = useState<CarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingCarId, setEditingCarId] = useState<number | null>(null);

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

    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const handleDelete = async (carId: number) => {
        setDeleteId(carId);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const carId = deleteId;
        setDeleteId(null);
        setDeletingId(carId);
        try {
            await axios.delete(`${API}/api/Car/${carId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCars(prev => prev.filter(c => c.id !== carId));
        } catch (e) {
            alert('Помилка при видаленні. Спробуйте ще раз.');
            console.error(e);
        } finally {
            setDeletingId(null);
        }
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
            <div className="my-ads-wrapper">
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
                            {cars.map(car => {
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