// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatWidget = ({ crop = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/chat/ask', {
        message: text,
        history: messages,
        crop,
      });

      const botMsg = {
        role: 'bot',
        text: res.data.answer || 'Bác chưa nghe rõ, bà con nói lại nhé!',
        source: res.data.source,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const botMsg = {
        role: 'bot',
        text: 'Ôi trời, bác bị lỗi kỹ thuật rồi. Bà con thử lại chút nha! 🌾',
        source: 'error',
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Nếu chưa mở → chỉ hiện nút bong bóng
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-3xl"
        aria-label="Mở chat với Bác Ba Lúa"
      >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-green-700 shadow-md">
          BL
        </div>
        {/* Chấm xanh đang trực tuyến */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-4 border-white animate-pulse"></div>
      </button>
    );
  }

  // Khi mở → hiện full cửa sổ chat
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      {/* Overlay mờ (click để đóng - chỉ hiện trên mobile/tablet) */}
      <div
        className="absolute inset-0 bg-black/40 lg:hidden pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />

      {/* Cửa sổ chat chính */}
      <div className="pointer-events-auto w-full max-w-md lg:max-w-lg h-[85vh] lg:h-[600px] bg-white rounded-3xl shadow-3xl overflow-hidden border border-gray-200 flex flex-col relative">
        {/* Nút đóng (chỉ hiện trên mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-200/80 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-700 font-bold text-xl shadow-md">
            BL
          </div>
          <div>
            <div className="font-bold text-lg">Bác Ba Lúa</div>
            <div className="text-sm opacity-90">Trợ lý nông nghiệp • Đang trực tuyến</div>
          </div>
          {/* Nút đóng trên desktop */}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto hidden lg:block text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-lg font-medium">Chào bà con! Hỏi bác về cây trồng, sâu bệnh, phân bón nhé!</p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-5 py-3 rounded-3xl shadow-md ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}>
                <p className="text-base whitespace-pre-wrap leading-relaxed">{m.text}</p>
                {m.role === 'bot' && m.source && (
                  <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                    {m.source === 'gemini+kb' && '🧠 Kiến thức + AI'}
                    {m.source === 'kb' && '📚 Kiến thức chuyên gia'}
                    {m.source === 'gemini' && '🤖 AI thông minh'}
                    {m.source === 'rule' && '🌾 Kinh nghiệm đồng áng'}
                    {m.source === 'greeting' && '👋 Chào bà con'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-5 py-3 rounded-3xl shadow-md border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-gray-600">Bác Ba Lúa đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Có thắc mắc về sâu bệnh thì nhắn nhé...."
              className="flex-1 px-5 py-3.5 bg-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:bg-white transition-all text-base placeholder-gray-500"
              disabled={loading}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`p-3.5 rounded-full transition-all shadow-lg ${
                loading || !input.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;