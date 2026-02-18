import React, { useState } from 'react';

interface NewPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const NewPassword: React.FC<NewPasswordProps> = ({ onBack, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getStrength = (p: string) => {
    if (!p) return null;
    if (p.length < 6) return 'weak';
    if (p.length < 10 || !/[0-9]/.test(p)) return 'medium';
    return 'strong';
  };

  const strengthLabel: Record<string, string> = { weak: 'Слабкий', medium: 'Середній', strong: 'Сильний' };
  const strength = getStrength(password);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!password) e.password = 'Введіть пароль';
    if (password !== confirm) e.confirm = 'Паролі не співпадають';
    if (Object.keys(e).length) { setErrors(e); return; }
    // TODO: API call
    onSuccess();
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
      <button type="button" className="auth-back-btn" onClick={onBack}>
        ← Назад
      </button>

      <h2 className="auth-title">Створіть новий пароль</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label>Новий пароль</label>
          <div className="auth-input-wrap">
            <input
              className={`auth-input ${errors.password ? 'error' : ''}`}
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(er => { const n={...er}; delete n.password; return n; }); }}
            />
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

        <div className="auth-field">
          <label>Підтвердь пароль</label>
          <div className="auth-input-wrap">
            <input
              className={`auth-input ${errors.confirm ? 'error' : ''}`}
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(er => { const n={...er}; delete n.confirm; return n; }); }}
            />
            <button type="button" className="auth-input-icon" onClick={() => setShowConfirm(v => !v)}>
              <EyeIcon show={showConfirm} />
            </button>
          </div>
          {errors.confirm && <span className="auth-error-text">{errors.confirm}</span>}
        </div>

        <button type="submit" className="auth-submit" style={{ marginTop: 8 }}>
          Зберегти
        </button>
      </form>
    </>
  );
};

export default NewPassword;
