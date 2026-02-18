import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/Navbar';
import PagesFooter from './components/footer/PagesFooter';
import MainSearchPage from './pages/MainSearchPage/MainSearchPage';
import AuthPage from './pages/AuthPage/AuthPage';
import AccountPage from './pages/AccountPage/AccountPage';
import EditAccountPage from './pages/EditAccountPage/EditAccountPage';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/"     element={<MainSearchPage />} />
                <Route path="/auth" element={<AuthPage />} />

                <Route path="/account" element={<AccountPage />}>
                    <Route index          element={<div>Статистика (coming soon)</div>} />
                    <Route path="edit"    element={<EditAccountPage />} />
                    <Route path="ads"     element={<div>Мої оголошення</div>} />
                    <Route path="messages"      element={<div>Повідомлення</div>} />
                    <Route path="favorites"     element={<div>Улюблене</div>} />
                    <Route path="notifications" element={<div>Сповіщення</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <PagesFooter />
        </BrowserRouter>
    );
};

export default App;
