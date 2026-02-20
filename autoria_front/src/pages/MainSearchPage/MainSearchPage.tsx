import React from 'react';
import './MainSearchPage.css';
import MainSearchHeader from './MainSearchPageComponents/Header/MainSearchHeader';
import CarSearchForm from './MainSearchPageComponents/Header/HeaderComponents/CarSearchForm';
import HomeContent from './MainSearchPageComponents/HomeContent/HomeContent';

const MainSearchPage: React.FC = () => {
    return (
        <div className="main-search-page">
            <MainSearchHeader />
            <CarSearchForm />
            <HomeContent />
        </div>
    );
};

export default MainSearchPage;
