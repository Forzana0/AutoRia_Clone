import React from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-success">
      <div className="auth-success-icon">✅</div>
      <h2>Ваш пароль успішно змінено</h2>
      <button
        className="auth-submit"
        style={{ maxWidth: 220, margin: '0 auto' }}
        onClick={() => navigate('/auth')}
      >
        Повернутись до входу
      </button>
    </div>
  );
};

export default PasswordSuccess;
