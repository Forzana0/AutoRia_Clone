import React from 'react';

interface Props {
    onBack: () => void;
}

const PasswordSuccess: React.FC<Props> = ({ onBack }) => {
    return (
        <div className="auth-success">
            <div className="auth-success-icon">✅</div>
            <h2>Ваш пароль успішно змінено</h2>
            <button
                className="auth-submit"
                style={{ maxWidth: 220, margin: '0 auto' }}
                onClick={onBack}
            >
                Повернутись до входу
            </button>
        </div>
    );
};

export default PasswordSuccess;
