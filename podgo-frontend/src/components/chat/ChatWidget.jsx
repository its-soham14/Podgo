import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function ChatWidget({ bookingId, clientRef, isConnected, onClose }) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const messagesEndRef = useRef(null);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        if (!bookingId) return;

        // Fetch history
        api.get(`/chat/booking/${bookingId}`).then(res => {
            setMessages(res.data.data);
            scrollToBottom();
        }).catch(err => console.error(err));

        if (clientRef?.current && isConnected) {
            subscriptionRef.current = clientRef.current.subscribe(`/topic/booking/${bookingId}`, (msg) => {
                const newMsg = JSON.parse(msg.body);
                setMessages(prev => [...prev, newMsg]);
                scrollToBottom();
            });
        }

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [bookingId, clientRef, isConnected]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const sendMessage = (textContent) => {
        if (!clientRef?.current || !clientRef.current.connected) {
            setErrorMsg("Chat connecting... please wait a moment.");
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        clientRef.current.publish({
            destination: `/app/chat.sendMessage/${bookingId}`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ senderId: user?.id, content: textContent })
        });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const quickMessages = [
        "Reached at the pickup location",
        "Waiting at the pickup location",
        "On my way",
        "Stuck in traffic",
        "Be there in 5 mins"
    ];

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="bg-[var(--color-primary-500)] text-white p-4 flex justify-between items-center relative">
                <div className="flex items-center gap-2 font-bold">
                    <MessageSquare size={18} /> Chat
                </div>
                <button onClick={onClose} className="hover:bg-[var(--color-primary-600)] p-1 rounded">
                    <X size={18} />
                </button>
                {!isConnected && (
                    <div className="absolute bottom-0 left-0 w-full bg-[var(--color-warning-500)] text-[10px] text-center font-semibold text-[var(--color-warning-900)] py-0.5">
                        Connecting...
                    </div>
                )}
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="bg-[var(--color-danger-500)]/10 text-[var(--color-danger-500)] text-xs text-center py-1 border-b border-[var(--color-danger-500)]/20">
                    {errorMsg}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 h-64 overflow-y-auto p-4 space-y-3 bg-[var(--bg-surface)]">
                {messages.length === 0 ? (
                    <p className="text-center text-xs text-[var(--text-muted)] mt-10">No messages yet. Say hi!</p>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-[10px] text-[var(--text-muted)] mb-1 ml-1">{msg.senderName}</span>}
                                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-[var(--color-primary-500)] text-white rounded-br-sm' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Quick Messages */}
            <div className="flex gap-2 overflow-x-auto p-2 bg-[var(--bg-surface)] border-t border-[var(--border)] scrollbar-hide">
                {quickMessages.map((text, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(text)}
                        className="whitespace-nowrap px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[11px] font-medium text-[var(--text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white hover:border-[var(--color-primary-500)] transition-colors shadow-sm"
                    >
                        {text}
                    </button>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex gap-2">
                <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || !isConnected} 
                    className="bg-[var(--color-primary-500)] text-white p-2 rounded-full disabled:opacity-50 hover:bg-[var(--color-primary-600)] transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
            
            {/* Custom scrollbar hide for quick messages */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
