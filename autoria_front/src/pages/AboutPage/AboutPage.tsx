import React from 'react';
import './AboutPage.css';

// ↓ ЗАМІНИТИ НА СВОЮ НАЗВУ ФАЙЛУ ФОТО (рядок 7)
import heroBg from '../../images/Car_AboutUs.png';

const features = [
    {
        title: 'Зручний пошук автомобілів',
        desc: 'Підбір авто за ключовими параметрами: марка, модель, рік випуску, ціна, тип пального та інші характеристики.',
    },
    {
        title: 'Обране та порівняння',
        desc: 'Можливість зберігати оголошення та порівнювати кілька варіантів між собою.',
    },
    {
        title: 'Розміщення оголошень',
        desc: 'Швидке додавання автомобіля з детальним описом, фотографіями та контактною інформацією продавця.',
    },
    {
        title: 'Корисні сервіси для покупців',
        desc: 'Перевірка автомобіля за VIN-кодом, оцінка ринкової вартості та калькулятор розмитнення.',
    },
];

const principles = [
    'Орієнтація на потреби користувача',
    'Зручність користування',
    'Відкритість і достовірність інформації',
    'Постійний розвиток і вдосконалення сервісу',
];

const AboutPage: React.FC = () => (
    <div className="about-page">

        {/* Hero */}
        <div className="about-hero">
            <img src={heroBg} alt="Autly" className="about-hero-bg" />
            <div className="about-hero-overlay" />
            <div className="about-hero-content">
                <h1>Сучасна платформа для купівлі та продажу автомобілів в Україні</h1>
                <p>
                    <span className="about-brand">Autly</span> — це сучасний сервіс, створений для зручного, швидкого та безпечного
                    пошуку автомобілів по всій Україні. Платформа об'єднує продавців і покупців,
                    надаючи інструменти для ефективного вибору, порівняння та розміщення
                    автомобільних оголошень.
                </p>
            </div>
        </div>

        <div className="about-body">

            {/* Місія */}
            <section className="about-section">
                <h2 className="about-section-title">Наша місія</h2>
                <div className="about-divider" />
                <p className="about-section-text">
                    Місія Autly — зробити процес купівлі та продажу автомобілів максимально прозорим і зрозумілим для кожного
                    користувача. Ми прагнемо створити середовище, у якому рішення приймаються на основі повної та актуальної
                    інформації, а користування сервісом є простим і комфортним.
                </p>
            </section>

            {/* Що пропонує */}
            <section className="about-section">
                <h2 className="about-section-title">Що пропонує Autly</h2>
                <div className="about-divider" />
                <p className="about-section-text">Основні можливості платформи:</p>
                <div className="about-features">
                    {features.map((f, i) => (
                        <div key={i} className="about-feature-card">
                            <span className="about-feature-title">{f.title}</span>
                            <span className="about-feature-desc">{f.desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Принципи */}
            <section className="about-section">
                <h2 className="about-section-title">Наші принципи</h2>
                <div className="about-divider" />
                <p className="about-section-text">Autly працює на основі ключових принципів</p>
                <div className="about-principles">
                    {principles.map((p, i) => (
                        <div key={i} className="about-principle-card">{p}</div>
                    ))}
                </div>
            </section>

            {/* Quote */}
            <div className="about-quote">
                Ми прагнемо, щоб кожен користувач відчував впевненість на кожному етапі взаємодії з платформою.
            </div>

        </div>
    </div>
);

export default AboutPage;
