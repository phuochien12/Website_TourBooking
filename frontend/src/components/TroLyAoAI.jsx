import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane, FaCommentDots } from 'react-icons/fa';

const TroLyAoAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', text: 'Chào bạn! Mình là S-Tourist, trợ lý thông minh của Du Lịch Việt. Bạn cần mình giúp gì hôm nay?' }
    ]);
    const [loading, setLoading] = useState(false);
    const endOfMessagesRef = useRef(null);

    // --- LOGIC KÉO THẢ (DRAG & DROP) ---
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const originalPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    const onMouseDown = (e) => {
        if (isOpen) return; // Không cho kéo khi đang mở cửa sổ chat
        setIsDragging(true);
        hasMoved.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
        originalPos.current = { x: position.x, y: position.y };
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved.current = true;
        }

        setPosition({
            x: originalPos.current.x + deltaX,
            y: originalPos.current.y + deltaY
        });
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onTouchStart = (e) => {
        if (isOpen) return;
        setIsDragging(true);
        hasMoved.current = false;
        const touch = e.touches[0];
        dragStart.current = { x: touch.clientX, y: touch.clientY };
        originalPos.current = { x: position.x, y: position.y };
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.current.x;
        const deltaY = touch.clientY - dragStart.current.y;
        
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved.current = true;
        }

        setPosition({
            x: originalPos.current.x + deltaX,
            y: originalPos.current.y + deltaY
        });
    };

    const onTouchEnd = () => {
        setIsDragging(false);
    };

    // Lắng nghe sự kiện toàn cục để kéo mượt hơn
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging]);

    const toggleOpen = () => {
        if (!hasMoved.current) {
            setIsOpen(!isOpen);
        }
    };
    // -----------------------------------

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const quickQuestions = [
        "Địa chỉ công ty",
        "Hotline hỗ trợ",
        "Tư vấn tour 2N1Đ",
        "Giá tour thế nào?"
    ];

    const handleSendMessage = async (customMessage = null) => {
        const textToSend = customMessage || message;
        if (!textToSend.trim() || loading) return;

        const userMsg = { role: 'user', text: textToSend };
        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post('/api/chatbot', { message: textToSend });
            const botAnswer = res.data.answer || "Dạ, mình chưa rõ ý bạn lắm.";
            setChatHistory(prev => [...prev, { role: 'bot', text: botAnswer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'bot', text: "Hệ đóng đang bận một chút, bạn thử lại sau hoặc gọi hotline nhé! ❤️" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 1. Nút bong bóng chat có thể kéo thả */}
            {!isOpen && (
                <div 
                    className="fixed bottom-6 right-6 z-[9999]"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        cursor: isDragging ? 'grabbing' : 'auto'
                    }}
                >
                    <button
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                        onClick={toggleOpen}
                        className="w-16 h-16 bg-gradient-to-br from-navy to-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce cursor-grab active:cursor-grabbing relative group select-none"
                        style={{ touchAction: 'none' }}
                    >
                        <FaRobot size={28} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">1</span>
                        <div className="absolute right-20 bg-white text-navy px-4 py-2 rounded-xl border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                            Cầm tôi kéo đi đâu cũng được! 🚀
                        </div>
                    </button>
                </div>
            )}

            {/* 2. Cửa sổ Chat - LUÔN CỐ ĐỊNH ở một góc để không bị lỗi tràn màn hình */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
                    <div className="bg-white w-[380px] h-[580px] rounded-[30px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-500">
                        {/* Header */}
                        <div className="bg-[#1e3a5f] p-5 text-white flex justify-between items-center shadow-lg relative cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                                    <FaRobot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[15px] tracking-tight">Trợ lý AI - Du Lịch Việt</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-[11px] opacity-80">Đang trực tuyến</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-all">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Nội dung tin nhắn */}
                        <div className="flex-1 overflow-y-auto p-5 bg-[#f8fafc] space-y-4">
                            {chatHistory.map((chat, index) => (
                                <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                        chat.role === 'user' 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-white text-navy rounded-tl-none border border-gray-100'
                                    }`}>
                                        {chat.role === 'bot' && <div className="text-[10px] font-bold opacity-50 mb-1">AI ASSISTANT</div>}
                                        {chat.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-.5s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>

                        {/* Câu hỏi gợi ý */}
                        <div className="p-3 bg-white flex gap-2 overflow-x-auto border-t border-gray-50 no-scrollbar">
                            {quickQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(q)}
                                    className="whitespace-nowrap bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary border border-gray-100 px-4 py-2 rounded-full text-[11px] font-bold transition-all active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-1 border border-transparent focus-within:border-primary focus-within:bg-white transition-all shadow-inner">
                                <input
                                    type="text"
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="w-full bg-transparent border-none py-3 outline-none text-[14px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!message.trim()}
                                    className="ml-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition-all disabled:opacity-30 active:scale-90"
                                >
                                    <FaPaperPlane size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
    );
};

export default TroLyAoAI;
