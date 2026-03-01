import React, { useState } from 'react';
import './TopUpModal.css';

interface Props {
    onClose: () => void;
    onSuccess?: (amount: number) => void;
}

const TopUpModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState('');
    const [flipped, setFlipped] = useState(false);
    const [success, setSuccess] = useState(false);

    const formatCard = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    };

    const getCardBrand = () => {
        const n = cardNumber.replace(/\s/g, '');
        if (n.startsWith('4')) return 'VISA';
        if (n.startsWith('5')) return 'MC';
        return '';
    };

    const handleSubmit = () => {
        if (!cardNumber || !expiry || !cvv || !amount) return;
        setSuccess(true);
        onSuccess?.(Number(amount));
    };

    const displayNumber = cardNumber || '•••• •••• •••• ••••';
    const displayExpiry = expiry || 'MM/YY';

    return (
        <div className="tum-overlay" onClick={onClose}>
            <div className="tum-modal" onClick={e => e.stopPropagation()}>
                <button className="tum-close" onClick={onClose}>✕</button>

                {success ? (
                    <div className="tum-success">
                        <div className="tum-success-icon">✓</div>
                        <h3>Поповнено!</h3>
                        <p>{amount} грн успішно додано до балансу</p>
                        <button className="tum-pay-btn" onClick={onClose}>Чудово</button>
                    </div>
                ) : (
                    <>
                        <h2 className="tum-title">Поповнити баланс</h2>

                        <div className={`tum-card-wrap ${flipped ? 'flipped' : ''}`}>
                            <div className="tum-card tum-card-front">
                                <div className="tum-card-shine" />
                                <div className="tum-card-top">
                                    <div className="tum-chip">
                                        <div className="tum-chip-line" />
                                        <div className="tum-chip-line" />
                                        <div className="tum-chip-line h" />
                                        <div className="tum-chip-line h" />
                                    </div>
                                    <span className="tum-brand">{getCardBrand()}</span>
                                </div>
                                <div className="tum-card-number">{displayNumber}</div>
                                <div className="tum-card-bottom">
                                    <div>
                                        <div className="tum-card-label">Власник</div>
                                        <div className="tum-card-value">AUTLY USER</div>
                                    </div>
                                    <div>
                                        <div className="tum-card-label">Термін дії</div>
                                        <div className="tum-card-value">{displayExpiry}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="tum-card tum-card-back">
                                <div className="tum-card-stripe" />
                                <div className="tum-cvv-wrap">
                                    <span className="tum-card-label">CVV</span>
                                    <div className="tum-cvv-box">{cvv ? '•'.repeat(cvv.length) : '•••'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="tum-form">
                            <div className="tum-field">
                                <label>Номер картки</label>
                                <input
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCard(e.target.value))}
                                    maxLength={19}
                                    onFocus={() => setFlipped(false)}
                                />
                            </div>
                            <div className="tum-row">
                                <div className="tum-field">
                                    <label>Термін дії</label>
                                    <input
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        onFocus={() => setFlipped(false)}
                                    />
                                </div>
                                <div className="tum-field">
                                    <label>CVV</label>
                                    <input
                                        placeholder="•••"
                                        value={cvv}
                                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        maxLength={3}
                                        onFocus={() => setFlipped(true)}
                                        onBlur={() => setFlipped(false)}
                                        type="password"
                                    />
                                </div>
                            </div>
                            <div className="tum-field">
                                <label>Сума (грн)</label>
                                <div className="tum-amount-presets">
                                    {['100', '250', '500', '1000'].map(a => (
                                        <button
                                            key={a}
                                            className={`tum-preset ${amount === a ? 'active' : ''}`}
                                            onClick={() => setAmount(a)}
                                        >
                                            {a}₴
                                        </button>
                                    ))}
                                </div>
                                <input
                                    placeholder="Або введіть суму"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                                    onFocus={() => setFlipped(false)}
                                />
                            </div>
                            <button className="tum-pay-btn" onClick={handleSubmit}>
                                Поповнити {amount ? `${amount} ₴` : ''}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopUpModal;
