import React, { useState } from 'react';

interface EnterCodeProps {
  onBack: () => void;
  onNext: () => void;
  onResend: () => void;
}

const EnterCode: React.FC<EnterCodeProps> = ({ onBack, onNext, onResend }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!code) { setError('Введіть код'); return; }
    // TODO: verify code via API
    onNext();
  };

  return (
    <>
      <button type="button" className="auth-back-btn" onClick={onBack}>
        ← Назад
      </button>

      <h2 className="auth-title">Напишіть отриманий код</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label>Код</label>
          <div className="auth-input-wrap">
            <input
              className={`auth-input ${error ? 'error' : ''}`}
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              maxLength={6}
              placeholder="000000"
              style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }}
            />
          </div>
          {error && <span className="auth-error-text">{error}</span>}
        </div>

        <button type="submit" className="auth-submit" style={{ marginTop: 8 }}>
          Скинути пароль
        </button>

        <div className="auth-bottom-link">
          <button type="button" onClick={onResend}>Надіслати пароль ще раз</button>
        </div>
      </form>
    </>
  );
};

export default EnterCode;
