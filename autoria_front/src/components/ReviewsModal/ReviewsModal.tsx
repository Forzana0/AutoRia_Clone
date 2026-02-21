import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReviewsModal.css';

const API = 'http://localhost:5174';

interface Review {
    id: number;
    fromUserId: number;
    stars: number;
    comment?: string;
    dateCreated: string;
}

interface ReviewerInfo {
    firstName?: string;
    lastName?: string;
    userName?: string;
    photo?: string;
}

interface Props {
    userId: string | number;
    onClose: () => void;
}

const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
    <div className="rm-stars">
        {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={`rm-star ${s <= value ? 'filled' : ''}`}>★</span>
        ))}
    </div>
);

const ReviewsModal: React.FC<Props> = ({ userId, onClose }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewers, setReviewers] = useState<Record<number, ReviewerInfo>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API}/api/Reviews/user/${userId}`);
                const data: Review[] = res.data || [];
                setReviews(data);

                const uniqueIds = [...new Set(data.map(r => r.fromUserId))];
                const infos: Record<number, ReviewerInfo> = {};
                await Promise.all(
                    uniqueIds.map(async uid => {
                        try {
                            const r = await axios.get(`${API}/api/Accounts/GetUserById/${uid}`);
                            infos[uid] = r.data;
                        } catch {
                            infos[uid] = { userName: `Користувач #${uid}` };
                        }
                    })
                );
                setReviewers(infos);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [userId]);

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <div className="rm-overlay" onClick={onClose}>
            <div className="rm-modal" onClick={e => e.stopPropagation()}>
                <div className="rm-header">
                    <h3 className="rm-title">Відгуки</h3>
                    <button className="rm-close" onClick={onClose}>×</button>
                </div>

                {reviews.length > 0 && (
                    <div className="rm-summary">
                        <span className="rm-avg">{avgRating}/5 ★</span>
                        <span className="rm-count">
                            {reviews.length} відгук{reviews.length === 1 ? '' : reviews.length < 5 ? 'и' : 'ів'}
                        </span>
                    </div>
                )}

                <div className="rm-list">
                    {loading ? (
                        <p className="rm-empty">Завантаження...</p>
                    ) : reviews.length === 0 ? (
                        <p className="rm-empty">Відгуків поки немає</p>
                    ) : (
                        reviews.map(r => {
                            const info = reviewers[r.fromUserId];
                            const name = info
                                ? `${info.firstName || ''} ${info.lastName || ''}`.trim() || info.userName || `#${r.fromUserId}`
                                : `Користувач #${r.fromUserId}`;
                            const photo = info?.photo
                                ? `${API}/images/200_${info.photo}`
                                : null;
                            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                            return (
                                <div key={r.id} className="rm-review-item">
                                    <div className="rm-reviewer">
                                        <div className="rm-reviewer-avatar">
                                            {photo
                                                ? <img src={photo} alt={name} />
                                                : <span>{initials}</span>
                                            }
                                        </div>
                                        <div className="rm-reviewer-info">
                                            <span className="rm-reviewer-name">{name}</span>
                                            <span className="rm-reviewer-date">
                                                {new Date(r.dateCreated).toLocaleDateString('uk-UA')}
                                            </span>
                                        </div>
                                        <StarDisplay value={r.stars} />
                                    </div>
                                    {r.comment && <p className="rm-comment">{r.comment}</p>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;
