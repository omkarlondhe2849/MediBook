import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
    read: boolean;
}

interface ChatProps {
    currentUserId: number;
    otherUserId: number | null;
    otherUserName: string | null;
    onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ currentUserId, otherUserId, otherUserName, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    const fetchHistory = async () => {
        if (!currentUserId || !otherUserId) return;
        try {
            const res: any = await api.get(`/api/messages/history/${currentUserId}/${otherUserId}`);
            setMessages(res || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        if (!currentUserId || !otherUserId) return;

        // Fetch history
        fetchHistory();

        // Setup WebSocket
        const socket = new SockJS('/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WS');
                // Subscribe
                client.subscribe(`/topic/messages/${currentUserId}`, (message) => {
                    const receivedMsg: Message = JSON.parse(message.body);
                    // Filter conversation
                    if (receivedMsg.senderId === otherUserId || receivedMsg.senderId === currentUserId) {

                        if (receivedMsg.senderId === otherUserId && receivedMsg.receiverId === currentUserId ||
                            receivedMsg.senderId === currentUserId && receivedMsg.receiverId === otherUserId) {
                            setMessages(prev => {

                                if (prev.some(m => m.id === receivedMsg.id)) return prev;
                                return [...prev, receivedMsg];
                            });
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [currentUserId, otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserId || !otherUserId) return;

        setLoading(true);
        try {
            // Send via REST

            await api.post('/api/messages/send', {
                senderId: currentUserId,
                receiverId: otherUserId,
                content: newMessage
            });
            setNewMessage('');
            // Wait for WS echo

        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] h-[500px] bg-white rounded-t-xl rounded-b-lg shadow-2xl flex flex-col border border-slate-200 z-[100] overflow-hidden font-sans">

            <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                        {otherUserName?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">{otherUserName || 'Select User'}</h3>
                        <span className="text-[10px] text-blue-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Online
                        </span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>


            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs mt-10">
                        Start a conversation with {otherUserName}
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                                    }`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>


            <div className="p-3 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
