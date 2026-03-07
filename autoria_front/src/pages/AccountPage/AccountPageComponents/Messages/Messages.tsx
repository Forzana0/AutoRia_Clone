import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import './Messages.css';
import { RootState } from '../../../../redux/store';

const API = 'http://localhost:5174';

interface Message {
    id: number;
    fromUserId: number;
    toUserId: number;
    text: string;
    sentAt: string;
    isRead: boolean;
}

interface Conversation {
    withUserId: number;
    name: string;
    photo?: string;
    lastMessage: string;
    lastTime: string;
    unreadCount: number;
}

const decodeToken = (token: string) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
        ? d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
};

const Messages: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tokenFromRedux = useSelector((state: RootState) => state.auth.token);
    const token = tokenFromRedux || localStorage.getItem('token');
    const currentUserId = token ? Number(decodeToken(token)?.id) : null;

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);
    const activeUserIdRef = useRef<number | null>(null);

    const setActiveUserIdBoth = (id: number | null) => {
        setActiveUserId(id);
        activeUserIdRef.current = id;
    };
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeUser, setActiveUser] = useState<{ name: string; photo?: string } | null>(null);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [loading, setLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // SignalR connection
    useEffect(() => {
        if (!currentUserId) return;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl(`${API}/hubs/chat?userId=${currentUserId}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();

        conn.on('ReceiveMessage', (msg: Message) => {
            setMessages(prev => {
                // Уникнути дублікатів
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            // Оновити останнє повідомлення в списку розмов
            setConversations(prev => prev.map(c => {
                const isRelated =
                    (msg.fromUserId === currentUserId && msg.toUserId === c.withUserId) ||
                    (msg.fromUserId === c.withUserId && msg.toUserId === currentUserId);
                if (!isRelated) return c;
                return {
                    ...c,
                    lastMessage: msg.text,
                    lastTime: msg.sentAt,
                    unreadCount: msg.toUserId === currentUserId && msg.fromUserId !== activeUserIdRef.current
                        ? c.unreadCount + 1
                        : c.unreadCount,
                };
            }));
        });

        conn.start().catch(console.error);
        setConnection(conn);

        return () => { conn.stop(); };
    }, [currentUserId]);

    // Load conversations
    useEffect(() => {
        if (!currentUserId) return;
        axios.get(`${API}/api/Chat/GetConversations/${currentUserId}`)
            .then(r => setConversations(r.data || []))
            .catch(console.error);
    }, [currentUserId]);

    // Open conversation from URL param (?with=userId)
    useEffect(() => {
        const withId = searchParams.get('with');
        if (withId && currentUserId) {
            openConversation(Number(withId));
        }
    }, [searchParams, currentUserId]);

    const openConversation = async (withUserId: number) => {
        if (!currentUserId) return;
        setActiveUserIdBoth(withUserId);
        setLoading(true);
        try {
            const [histRes, userRes] = await Promise.all([
                axios.get(`${API}/api/Chat/GetHistory/${currentUserId}/${withUserId}`),
                axios.get(`${API}/api/Accounts/GetUserById/${withUserId}`),
            ]);
            setMessages(histRes.data || []);
            setActiveUser({
                name: `${userRes.data.firstName || ''} ${userRes.data.lastName || ''}`.trim() || userRes.data.userName,
                photo: userRes.data.photo,
            });
            // Позначити як прочитані
            await axios.post(`${API}/api/Chat/MarkRead/${withUserId}/${currentUserId}`);
            setConversations(prev => prev.map(c =>
                c.withUserId === withUserId ? { ...c, unreadCount: 0 } : c
            ));
            // Якщо розмови немає в списку — додати
            setConversations(prev => {
                if (prev.some(c => c.withUserId === withUserId)) return prev;
                return [{
                    withUserId,
                    name: `${userRes.data.firstName || ''} ${userRes.data.lastName || ''}`.trim() || userRes.data.userName,
                    photo: userRes.data.photo,
                    lastMessage: '',
                    lastTime: new Date().toISOString(),
                    unreadCount: 0,
                }, ...prev];
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || !connection || !currentUserId || !activeUserId) return;
        try {
            await connection.invoke('SendMessage', currentUserId, activeUserId, inputText.trim());
            setInputText('');
        } catch (e) {
            console.error(e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!currentUserId) {
        return <div className="msg-empty">Будь ласка, увійдіть в акаунт</div>;
    }

    return (
        <div className="msg-wrapper">
            {/* Left — conversations list */}
            <div className="msg-sidebar">
                <div className="msg-sidebar-header">
                    <h3>Повідомлення</h3>
                </div>
                <div className="msg-conversations">
                    {conversations.length === 0 ? (
                        <div className="msg-no-convs">Поки немає розмов</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.withUserId}
                                className={`msg-conv-item ${activeUserId === conv.withUserId ? 'active' : ''}`}
                                onClick={() => openConversation(conv.withUserId)}
                            >
                                <div className="msg-conv-avatar">
                                    {conv.photo
                                        ? <img src={`${API}/images/200_${conv.photo}`} alt={conv.name} />
                                        : <span>{conv.name.slice(0, 2).toUpperCase()}</span>
                                    }
                                </div>
                                <div className="msg-conv-info">
                                    <div className="msg-conv-name">{conv.name}</div>
                                    <div className="msg-conv-last">{conv.lastMessage || 'Почніть розмову'}</div>
                                </div>
                                <div className="msg-conv-meta">
                                    {conv.lastTime && (
                                        <span className="msg-conv-time">{formatTime(conv.lastTime)}</span>
                                    )}
                                    {conv.unreadCount > 0 && (
                                        <span className="msg-conv-badge">{conv.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right — chat window */}
            <div className="msg-chat">
                {!activeUserId ? (
                    <div className="msg-chat-empty">
                        <div className="msg-chat-empty-icon">💬</div>
                        <p>Оберіть розмову зліва</p>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div className="msg-chat-header">
                            {activeUser?.photo
                                ? <img className="msg-chat-avatar" src={`${API}/images/200_${activeUser.photo}`} alt="" />
                                : <div className="msg-chat-avatar-placeholder">
                                    {activeUser?.name.slice(0, 2).toUpperCase()}
                                </div>
                            }
                            <div className="msg-chat-username">{activeUser?.name}</div>
                        </div>

                        {/* Messages */}
                        <div className="msg-messages" ref={messagesContainerRef}>
                            {loading ? (
                                <div className="msg-loading">Завантаження...</div>
                            ) : messages.length === 0 ? (
                                <div className="msg-no-messages">Поки немає повідомлень. Напишіть першим!</div>
                            ) : (
                                messages.map(msg => {
                                    const isMine = msg.fromUserId === currentUserId;
                                    return (
                                        <div key={msg.id} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                                            <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                                <span className="msg-text">{msg.text}</span>
                                                <span className="msg-time">{formatTime(msg.sentAt)}</span>
                                                {isMine && (
                                                    <span className="msg-read">{msg.isRead ? '✓✓' : '✓'}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="msg-input-row">
                            <textarea
                                className="msg-input"
                                placeholder="Написати повідомлення..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <button
                                className="msg-send-btn"
                                onClick={sendMessage}
                                disabled={!inputText.trim()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Messages;
