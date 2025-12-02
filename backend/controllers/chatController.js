// backend/controllers/chatController.js ← DÁN ĐÈ TOÀN BỘ – BẢN CUỐI CÙNG HOÀN HẢO NHẤT!
require("dotenv").config();
const KnowledgeBase = require("../models/KnowledgeBase");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const VN_STOPWORDS = new Set([
  "la","bi","dang","bi","bi","cay","lua","dau","thay","co","bi","nhu","la","la","la",
  "trieu","chung","cua","toi","nay","kia","do","va","ma","thi","la","o","tren","duoi",
  "qua","noi","ke","noi","la","gi","chi","mot","nhieu","phan","khuc","cho"
]);

const normalize = (t) => {
  return t.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[.,!?;:“”'"()]/g, " ")
    .toLowerCase()
    .trim();
};

const extractKeywords = (text) => {
  const cleaned = normalize(text);
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2 && !VN_STOPWORDS.has(w));
  return [...new Set(words)];
};

const scoreDisease = (disease, keywords) => {
  let score = 0;

  const symp = Array.isArray(disease.symptoms)
    ? disease.symptoms.join(" ").toLowerCase()
    : String(disease.symptoms || "").toLowerCase();

  const topic = String(disease.topic || "").toLowerCase();
  const treat = String(disease.treatment_recommendations || "").toLowerCase();

  keywords.forEach(k => {
    const r = new RegExp(`\\b${k}\\b`, "i");
    if (r.test(symp)) score += 3;
    if (r.test(topic)) score += 2;
    if (r.test(treat)) score += 1;
  });

  return score;
};

const searchBestDisease = async (keywords) => {
  if (!keywords.length) return null;

  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(escaped.join("|"), "i");

  const candidates = await KnowledgeBase.find({
    crop: "Lúa",
    $or: [
      { symptoms: { $elemMatch: { $regex: regex } } },
      { topic: { $regex: regex } },
      { treatment_recommendations: { $regex: regex } }
    ]
  });

  if (!candidates.length) return null;

  let best = null;
  let maxScore = 0;

  candidates.forEach(c => {
    const s = scoreDisease(c, keywords);
    if (s > maxScore) {
      maxScore = s;
      best = c;
    }
  });

  if (maxScore === 0) return null;

  return best;
};

exports.askChatbot = async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history) || !history.length) {
      return res.status(400).json({ answer: "Bà con hỏi gì bác nghe không rõ nghen!" });
    }

    const last = [...history].reverse().find(m => m.role === "user");
    const userText = last?.parts?.find(p => p.text)?.text || "";

    if (history.length === 1 && /^(hi|hello|chao|alo|bac|bac oi)/i.test(normalize(userText))) {
      return res.json({
        answer:
          "Chào bà con! Bác Ba Lúa đây. Cây có gì lạ gửi ảnh hoặc kể triệu chứng, bác chỉ bệnh liền nghen!\n\nChúc bà con mùa màng trúng mùa!"
      });
    }

    const keywords = extractKeywords(userText);

    const disease = await searchBestDisease(keywords);

    if (!disease) {
      return res.json({
        answer:
          "Bác tra hết kho mà chưa thấy khớp bệnh nào rõ ràng. Bà con gửi thêm ảnh hoặc mô tả kỹ hơn nghen!\n\nChúc bà con mùa màng bội thu!"
      });
    }

    const answer =
      `Ờ rồi, bác xem kỹ rồi, bệnh này đây:\n\n` +
      `Bệnh: ${disease.topic}\n` +
      `Triệu chứng: ${Array.isArray(disease.symptoms) ? disease.symptoms.join(", ") : disease.symptoms}\n` +
      `Cách xử lý: ${disease.treatment_recommendations}\n` +
      (Array.isArray(disease.active_ingredients) && disease.active_ingredients.length
        ? `Hoạt chất: ${disease.active_ingredients.join(", ")}\n`
        : "") +
      `\nBà con xử lý sớm cho lúa khỏe, chắc hạt nghen!\n\nChúc bà con mùa màng thắng lớn!`;

    res.json({ answer });
  } catch (err) {
    console.error("Lỗi chatbot:", err.message);
    res.status(500).json({
      answer: "Ui mạng yếu quá, bà con gửi lại giúp bác nghen!"
    });
  }
};
