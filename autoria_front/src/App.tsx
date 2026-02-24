import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/Navbar';
import PagesFooter from './components/footer/PagesFooter';
import MainSearchPage from './pages/MainSearchPage/MainSearchPage';
import AuthPage from './pages/AuthPage/AuthPage';
import AccountPage from './pages/AccountPage/AccountPage';
import EditAccountPage from './pages/EditAccountPage/EditAccountPage';
import PostAdPage from './pages/PostAdPage/PostAdPage';
import ProductPage from './pages/ProductPage/ProductPage';
import SellerPage from './pages/SellerPage/SellerPage';
import MyAds from './pages/AccountPage/AccountPageComponents/MyAds/MyAds';
import SearchContent from './pages/MainSearchPage/MainSearchPageComponents/SearchContent/SearchContent';
import Favorites from "./pages/AccountPage/AccountPageComponents/Favorites/Favorites.tsx";

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path="/"                element={<MainSearchPage />} />
                <Route path="/search"          element={<SearchContent />} />
                <Route path="/auth"            element={<AuthPage />} />
                <Route path="/post-ad"         element={<PostAdPage />} />
                <Route path="/product/:id"     element={<ProductPage />} />
                <Route path="/carproduct/:id"  element={<ProductPage />} />
                <Route path="/seller/:userId"  element={<SellerPage />} />

                <Route path="/account" element={<AccountPage />}>
                    <Route index                element={<MyAds />} />
                    <Route path="edit"          element={<EditAccountPage />} />
                    <Route path="ads"           element={<MyAds />} />
                    <Route path="messages"      element={<div>Повідомлення</div>} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="notifications" element={<div>Сповіщення</div>} />

                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <PagesFooter />
        </BrowserRouter>
    );
};

export default App;
