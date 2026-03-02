import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SellerPage.css';

const API = 'http://localhost:5174';
const PAGE_SIZE = 5;

interface SellerInfo {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    photo?: string;
    phoneNumber?: string;
    description?: string;
    rating?: string | number | null;
}

interface CarItem {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    year?: number;
    city?: { name: string };
    mileage?: number;
    transmissionType?: { name: string };
    fuelTypes?: { name: string };
    price?: number;
    photos?: { name: string }[];
}

type ModalType = 'none' | 'contact' | 'review';

const decodeToken = (token: string) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="sp-stars">
            {[1, 2, 3, 4, 5].map(s => (
                <span
                    key={s}
                    className={`sp-star ${s <= (hovered || value) ? 'filled' : ''}`}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(s)}
                >★</span>
            ))}
        </div>
    );
};

const SellerPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const listingsRef = useRef<HTMLDivElement>(null);

    const [seller, setSeller] = useState<SellerInfo | null>(null);
    const [cars, setCars] = useState<CarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalType>('none');
    const [starValue, setStarValue] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSent, setReviewSent] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    const currentUserId = token ? decodeToken(token)?.id : null;

    useEffect(() => {
        if (!userId) return;
        const fetchAll = async () => {
            try {
                const [userRes, carsRes] = await Promise.all([
                    axios.get(`${API}/api/Accounts/GetUserById/${userId}`),
                    axios.get(`${API}/api/Car/user/${userId}`),
                ]);
                setSeller(userRes.data);
                setCars(carsRes.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [userId]);

    const refreshRating = async () => {
        try {
            const res = await axios.get(`${API}/api/Accounts/GetUserById/${userId}`);
            setSeller(res.data);
        } catch {}
    };

    const handleReviewSubmit = async () => {
        if (!currentUserId || !userId || starValue === 0) return;
        setSubmitting(true);
        setReviewError(null);
        try {
            await axios.post(`${API}/api/Reviews/add`, {
                fromUserId: Number(currentUserId),
                toUserId: Number(userId),
                stars: starValue,
                comment: reviewText,
            });
            setReviewSent(true);
            await refreshRating();
            setTimeout(() => {
                setModal('none');
                setReviewSent(false);
                setStarValue(0);
                setReviewText('');
            }, 1500);
        } catch (e: any) {
            setReviewError(e?.response?.data || 'Помилка при відправці відгуку');
        } finally {
            setSubmitting(false);
        }
    };

    const goToChat = () => {
        if (!isLoggedIn) { navigate('/auth'); return; }
        navigate(`/account/messages?with=${userId}`);
    };

    // Pagination
    const totalPages = Math.ceil(cars.length / PAGE_SIZE);
    const paginatedCars = cars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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

    const sellerName = seller
        ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.userName
        : '—';
    const photoUrl = seller?.photo ? `${API}/images/200_${seller.photo}` : null;
    const initials = sellerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const isSelf = currentUserId && userId && String(currentUserId) === String(userId);

    if (loading) return <div className="sp-loading">Завантаження...</div>;
    if (!seller) return <div className="sp-loading">Продавця не знайдено</div>;

    return (
        <div className="sp-wrapper">
            <div className="sp-container">
                {/* Left */}
                <div className="sp-left">
                    <div className="sp-profile-card">
                        <div className="sp-avatar">
                            {photoUrl
                                ? <img src={photoUrl} alt={sellerName} />
                                : <span className="sp-initials">{initials}</span>
                            }
                        </div>
                        <div className="sp-name-row">
                            <h2 className="sp-name">{sellerName}</h2>
                            <span className="sp-rating">{parseFloat(String(seller.rating ?? '0').replace(',', '.')) || 0}/5 ★</span>
                        </div>
                        {seller.description && <p className="sp-desc">{seller.description}</p>}
                    </div>

                    <div className="sp-stats">
                        <div className="sp-stat-btn">
                            <span>{cars.length} авто в продажі</span>
                        </div>
                    </div>

                    <div className="sp-divider" />

                    <div className="sp-actions">
                        {seller.phoneNumber && (
                            <button className="sp-btn sp-btn-phone" onClick={() => setModal('contact')}>
                                {seller.phoneNumber}
                            </button>
                        )}
                        <button className="sp-btn sp-btn-outline" onClick={goToChat}>
                            Відкрити чат
                        </button>
                        {!isSelf && (
                            <button
                                className="sp-btn sp-btn-outline"
                                onClick={() => isLoggedIn ? setModal('review') : navigate('/auth')}
                            >
                                Залишити відгук
                            </button>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="sp-right" ref={listingsRef}>
                    <h3 className="sp-listings-title">Активні оголошення</h3>
                    <div className="sp-listings">
                        {cars.length === 0 ? (
                            <p className="sp-no-listings">Оголошень немає</p>
                        ) : (
                            paginatedCars.map(car => {
                                const title = `${car.carBrand?.name || ''} ${car.carModel?.name || ''}`.trim();
                                const img = car.photos?.[0]?.name
                                    ? `${API}/images/400_${car.photos[0].name}`
                                    : null;
                                const tags = [
                                    car.mileage ? `${car.mileage.toLocaleString()} км` : null,
                                    car.transmissionType?.name,
                                    car.fuelTypes?.name,
                                ].filter(Boolean);

                                return (
                                    <div key={car.id} className="sp-listing-card" onClick={() => navigate(`/product/${car.id}`)}>
                                        <div className="sp-listing-img">
                                            {img
                                                ? <img src={img} alt={title} />
                                                : <div className="sp-listing-no-img">📷</div>
                                            }
                                        </div>
                                        <div className="sp-listing-info">
                                            <div className="sp-listing-title">{title}</div>
                                            {car.city?.name && <div className="sp-listing-city">📍 {car.city.name}</div>}
                                            <div className="sp-listing-tags">
                                                {tags.map((t, i) => <span key={i} className="sp-tag">{t}</span>)}
                                            </div>
                                        </div>
                                        <div className="sp-listing-price">
                                            {car.price ? <span className="sp-price-usd">{car.price.toLocaleString()} $</span> : '—'}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="sp-pagination">
                            <button
                                className="sp-page-btn arrow"
                                onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >‹</button>
                            {getPagesArray().map((p, i) =>
                                p === '...'
                                    ? <span key={`d${i}`} className="sp-page-dots">...</span>
                                    : <button
                                        key={p}
                                        className={`sp-page-btn ${currentPage === p ? 'active' : ''}`}
                                        onClick={() => handlePageClick(p as number)}
                                    >{p}</button>
                            )}
                            <button
                                className="sp-page-btn arrow"
                                onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >›</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact modal */}
            {modal === 'contact' && (
                <div className="sp-modal-overlay" onClick={() => setModal('none')}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()}>
                        <button className="sp-modal-back" onClick={() => setModal('none')}>← Назад</button>
                        <div className="sp-modal-seller">
                            <div className="sp-modal-avatar">
                                {photoUrl ? <img src={photoUrl} alt={sellerName} /> : <span>{initials}</span>}
                            </div>
                            <div>
                                <div className="sp-modal-label">Продавець</div>
                                <div className="sp-modal-name">{sellerName}</div>
                            </div>
                        </div>
                        <div className="sp-modal-divider" />
                        {seller.phoneNumber && (
                            <a href={`tel:${seller.phoneNumber}`} className="sp-btn sp-btn-phone" style={{ textAlign: 'center' }}>
                                {seller.phoneNumber}
                            </a>
                        )}
                        <button className="sp-btn sp-btn-outline" onClick={() => { setModal('none'); goToChat(); }}>
                            Написати в чат
                        </button>
                    </div>
                </div>
            )}

            {/* Review modal */}
            {modal === 'review' && (
                <div className="sp-modal-overlay" onClick={() => setModal('none')}>
                    <div className="sp-modal" onClick={e => e.stopPropagation()}>
                        <button className="sp-modal-back" onClick={() => setModal('none')}>← Назад</button>
                        <div className="sp-modal-seller">
                            <div className="sp-modal-avatar">
                                {photoUrl ? <img src={photoUrl} alt={sellerName} /> : <span>{initials}</span>}
                            </div>
                            <div>
                                <div className="sp-modal-label">Продавець</div>
                                <div className="sp-modal-name">{sellerName}</div>
                            </div>
                        </div>
                        <div className="sp-modal-divider" />
                        {reviewSent ? (
                            <div className="sp-review-success">✅ Відгук збережено!</div>
                        ) : (
                            <>
                                <p className="sp-review-prompt">Оцініть Ваш досвід взаємодії з продавцем в цілому?</p>
                                <StarRating value={starValue} onChange={setStarValue} />
                                {starValue > 0 && (
                                    <>
                                        <p className="sp-review-prompt" style={{ marginTop: 16 }}>Поділіться своїм досвідом</p>
                                        <textarea
                                            className="sp-review-textarea"
                                            rows={5}
                                            placeholder="Опишіть взаємодію з продавцем"
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                        />
                                        {reviewError && <div style={{ color: 'red', fontSize: 13 }}>{reviewError}</div>}
                                        <button
                                            className="sp-btn sp-btn-phone"
                                            onClick={handleReviewSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Збереження...' : 'Надіслати відгук'}
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPage;
