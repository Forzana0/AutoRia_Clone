import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
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
    const [googleLoading, setGoogleLoading] = useState(false);

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
            const token: string = response.data.token;
            localStorage.setItem('token', token);
            dispatch(login(token));
            navigate('/');
        } catch (err: any) {
            const msg = err?.response?.data || 'E-mail або пароль введені не правильно';
            setErrors({ general: typeof msg === 'string' ? msg : 'Невірні дані' });
        } finally {
            setLoading(false);
        }
    };

    // Google OAuth — отримуємо access_token і міняємо на id_token через userinfo
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                // Отримуємо профіль користувача від Google
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                // Відправляємо на бек — бек отримає email + ім'я і знайде/створить юзера
                const response = await api.post('/api/Accounts/GoogleSignIn', {
                    idToken: tokenResponse.access_token,
                    email: userInfo.email,
                    firstName: userInfo.given_name || '',
                    lastName: userInfo.family_name || '',
                });

                const token: string = response.data.token;
                localStorage.setItem('token', token);
                dispatch(login(token));
                navigate('/');
            } catch (err: any) {
                setErrors({ general: 'Помилка входу через Google' });
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setErrors({ general: 'Google авторизацію скасовано' });
        },
    });

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
                    <button
                        type="button"
                        className="social-btn google"
                        onClick={() => googleLogin()}
                        disabled={googleLoading}
                        title="Увійти через Google"
                    >
                        {googleLoading ? '...' : (
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        )}
                    </button>
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
