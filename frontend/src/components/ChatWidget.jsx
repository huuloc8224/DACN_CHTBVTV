import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, Send, X, Loader } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "🌾 Chào bạn! Tôi là trợ lý AI của Vật Tư Nông Nghiệp. Bạn cần tư vấn về bệnh cây trồng nào?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng tư vấn AI.");
      navigate("/login");
      setIsOpen(false);
      return;
    }

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/chat/ask", { question: input });
      const botMessage = { text: res.data.answer, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      let errorText = "Lỗi: Không thể kết nối đến hệ thống tư vấn.";
      if (error.response?.status === 401) {
        errorText = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        navigate("/login");
      }
      const errorMessage = { text: errorText, sender: "bot" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
          aria-label="Mở Chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200">
          <div className="flex justify-between items-center p-3 bg-green-600 text-white rounded-t-xl">
            <h3 className="font-bold">Chuyên gia Tư vấn AI</h3>
            <button onClick={toggleOpen} className="hover:opacity-70">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] text-[15px] leading-relaxed overflow-hidden break-words whitespace-normal ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 mb-1 text-green-700 font-semibold">
                      🌾 Trợ lý AI
                    </div>
                  )}

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p {...props} className="break-words whitespace-normal mb-2" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc ml-4 mb-2 break-words whitespace-normal" />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} className="break-words whitespace-normal" />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 flex items-center gap-2 text-[15px]">
                  <Loader size={16} className="animate-spin" />
                  Đang phân tích...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex p-3 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về triệu chứng bệnh..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-3 rounded-r-lg hover:bg-green-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
