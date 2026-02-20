import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../../redux/authSlice';
import api from '../../../../http';

interface LoginProps {
    onSwitch: () => void;
    onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onForgot }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: typeof errors = {};
        if (!email)    e.email    = 'Введіть email';
        if (!password) e.password = 'Введіть пароль';
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            const response = await api.post('/api/Accounts/SignIn', { email, password });

            // ASP.NET Core повертає camelCase: token, firstName, lastName
            const token: string = response.data.token;
            localStorage.setItem('token', token);
            dispatch(login({
                user: {
                    name: `${response.data.firstName} ${response.data.lastName}`,
                    id: 0,
                    location: '',
                    rating: 0,
                    imageUrl: [],
                },
                token,
            }));
            navigate('/');
        } catch (err: any) {
            const msg = err?.response?.data || 'E-mail або пароль введені не правильно';
            setErrors({ general: typeof msg === 'string' ? msg : 'Невірні дані' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="auth-title">Увійдіть в свій акаунт</h2>

            <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                    <label>Email</label>
                    <div className="auth-input-wrap">
                        <input
                            className={`auth-input ${errors.email || errors.general ? 'error' : ''}`}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors({}); }}
                        />
                    </div>
                    {errors.email && <span className="auth-error-text">{errors.email}</span>}
                </div>

                <div className="auth-field">
                    <label>Пароль</label>
                    <div className="auth-input-wrap">
                        <input
                            className={`auth-input ${errors.password || errors.general ? 'error' : ''}`}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrors({}); }}
                        />
                        <button type="button" className="auth-input-icon" onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? (
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
                            )}
                        </button>
                    </div>
                    {errors.general && <span className="auth-error-text">{errors.general}</span>}
                </div>

                <button type="button" className="auth-forgot" onClick={onForgot}>
                    Забули пароль?
                </button>

                <p className="auth-social-label">Увійдіть за допомогою</p>
                <div className="auth-socials">
                    <button type="button" className="social-btn google">G</button>
                    <button type="button" className="social-btn apple">🍎</button>
                    <button type="button" className="social-btn facebook">f</button>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Завантаження...' : 'Увійти'}
                </button>
            </form>

            <div className="auth-bottom-link">
                <button type="button" onClick={onSwitch}>Зареєструватись на сайт</button>
            </div>
        </>
    );
};

export default Login;
