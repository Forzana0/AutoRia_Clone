import React, { useState } from 'react';
import './HelpPage.css';

const FAQ_SECTIONS = [
    {
        category: 'Покупцям',
        items: [
            {
                q: 'Як знайти авто?',
                a: 'Використовуйте фільтри за маркою, моделлю, роком, ціною, пробігом та регіоном. Для точнішого пошуку скористайтеся розширеними параметрами.',
            },
            {
                q: 'Як перевірити авто перед покупкою?',
                a: '• перевірте VIN-код\n• переглянте історію авто\n• зустріньтесь із продавцем особисто\n• перевірте документи',
            },
            {
                q: 'Як зв\'язатися з продавцем?',
                a: 'На сторінці оголошення доступні кнопки:\n• подзвонити\n• написати повідомлення',
            },
        ],
    },
    {
        category: 'Продавцям',
        items: [
            {
                q: 'Як додати оголошення?',
                a: '1. Увійдіть у профіль\n2. Натисніть "Додати оголошення"\n3. Заповніть інформацію\n4. Додайте фото\n5. Опублікуйте',
            },
            {
                q: 'Як зробити оголошення більш ефективним?',
                a: 'Рекомендації:\n• 10+ якісних фото\n• чесний опис\n• вказаний VIN\n• реальний пробіг',
            },
        ],
    },
    {
        category: 'Акаунт',
        items: [
            {
                q: 'Як змінити дані профілю?',
                a: 'Перейдіть у "Мій профіль" → Налаштування.',
            },
            {
                q: 'Як відновити пароль?',
                a: 'Натисніть "Забули пароль?" на сторінці входу.',
            },
        ],
    },
    {
        category: 'Оплата',
        items: [
            {
                q: 'Які способи оплати доступні?',
                a: '• банківська карта\n• онлайн-платежі',
            },
            {
                q: 'Що робити, якщо оплата не пройшла?',
                a: 'Зверніться до служби підтримки через форму зворотного зв\'язку.',
            },
            {
                q: 'Якими способами можна поповнити рахунок?',
                a: 'Баланс можна поповнити за допомогою Visa, Mastercard, LiqPay та WayForPay на сторінці профілю.',
            },
        ],
    },
];

interface FaqItemProps {
    q: string;
    a: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`help-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)}>
            <div className="help-faq-row">
                <span className="help-faq-q">{q}</span>
                <svg className="help-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            {open && (
                <div className="help-faq-answer">
                    {a.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
            )}
        </div>
    );
};

const HelpPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const filtered = FAQ_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(i =>
            !search || i.q.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(s => s.items.length > 0);

    return (
        <div className="help-page">
            <div className="help-hero">
                <h1>Чим ми можемо допомогти?</h1>
                <div className="help-search-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        className="help-search-input"
                        placeholder="Введіть своє питання чи ключове слово"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="help-body">
                {filtered.map(section => (
                    <div key={section.category} className="help-faq-section">
                        <h2 className="help-category">{section.category}</h2>
                        {section.items.map((item, i) => (
                            <FaqItem key={i} q={item.q} a={item.a} />
                        ))}
                    </div>
                ))}

                {/* Support form */}
                <div className="help-support">
                    <h2 className="help-support-title">Служба підтримки</h2>
                    <p className="help-support-sub">Напишіть нам і наші спеціалісти обов'язково з вами зв'яжуться!</p>

                    {sent ? (
                        <div className="help-sent">✅ Повідомлення надіслано! Ми зв'яжемося з вами найближчим часом.</div>
                    ) : (
                        <div className="help-form">
                            <div className="help-form-field">
                                <label>Ім'я</label>
                                <input placeholder="Ваше Ім'я" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="help-form-field">
                                <label>Email</label>
                                <input type="email" placeholder="Ваш Email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="help-form-field">
                                <label>Тема повідомлення</label>
                                <input placeholder='Наприклад "Оголошення"' value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="help-form-field">
                                <label>Текст вашого повідомлення</label>
                                <textarea rows={6} value={message} onChange={e => setMessage(e.target.value)} />
                            </div>
                            <button
                                className="help-send-btn"
                                onClick={() => { if (name && email && message) setSent(true); }}
                            >
                                Надіслати
                            </button>
                        </div>
                    )}

                    <p className="help-alt">Або зв'яжіться з нами іншим методом</p>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
