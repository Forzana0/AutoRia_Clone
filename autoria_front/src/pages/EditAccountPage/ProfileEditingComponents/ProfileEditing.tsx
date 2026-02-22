import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '../../../../redux/store';
import './ProfileEditing.css';

interface DecodedToken { id?: string; }

const decodeToken = (token: string): DecodedToken | null => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const API_URL = 'http://localhost:5174/api/Accounts';

const ProfileEditing: React.FC = () => {
    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const token = tokenFromRedux || localStorage.getItem('token');
    const navigate = useNavigate();

    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [deletePhoto, setDeletePhoto] = useState(false); // прапор: видалити фото на сервері

    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '',
        userName: '', email: '', phoneNumber: '', city: '', description: '',
    });

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (!token) return;
        const decoded = decodeToken(token);
        const id = Number(decoded?.id);
        if (!id) return;
        setUserId(id);

        axios.get(`${API_URL}/GetUserById/${id}`).then(res => {
            const d = res.data;
            setForm({
                firstName: d.firstName || '', lastName: d.lastName || '',
                middleName: d.middleName || '', userName: d.userName || '',
                email: d.email || '', phoneNumber: d.phoneNumber || '',
                city: d.city || '', description: d.description || '',
            });
            if (d.photo) setPhotoPreview(`http://localhost:5174/images/1200_${d.photo}`);
        }).catch(e => console.error('Error fetching user:', e));
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setNewPhoto(file);
        setDeletePhoto(false);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Видалення фото — очищаємо локально і ставимо прапор
    const handleDeletePhoto = () => {
        setNewPhoto(null);
        setPhotoPreview(null);
        setDeletePhoto(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !userId) return;

        if (passwords.newPassword || passwords.confirmPassword) {
            if (passwords.newPassword !== passwords.confirmPassword) {
                setError('Нові паролі не співпадають'); return;
            }
            if (passwords.newPassword.length < 6) {
                setError('Пароль має бути не менше 6 символів'); return;
            }
        }

        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('FirstName',   form.firstName);
            formData.append('LastName',    form.lastName);
            formData.append('MiddleName',  form.middleName);
            formData.append('UserName',    form.userName);
            formData.append('Email',       form.email);
            formData.append('PhoneNumber', form.phoneNumber);
            formData.append('City',        form.city);
            formData.append('Description', form.description);
            if (newPhoto) formData.append('Photo', newPhoto);
            if (deletePhoto) formData.append('DeletePhoto', 'true');

            await axios.post(
                `${API_URL}/UpdateProfile/update-profile/${userId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (passwords.newPassword) {
                await axios.put(
                    `${API_URL}/UpdatePassword/update-password/${userId}`,
                    { NewPassword: passwords.newPassword },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            }

            setSuccess(true);
            setTimeout(() => { setSuccess(false); navigate('/account'); }, 1500);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Помилка збереження';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    // Видалення акаунту повністю
    const handleDeleteAccount = async () => {
        if (!token || !userId) return;
        setDeleteLoading(true);
        try {
            await axios.delete(
                `${API_URL}/DeleteAccount/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.removeItem('token');
            navigate('/');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Помилка видалення акаунту';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
            setShowDeleteConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <h2 className="settings-title">Налаштування</h2>

            <form onSubmit={handleSubmit}>

                {/* Фото профілю */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Фото профілю</h3>
                    <div className="settings-divider" />
                    <div className="settings-photo-row">
                        <div className="settings-avatar">
                            {photoPreview
                                ? <img src={photoPreview} alt="avatar" />
                                : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        </div>
                        <label className="settings-photo-btn upload">
                            + Завантажити
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                        </label>
                        {photoPreview && (
                            <button type="button" className="settings-photo-btn delete" onClick={handleDeletePhoto}>
                                🗑 Видалити
                            </button>
                        )}
                    </div>
                </section>

                {/* Профіль */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Профіль</h3>
                    <div className="settings-divider" />
                    <div className="settings-grid">
                        <div className="settings-field">
                            <label>Ім'я</label>
                            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} />
                        </div>
                        <div className="settings-field">
                            <label>Прізвище</label>
                            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
                        </div>
                        <div className="settings-field">
                            <label>По батькові</label>
                            <input type="text" name="middleName" value={form.middleName} onChange={handleChange} />
                        </div>
                        <div className="settings-field">
                            <label>Нікнейм</label>
                            <input type="text" name="userName" value={form.userName} onChange={handleChange} />
                        </div>
                        <div className="settings-field">
                            <label>Місто</label>
                            <input type="text" name="city" value={form.city} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="settings-field settings-field-full" style={{ marginTop: 14 }}>
                        <label>Опис профілю</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Розкажіть про себе..." />
                    </div>
                </section>

                {/* Контакти */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Контакти</h3>
                    <div className="settings-divider" />
                    <div className="settings-grid">
                        <div className="settings-field">
                            <label>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} />
                        </div>
                        <div className="settings-field">
                            <label>Телефон</label>
                            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+380..." />
                        </div>
                    </div>
                </section>

                {/* Безпека */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Безпека</h3>
                    <div className="settings-divider" />
                    <p className="settings-password-note">Залиште порожнім якщо не хочете змінювати пароль</p>
                    <div className="settings-grid">
                        <div className="settings-field">
                            <label>Новий пароль</label>
                            <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                        </div>
                        <div className="settings-field">
                            <label>Підтвердіть новий пароль</label>
                            <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
                        </div>
                    </div>
                </section>

                {error && <div className="settings-error">{error}</div>}
                {success && <div className="settings-success">✓ Збережено!</div>}

                <div className="settings-footer">
                    <button type="submit" className="settings-save-btn" disabled={loading}>
                        ✓ {loading ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                </div>
            </form>

            {/* Небезпечна зона */}
            <section className="settings-section settings-danger-zone">
                <h3 className="settings-section-title" style={{ color: '#ef4444' }}>Небезпечна зона</h3>
                <div className="settings-divider" style={{ borderColor: '#fecaca' }} />
                <div className="settings-danger-row">
                    <div>
                        <p className="settings-danger-title">Видалити акаунт</p>
                        <p className="settings-danger-desc">Це незворотня дія. Всі ваші оголошення будуть видалені.</p>
                    </div>
                    <button type="button" className="settings-delete-account-btn" onClick={() => setShowDeleteConfirm(true)}>
                        Видалити акаунт
                    </button>
                </div>
            </section>

            {/* Модал підтвердження */}
            {showDeleteConfirm && (
                <div className="settings-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="settings-confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Ви впевнені?</h3>
                        <p>Акаунт та всі оголошення будуть <strong>назавжди</strong> видалені. Це дію неможливо скасувати.</p>
                        <div className="settings-confirm-btns">
                            <button className="settings-confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>
                                Скасувати
                            </button>
                            <button className="settings-confirm-delete" onClick={handleDeleteAccount} disabled={deleteLoading}>
                                {deleteLoading ? 'Видалення...' : 'Так, видалити'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileEditing;
