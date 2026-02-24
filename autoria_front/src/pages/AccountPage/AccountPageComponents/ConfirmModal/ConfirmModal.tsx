import React from 'react';
import './ConfirmModal.css';

interface Props {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

const ConfirmModal: React.FC<Props> = ({
    title = 'Підтвердження',
    message = 'Ви впевнені?',
    confirmText = 'Видалити',
    cancelText = 'Скасувати',
    onConfirm,
    onCancel,
    danger = true,
}) => (
    <div className="cm-overlay" onClick={onCancel}>
        <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className={`cm-icon ${danger ? 'danger' : ''}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                </svg>
            </div>
            <h3 className="cm-title">{title}</h3>
            <p className="cm-message">{message}</p>
            <div className="cm-actions">
                <button className="cm-cancel-btn" onClick={onCancel}>{cancelText}</button>
                <button className={`cm-confirm-btn ${danger ? 'danger' : ''}`} onClick={onConfirm}>{confirmText}</button>
            </div>
        </div>
    </div>
);

export default ConfirmModal;
