// src/components/ChatWidget.jsx  ← DÁN ĐÈ TOÀN BỘ FILE NÀY (chỉ thay phần sendMessage + thêm 1 dòng state)
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Paperclip } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Chào bà con! Bác Ba Lúa đây ạ! Hôm nay cây trồng có gì lạ không? Cứ gửi ảnh hoặc kể triệu chứng, bác tư vấn liền!",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ←←← HÀM QUAN TRỌNG NHẤT: GỬI LỊCH SỬ CHAT CHO GEMINI
  const sendMessage = async () => {
    if (!input.trim() && !imagePreview) return;
    if (isLoading) return;

    const userMessage = {
      text: input || "Bà con gửi ảnh bệnh cây trồng",
      sender: "user",
      image: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setImagePreview(null);
    setImageFile(null);
    setIsLoading(true);

    try {
      // Chuẩn bị lịch sử theo đúng format Gemini cần
      const historyForGemini = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: msg.image
          ? [
              { text: msg.text || "Bà con gửi ảnh" },
              { inline_data: { mime_type: "image/jpeg", data: msg.image.split(',')[1] } }
            ]
          : [{ text: msg.text }]
      }));

      // Tin nhắn hiện tại
      const currentParts = [];
      if (input.trim()) currentParts.push({ text: input });
      if (imagePreview) {
        currentParts.push({
          inline_data: { mime_type: "image/jpeg", data: imagePreview.split(',')[1] }
        });
      }
      historyForGemini.push({ role: "user", parts: currentParts });

      const res = await fetch("http://localhost:3001/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyForGemini })
      });

      if (!res.ok) throw new Error("Lỗi server");

      const data = await res.json();
      setMessages(prev => [...prev, { text: data.answer, sender: "bot" }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        text: "Trời ơi mạng chậm quá, bà con gửi lại giúp bác nha!",
        sender: "bot"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Giao diện chat (giữ nguyên như cũ)
  return (
    <>
      {/* Nút mở chat */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition z-50"
        >
          <MessageCircle size={32} />
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-0 right-6 w-96 h-[600px] bg-white rounded-t-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                BL
              </div>
              <div>
                <h3 className="font-bold text-lg">Bác Ba Lúa - Chuyên gia AI</h3>
                <p className="text-sm opacity-90">Luôn sẵn sàng giúp bà con</p>
              </div>
            </div>
            <button onClick={toggleChat} className="hover:bg-white/20 rounded-full p-2">
              <X size={24} />
            </button>
          </div>

          {/* Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                  msg.sender === "user" 
                    ? "bg-green-600 text-white" 
                    : "bg-white shadow-md text-gray-800"
                }`}>
                  {msg.image && <img src={msg.image} alt="Ảnh bệnh cây" className="w-full rounded-lg mb-2" />}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-md px-4 py-3 rounded-2xl">
                  <p className="text-gray-600">Bác đang xem kỹ đây...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-24 rounded-lg" />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <Paperclip size={24} className="text-gray-500 hover:text-green-600" />
                <input type="file" accept="image/*" onChange={handleImageSelect} ref={fileInputRef} className="hidden" />
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Mô tả triệu chứng hoặc hỏi chuyện..."
                className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-green-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;