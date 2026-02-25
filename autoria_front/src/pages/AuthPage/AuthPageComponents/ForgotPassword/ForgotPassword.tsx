import React, { useState } from 'react';
import api from '../../../../http';

interface ForgotPasswordProps {
    onBack: () => void;
    onNext: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onNext }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!email) { setError('Введіть email'); return; }

        setLoading(true);
        try {
            await api.post('/api/Accounts/SendResetCode', { email });
            onNext(email);
        } catch (err: any) {
            const msg = err?.response?.data?.Message || err?.response?.data || 'Помилка відправки коду';
            setError(typeof msg === 'string' ? msg : 'Користувача з таким email не знайдено');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button type="button" className="auth-back-btn" onClick={onBack}>
                ← Назад
            </button>

            <h2 className="auth-title">Забули пароль?</h2>
            <p className="auth-subtitle">
                Введіть свій E-mail<br />
                Ми надішлемо вам код для відновлення паролю.
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                    <label>Email</label>
                    <div className="auth-input-wrap">
                        <input
                            className={`auth-input ${error ? 'error' : ''}`}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                        />
                    </div>
                    {error && <span className="auth-error-text">{error}</span>}
                </div>

                <button type="submit" className="auth-submit" style={{ marginTop: 8 }} disabled={loading}>
                    {loading ? 'Відправляємо...' : 'Отримати код'}
                </button>
            </form>
        </>
    );
};

export default ForgotPassword;
