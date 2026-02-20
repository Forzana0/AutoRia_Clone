import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './AccountPage.css';
import AccountHeader from './AccountPageComponents/Header/AccountHeader';

const AccountPage: React.FC = () => {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Користувач не авторизований');
        }
    }, []);

    return (
        <div className="account-page">
            <div className="account-container">
                <AccountHeader />
                <main className="account-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AccountPage;
