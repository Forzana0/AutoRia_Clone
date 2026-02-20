import React, { useState } from 'react';
import './AuthPage.css';
import Login from './AuthPageComponents/Login/Login';
import Register from './AuthPageComponents/Register/Register';
import ForgotPassword from './AuthPageComponents/ForgotPassword/ForgotPassword';
import EnterCode from './AuthPageComponents/EnterCode/EnterCode';
import NewPassword from './AuthPageComponents/NewPassword/NewPassword';
import PasswordSuccess from './AuthPageComponents/PasswordSuccess/PasswordSuccess';

type Screen = 'login' | 'register' | 'forgot' | 'code' | 'newpass' | 'success';

const AuthPage: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('login');
    const [resetEmail, setResetEmail] = useState('');

    const renderScreen = () => {
        switch (screen) {
            case 'login':
                return (
                    <Login
                        onSwitch={() => setScreen('register')}
                        onForgot={() => setScreen('forgot')}
                    />
                );
            case 'register':
                return <Register onSwitch={() => setScreen('login')} />;
            case 'forgot':
                return (
                    <ForgotPassword
                        onBack={() => setScreen('login')}
                        onNext={(email) => { setResetEmail(email); setScreen('code'); }}
                    />
                );
            case 'code':
                return (
                    <EnterCode
                        onBack={() => setScreen('forgot')}
                        onNext={() => setScreen('newpass')}
                        onResend={() => { /* TODO: resend code */ }}
                    />
                );
            case 'newpass':
                return (
                    <NewPassword
                        onBack={() => setScreen('code')}
                        onSuccess={() => setScreen('success')}
                    />
                );
            case 'success':
                return <PasswordSuccess />;
            default:
                return null;
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {renderScreen()}
            </div>
        </div>
    );
};

export default AuthPage;
