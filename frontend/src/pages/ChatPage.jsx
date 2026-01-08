import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { Send, Package, Loader2 as Loader, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const placeholderImg = 'https://placehold.co/300x200?text=SP';
const formatCurrency = v =>
  new Intl.NumberFormat('vi-VN').format(v) + '₫';

const ChatPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const userId = user?._id || 'guest';

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const activeSession = sessions.find(s => s._id === activeSessionId);

  /* ================= LOAD HISTORY ================= */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/chat/history?userId=${userId}`
        );
        const data = res.data || [];
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0]._id);
        }
      } catch (err) {
        console.error('Load history error:', err);
      }
    };
    fetchHistory();
  }, [userId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  /* ================= CHAT MỚI ================= */
  const startNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  /* ================= SEND MESSAGE ================= */
    const sendMessage = async () => {
      const text = input.trim();
      if (!text || loading) return;

      setInput('');
      setLoading(true);

      // 1️⃣ HIỆN TIN USER NGAY
      if (!activeSessionId) {
        const tempId = 'temp-' + Date.now();

        setSessions(prev => [
          {
            _id: tempId,
            title: 'Tư vấn mới',
            disease: null,
            messages: [{ role: 'user', text }],
            suggestedProducts: []
          },
          ...prev
        ]);

        setActiveSessionId(tempId);
      } else {
        setSessions(prev =>
          prev.map(s =>
            s._id === activeSessionId
              ? { ...s, messages: [...s.messages, { role: 'user', text }] }
              : s
          )
        );
      }

      try {
        // 2️⃣ GỌI API
        const res = await axios.post('http://localhost:3001/api/chat/ask', {
          userId,
          message: text,
          sessionId: activeSessionId?.startsWith('temp-')
            ? null
            : activeSessionId
        });

        const {
          sessionId,
          answer,
          disease,
          products = [],
          isDiagnosis
        } = res.data;

        // 3️⃣ THÊM TIN BOT
        setSessions(prev =>
          prev.map(s =>
            s._id === activeSessionId || s._id.startsWith('temp-')
              ? {
                  ...s,
                  _id: sessionId,
                  title: disease || s.title,
                  disease: disease || null,
                  messages: [...s.messages, { role: 'bot', text: answer }],
                  suggestedProducts: isDiagnosis ? products : []
                }
              : s
          )
        );

        setActiveSessionId(sessionId);
      } catch (err) {
        console.error('Send message error:', err);

        setSessions(prev =>
          prev.map(s =>
            s._id === activeSessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    {
                      role: 'bot',
                      text: 'Bác Ba Lúa hơi mệt 😅 bà con hỏi lại giúp bác nha!'
                    }
                  ]
                }
              : s
          )
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">

        {/* ===== LỊCH SỬ ===== */}
        <div className="w-72 bg-white border-r flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-bold">Lịch sử chat</span>
            <button
              onClick={startNewChat}
              className="px-3 py-1 rounded bg-green-600 text-white text-sm"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map(s => (
              <button
                key={s._id}
                onClick={() => setActiveSessionId(s._id)}
                className={`w-full text-left px-4 py-3 rounded-xl ${
                  s._id === activeSessionId
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold truncate">
                  {s.disease || s.title}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {s.messages?.length || 0} tin
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== CHAT ===== */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {!activeSession ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-6xl mb-4">🌾</div>
                Nhập triệu chứng để bắt đầu tư vấn
              </div>
            ) : (
              activeSession.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}
                >
                  <div
                    className={`max-w-xl px-5 py-3 rounded-3xl shadow whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="bg-white px-5 py-3 rounded-3xl shadow border w-fit">
                Bác Ba Lúa đang suy nghĩ…
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-4 flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cho Bác Ba Lúa..."
              className="flex-1 px-5 py-3 rounded-full bg-gray-100"
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-6 rounded-full bg-green-600 text-white"
            >
              {loading ? <Loader className="animate-spin" /> : <Send />}
            </button>
          </div>
        </div>

        {/* ===== GỢI Ý SẢN PHẨM ===== */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b font-bold flex items-center gap-2">
            <Package size={18} className="text-green-600" />
            Gợi ý sản phẩm
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeSession || activeSession.suggestedProducts.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Hãy nhập triệu chứng để nhận gợi ý sản phẩm
              </div>
            ) : (
              activeSession.suggestedProducts.map(p => (
                <div key={p._id} className="bg-gray-50 rounded-xl shadow">
                  <img
                    src={p.image_url || placeholderImg}
                    className="w-full h-40 object-cover"
                    alt={p.name}
                  />
                  <div className="p-4">
                    <div className="font-bold mb-1">{p.name}</div>
                    <div className="text-green-600 font-extrabold mb-3">
                      {formatCurrency(p.price)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(p, 1, p.price)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Thêm vào giỏ
                      </button>

                      <button
                        onClick={() =>
                          window.location.href = `/products/${p._id}`
                        }
                        className="flex-1 py-2 border border-green-600 text-green-700 rounded-lg"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
