import React, { useState } from 'react';
import api from '../../../../http';

interface EnterCodeProps {
    onBack: () => void;
    onNext: (code: string) => void;
    onResend: () => void;
    email: string;
}

const EnterCode: React.FC<EnterCodeProps> = ({ onBack, onNext, onResend, email }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!code) { setError('Введіть код'); return; }

        setLoading(true);
        try {
            await api.post('/api/Accounts/VerifyResetCode', { email, code });
            onNext(code);
        } catch (err: any) {
            setError('Невірний або прострочений код');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await api.post('/api/Accounts/SendResetCode', { email });
            setResendSent(true);
            setTimeout(() => setResendSent(false), 4000);
        } catch {
            setError('Не вдалось відправити код повторно');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <>
            <button type="button" className="auth-back-btn" onClick={onBack}>
                ← Назад
            </button>

            <h2 className="auth-title">Напишіть отриманий код</h2>
            <p className="auth-subtitle">
                Код відправлено на<br />
                <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                    <label>Код</label>
                    <div className="auth-input-wrap">
                        <input
                            className={`auth-input ${error ? 'error' : ''}`}
                            type="text"
                            value={code}
                            onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                            maxLength={6}
                            placeholder="000000"
                            style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }}
                        />
                    </div>
                    {error && <span className="auth-error-text">{error}</span>}
                </div>

                <button type="submit" className="auth-submit" style={{ marginTop: 8 }} disabled={loading}>
                    {loading ? 'Перевірка...' : 'Скинути пароль'}
                </button>

                <div className="auth-bottom-link">
                    {resendSent
                        ? <span style={{ color: '#10b981', fontSize: 13 }}>✓ Код надіслано повторно</span>
                        : <button type="button" onClick={handleResend} disabled={resendLoading}>
                            {resendLoading ? 'Відправляємо...' : 'Надіслати код ще раз'}
                        </button>
                    }
                </div>
            </form>
        </>
    );
};

export default EnterCode;
