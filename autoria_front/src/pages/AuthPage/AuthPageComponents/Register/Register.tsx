import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../../redux/authSlice';
import api from '../../../../http';

interface RegisterProps {
    onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        userName: '',
        email: '',
        phoneNumber: '',
        city: '',
        password: '',
        confirm: '',
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const change = (field: string, val: string) => {
        setForm(f => ({ ...f, [field]: val }));
        setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setPhoto(file);
        setErrors(er => { const n = { ...er }; delete n.photo; return n; });
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const getStrength = (p: string) => {
        if (!p) return null;
        if (p.length < 6) return 'weak';
        if (p.length < 10 || !/[0-9]/.test(p)) return 'medium';
        return 'strong';
    };

    const strengthLabel: Record<string, string> = { weak: 'Слабкий', medium: 'Середній', strong: 'Сильний' };
    const strength = getStrength(form.password);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.firstName)   e.firstName   = "Введіть ім'я";
        if (!form.lastName)    e.lastName    = 'Введіть прізвище';
        if (!form.userName)    e.userName    = 'Введіть нікнейм';
        if (!form.email)       e.email       = 'Введіть email';
        if (!form.phoneNumber) e.phoneNumber = 'Введіть телефон';
        if (!form.city)        e.city        = 'Введіть місто';
        if (!form.password)    e.password    = 'Введіть пароль';
        if (!photo)            e.photo       = 'Завантажте фото профілю';
        if (form.password !== form.confirm) e.confirm = 'Паролі не співпадають';
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('FirstName',   form.firstName);
            formData.append('LastName',    form.lastName);
            formData.append('MiddleName',  form.middleName);
            formData.append('UserName',    form.userName);
            formData.append('Email',       form.email);
            formData.append('PhoneNumber', form.phoneNumber);
            formData.append('City',        form.city);
            formData.append('Password',    form.password);
            if (photo) formData.append('Image', photo);

            const response = await api.post('/api/Accounts/Registration', formData);

            const token: string = response.data.Token;
            localStorage.setItem('token', token);
            dispatch(login({
                user: {
                    name: `${form.firstName} ${form.lastName}`,
                    id: 0,
                    location: form.city,
                    rating: 0,
                    imageUrl: [],
                },
                token,
            }));
            navigate('/');
        } catch (err: any) {
            const msg = err?.response?.data?.Message || err?.response?.data || 'Помилка реєстрації';
            setErrors({ general: typeof msg === 'string' ? msg : JSON.stringify(msg) });
        } finally {
            setLoading(false);
        }
    };

    const EyeIcon = ({ show }: { show: boolean }) => show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    return (
        <>
            <h2 className="auth-title">Створіть свій акаунт на сайті!</h2>

            <form onSubmit={handleSubmit} noValidate>

                {/* Фото профілю */}
                <div className="auth-field">
                    <label>Фото профілю</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Превью */}
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: '#f0f0f0',
                            border: `2px solid ${errors.photo ? '#ef4444' : '#e0e0e0'}`,
                            overflow: 'hidden', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {photoPreview
                                ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        </div>
                        {/* Кнопка вибору */}
                        <label style={{
                            padding: '8px 16px', borderRadius: 8,
                            border: `1.5px solid ${errors.photo ? '#ef4444' : '#e0e0e0'}`,
                            background: '#fff', fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', color: '#333',
                        }}>
                            {photo ? 'Змінити фото' : '+ Завантажити'}
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </label>
                        {photo && (
                            <span style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                                {photo.name}
                            </span>
                        )}
                    </div>
                    {errors.photo && <span className="auth-error-text">{errors.photo}</span>}
                </div>

                {/* Ім'я + Прізвище */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <div className="auth-field">
                        <label>Ім'я</label>
                        <div className="auth-input-wrap">
                            <input className={`auth-input ${errors.firstName ? 'error' : ''}`} type="text"
                                   value={form.firstName} onChange={e => change('firstName', e.target.value)} />
                        </div>
                        {errors.firstName && <span className="auth-error-text">{errors.firstName}</span>}
                    </div>
                    <div className="auth-field">
                        <label>Прізвище</label>
                        <div className="auth-input-wrap">
                            <input className={`auth-input ${errors.lastName ? 'error' : ''}`} type="text"
                                   value={form.lastName} onChange={e => change('lastName', e.target.value)} />
                        </div>
                        {errors.lastName && <span className="auth-error-text">{errors.lastName}</span>}
                    </div>
                </div>

                {/* По батькові */}
                <div className="auth-field">
                    <label>По батькові <span style={{ color: '#aaa', fontSize: 11 }}>(необов'язково)</span></label>
                    <div className="auth-input-wrap">
                        <input className="auth-input" type="text"
                               value={form.middleName} onChange={e => change('middleName', e.target.value)} />
                    </div>
                </div>

                {/* Нікнейм */}
                <div className="auth-field">
                    <label>Нікнейм</label>
                    <div className="auth-input-wrap">
                        <input className={`auth-input ${errors.userName ? 'error' : ''}`} type="text"
                               value={form.userName} onChange={e => change('userName', e.target.value)} />
                    </div>
                    {errors.userName && <span className="auth-error-text">{errors.userName}</span>}
                </div>

                {/* Email */}
                <div className="auth-field">
                    <label>Email</label>
                    <div className="auth-input-wrap">
                        <input className={`auth-input ${errors.email ? 'error' : ''}`} type="email"
                               value={form.email} onChange={e => change('email', e.target.value)} />
                    </div>
                    {errors.email && <span className="auth-error-text">{errors.email}</span>}
                </div>

                {/* Телефон + Місто */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <div className="auth-field">
                        <label>Телефон</label>
                        <div className="auth-input-wrap">
                            <input className={`auth-input ${errors.phoneNumber ? 'error' : ''}`} type="tel"
                                   value={form.phoneNumber} onChange={e => change('phoneNumber', e.target.value)}
                                   placeholder="+380..." />
                        </div>
                        {errors.phoneNumber && <span className="auth-error-text">{errors.phoneNumber}</span>}
                    </div>
                    <div className="auth-field">
                        <label>Місто</label>
                        <div className="auth-input-wrap">
                            <input className={`auth-input ${errors.city ? 'error' : ''}`} type="text"
                                   value={form.city} onChange={e => change('city', e.target.value)} />
                        </div>
                        {errors.city && <span className="auth-error-text">{errors.city}</span>}
                    </div>
                </div>

                {/* Пароль */}
                <div className="auth-field">
                    <label>Пароль</label>
                    <div className="auth-input-wrap">
                        <input className={`auth-input ${errors.password ? 'error' : ''}`}
                               type={showPass ? 'text' : 'password'}
                               value={form.password} onChange={e => change('password', e.target.value)} />
                        <button type="button" className="auth-input-icon" onClick={() => setShowPass(v => !v)}>
                            <EyeIcon show={showPass} />
                        </button>
                    </div>
                    {strength && (
                        <div className="password-strength">
                            <span className="strength-label">Складність: {strengthLabel[strength]}</span>
                            <div className="strength-bar">
                                <div className={`strength-fill ${strength}`} />
                            </div>
                        </div>
                    )}
                    {errors.password && <span className="auth-error-text">{errors.password}</span>}
                </div>

                {/* Підтвердження пароля */}
                <div className="auth-field">
                    <label>Підтвердь пароль</label>
                    <div className="auth-input-wrap">
                        <input className={`auth-input ${errors.confirm ? 'error' : ''}`}
                               type={showConfirm ? 'text' : 'password'}
                               value={form.confirm} onChange={e => change('confirm', e.target.value)} />
                        <button type="button" className="auth-input-icon" onClick={() => setShowConfirm(v => !v)}>
                            <EyeIcon show={showConfirm} />
                        </button>
                    </div>
                    {errors.confirm && <span className="auth-error-text">{errors.confirm}</span>}
                </div>

                {/* Загальна помилка */}
                {errors.general && (
                    <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                        <span className="auth-error-text">{errors.general}</span>
                    </div>
                )}

                <p className="auth-social-label">Або зареєструйтесь через</p>
                <div className="auth-socials">
                    <button type="button" className="social-btn google">G</button>
                    <button type="button" className="social-btn apple">🍎</button>
                    <button type="button" className="social-btn facebook">f</button>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Завантаження...' : 'Зареєструватись'}
                </button>

                <p className="auth-terms">
                    Реєструючись, ви погоджуєтесь з умовами{' '}
                    <a href="#">корпоративного користування</a> платформи.{' '}
                    <a href="#">Детальніше</a>
                </p>
            </form>

            <div className="auth-bottom-link" style={{ marginTop: 16 }}>
                Вже маєте акаунт? <button type="button" onClick={onSwitch}>Увійти</button>
            </div>
        </>
    );
};

export default Register;
