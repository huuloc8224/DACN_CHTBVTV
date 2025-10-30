require("dotenv").config();
const KnowledgeBase = require("../models/KnowledgeBase");
const fetch = require("node-fetch");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Thiếu GEMINI_API_KEY trong file .env");
}

// 🧠 Lọc từ khóa trong câu hỏi
function extractKeywords(input) {
  const stopWords = [
    "là", "bị", "có", "cây", "lúa", "của", "tôi", "ở", "trên", "và",
    "xin", "hỏi", "vui", "lòng", "cung", "cấp", "thêm", "triệu", "chứng"
  ];
  return input
    .toLowerCase()
    .replace(/[.,;!?]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

// 🔍 Cách 1 + 2: Tìm bệnh có điểm khớp cao nhất và in log context
async function retrieveContext(question) {
  const keywords = extractKeywords(question);
  if (keywords.length === 0)
    return "Không tìm thấy thông tin (không có từ khóa).";

  const all = await KnowledgeBase.find();

  const scored = all.map(d => {
    const matchCount = d.symptoms.reduce((acc, s) => {
      return acc + keywords.filter(k => s.toLowerCase().includes(k)).length;
    }, 0);
    return { ...d._doc, score: matchCount };
  });

  const results = scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1);

  if (!results.length)
    return "Không tìm thấy thông tin cụ thể trong cơ sở dữ liệu.";

  const context = results
    .map(
      (r, i) => `
[${i + 1}]
🌾 Chủ đề: ${r.topic}
🪴 Triệu chứng:
${r.symptoms.map(s => `- ${s}`).join("\n")}
💊 Điều trị: ${r.treatment_recommendations}
`
    )
    .join("\n\n");

  console.log("🧩 Context gửi sang Gemini:\n", context);

  return context;
}

// ✨ Format lại câu trả lời Gemini để hiển thị dễ đọc
function formatAnswer(answer) {
  return (
    answer
      // Giữ nguyên các dấu * * (bold)
      .replace(/\*\*/g, "**")
      // Chỉ thêm 1 dòng trống giữa các đoạn dài (tránh vỡ layout)
      .replace(/([.!?])\s+/g, "$1 ") // bỏ xuống dòng sau dấu chấm
      .replace(/(\*\*[^\*]+\*\*)/g, "\n$1\n") // chỉ xuống dòng quanh tiêu đề
      .replace(/\n{3,}/g, "\n\n") // tránh quá nhiều dòng trống
      .trim()
  );
}

// 🤖 Cách 3: Gọi Gemini và hạn chế nó “đoán bừa”
async function callGemini(question, context) {
    const prompt = `
    Bạn là chuyên gia nông nghiệp, chuyên chẩn đoán bệnh cây trồng.
    Hãy phân tích kỹ triệu chứng và thông tin trong context để xác định bệnh phù hợp nhất.
    ⚠️ Lưu ý:
    - Nếu context có chứa tên bệnh, CHỈ được chẩn đoán theo bệnh đó, không được tự suy đoán bệnh khác.
    - Nếu context trống, trả lời: "Xin lỗi, tôi chưa có đủ thông tin."

    ────────────────────────────
    📚 Context:
    ${context}
    ────────────────────────────
    ❓ Câu hỏi của nông dân: ${question}
    ────────────────────────────
    💬 Câu trả lời (hãy viết chi tiết và có cấu trúc rõ ràng):
    **Chẩn đoán bệnh:** Nêu tên bệnh chính xác.
    **Giải thích:** Phân tích vì sao bệnh đó phù hợp với triệu chứng.
    **Khuyến nghị:** Hướng dẫn biện pháp xử lý, thuốc nên dùng và cách phòng ngừa.
    `;


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("🔥 Lỗi Gemini:", data);
    throw new Error(data.error?.message || "Gemini API error");
  }

  const rawAnswer =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Không có phản hồi từ Gemini.";

  return formatAnswer(rawAnswer);
}

// 🚀 Hàm chính chatbot
async function askAdvancedChatbot(userInput) {
  if (!userInput || !userInput.trim())
    return "⚠️ Vui lòng nhập triệu chứng.";

  try {
    const context = await retrieveContext(userInput);
    const answer = await callGemini(userInput, context);
    return answer;
  } catch (error) {
    console.error("🔥 Lỗi xử lý chatbot:", error);
    return "⚠️ Hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.";
  }
}

module.exports = { askAdvancedChatbot };
