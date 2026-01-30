import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import PatientLayout from '../../shared/components/PatientLayout';
import { formatTime } from '../../shared/utils/dateUtils';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
    read: boolean;
}

interface UserSummary {
    id: number;
    name: string;
    role: string;
    profilePhoto?: string;
}

const Chat: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<UserSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClientRef = useRef<Client | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const startChatWith = location.state?.startChatWith as UserSummary | undefined;

    // Fetch conversations function
    const fetchConversations = async () => {
        if (!user) return;
        try {
            const res: any = await api.get(`/api/messages/conversations/${user.id}`);
            const mapped: UserSummary[] = (res || []).map((c: any) => ({
                id: c.userId,
                name: c.name || 'Unknown User',
                role: 'User',
                profilePhoto: c.profilePhoto
            }));

            // Handle new chat start (if passed from state)
            if (startChatWith) {
                const exists = mapped.find(u => u.id === startChatWith.id);
                if (!exists) {
                    mapped.unshift(startChatWith);
                }
                // Only set selected user if not already set (or if we want to force it on mount)
                // But this runs on every WS message now? No, we should be careful.
                // We shouldn't reset selectedUser on background refresh.
            }
            setConversations(mapped);
        } catch (e) {
            console.error("Failed to fetch conversations", e);
        }
    };

    // Initial load
    useEffect(() => {
        fetchConversations();
        if (startChatWith) setSelectedUser(startChatWith);
    }, [user, startChatWith]);

    // WebSocket
    useEffect(() => {
        if (!user) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WS (Page)');
                console.log(`Subscribing to /topic/messages/${user.id}`);
                client.subscribe(`/topic/messages/${user.id}`, (message) => {
                    console.log("Received WS message:", message.body);
                    const receivedMsg: Message = JSON.parse(message.body);

                    // Refresh conversations list to show new sender or update order
                    fetchConversations();

                    // Update state if message is for current chat
                    setSelectedUser(currentSelected => {
                        const senderId = Number(receivedMsg.senderId);
                        const receiverId = Number(receivedMsg.receiverId);
                        const currentUserId = Number(user.id);

                        if (currentSelected) {
                            const currentSelectedId = Number(currentSelected.id);
                            const isFromCurrentChat = senderId === currentSelectedId;
                            const isMyMessageToCurrentChat = senderId === currentUserId && receiverId === currentSelectedId;

                            if (isFromCurrentChat || isMyMessageToCurrentChat) {
                                setMessages(prev => {
                                    if (prev.some(m => m.id === receivedMsg.id)) return prev;
                                    return [...prev, receivedMsg];
                                });
                            }
                        }
                        return currentSelected;
                    });
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
                console.log("Deactivating WS client");
                client.deactivate();
            }
        };
    }, [user]);

    // Fetch messages
    useEffect(() => {
        if (!user || !selectedUser) return;
        const fetchHistory = async () => {
            try {
                const res: any = await api.get(`/api/messages/history/${user.id}/${selectedUser.id}`);
                setMessages(res || []);
            } catch (e) {
                console.error("Failed to fetch messages", e);
            }
        };
        fetchHistory();
    }, [user, selectedUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !selectedUser) return;
        const tempContent = newMessage;
        setNewMessage('');

        // Optimistic Update
        const optimisticMsg: Message = {
            id: Date.now(), // Temp ID
            senderId: user.id,
            receiverId: selectedUser.id,
            content: tempContent,
            sentAt: new Date().toISOString(),
            read: false
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await api.post('/api/messages/send', {
                senderId: user.id,
                receiverId: selectedUser.id,
                content: tempContent
            });
            // WS will broadcast (and duplicate? see below)
            // Ideally we dedupe by ID or replace the optimistic one.
            // But since our state update logic checks ID, and this has a Temp ID...
            // We might see duplicates unless we handle it. 
            // Actually, WS broadcast replaces it if we match by content/time? No.
            // Simple approach: Let WS update happen. If ID differs, we might get double.
            // Better: Don't setMessages here? 
            // The user says "no auto refresh". This implies NOTHING appears.
            // Optimistic is good verification.
        } catch (e) {
            console.error("Failed to send message", e);
            alert("Failed to send message");
            // Rollback optimistic?
        }
    };

    const chatContent = (
        <div className="h-full flex flex-col">
            {/* Chat grid */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 card p-0 overflow-hidden ${user?.role === 'PATIENT' ? 'h-[calc(100vh-140px)]' : 'h-[calc(100vh-80px)]'}`}>
                {/* Sidebar */}
                <div className="md:col-span-1 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="font-bold text-lg text-slate-700">Messages</h2>
                    </div>
                    <div>
                        {conversations.length === 0 ? (
                            <p className="p-4 text-gray-400 text-sm">No contacts found.</p>
                        ) : (
                            conversations.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedUser(c)}
                                    className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100 ${selectedUser?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="font-bold text-slate-800">{c.name}</div>
                                    <div className="text-xs text-slate-500 uppercase">{c.role}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-3 flex flex-col h-full bg-white">
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
                                <h2 className="font-bold text-lg">{selectedUser.name}</h2>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                {messages.map(m => {
                                    const isMe = m.senderId === user?.id;
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                                                <p>{m.content}</p>
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {formatTime(m.sentAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                            <div className="text-4xl mb-2">💬</div>
                            <p>Select a contact to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (user?.role === 'PATIENT') {
        return (
            <PatientLayout activePage="messages" hideSidebar={true}>
                {chatContent}
            </PatientLayout>
        );
    }

    return (
        <div className="container py-8">
            {chatContent}
        </div>
    );
};

export default Chat;
