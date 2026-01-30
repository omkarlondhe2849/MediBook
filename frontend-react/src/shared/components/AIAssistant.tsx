import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I am the MediBook AI Assistant. How can I help you find a doctor today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history (exclude the very last user message we just added to avoid duplication if backend appends it, 
            // but here we are sending it as part of history for context. 
            // Actually, backend usually expects "message" + "history of previous". 
            // Let's send previous messages as history.
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            // API call
            const response: any = await api.post('/api/ai/chat', {
                message: userMsg,
                history: history
            });

            const aiMsg = response.response || "Sorry, I couldn't understand that.";
            setMessages(prev => [...prev, { role: 'assistant', content: aiMsg }]);
        } catch (error) {
            console.error("AI Chat Error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">


            {isOpen && (
                <div className="bg-white pointer-events-auto rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 flex flex-col overflow-hidden animate-fade-in-up transition-all h-[500px]">

                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-sm">MediBook AI</h3>
                                <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-indigo-500 p-1 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>


                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-sm max-w-none text-inherit dark:prose-invert [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:mb-2 last:[&>p]:mb-0">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about doctors, symptoms..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-2 rounded-xl transition-colors shadow-sm"
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}


            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-indigo-600 animate-bounce-slow'
                    }`}
            >
                <span className="text-3xl text-white">{isOpen ? '✕' : '🤖'}</span>
            </button>

        </div>
    );
};

export default AIAssistant;
