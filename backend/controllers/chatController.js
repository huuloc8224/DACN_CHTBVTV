const ChatSession = require('../models/ChatSession');
const KnowledgeBase = require('../models/KnowledgeBase');
const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/*GEMINI */
let gemini = null;
if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

const askGemini = async (prompt) => {
  if (!gemini) return null;
  try {
    const r = await gemini.generateContent(prompt);
    return r?.response?.text() || null;
  } catch {
    return null;
  }
};

/*UTIL*/
const normalize = (t = '') =>
  t.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

/*NHẬN DIỆN*/
const isGreeting = (t) =>
  /^(chao|chao bac|chao ba|xin chao|hello|hi|alo|bac oi|ba oi|chao a|chao anh|chao chi)$/i.test(t);

const isSmallTalk = (t) =>
  /(khoe khong|co khoe khong|met khong|an com chua|dang lam gi|hom nay sao roi|ruong dong sao roi)/i.test(t);

const isWeatherQuestion = (t) =>
  /(thoi tiet|du bao thoi tiet|nhiet do|troi mua|troi nang|co mua khong|ap thap|bao|gio manh|do am|ngay mai|hom nay troi|toi nay|sang mai)/i.test(t);

/* match triệu chứng */
const keywordMatch = (symptom, message) => {
  const sWords = normalize(symptom).split(' ');
  const mWords = normalize(message).split(' ');
  return sWords.some(w => w.length >= 3 && mWords.includes(w));
};

/* match tên bệnh */
const diseaseNameMatch = (name, message) => {
  const dWords = normalize(name).split(' ');
  const mWords = normalize(message).split(' ');
  return dWords.some(w => w.length >= 3 && mWords.includes(w));
};

/*POST /api/chat/ask*/
const chatController = async (req, res) => {
  try {
    const { userId, sessionId, message } = req.body;
    if (!userId || !message) {
      return res.json({
        answer: 'Bà con cứ nói tự nhiên, bác Ba Lúa đang nghe đây 🌾',
        isDiagnosis: false
      });
    }

    /*SESSION*/
    let session = sessionId ? await ChatSession.findById(sessionId) : null;
    if (!session) {
      session = await ChatSession.create({
        userId,
        title: 'Tư vấn mới',
        messages: []
      });
    }

    session.messages.push({ role: 'user', text: message });
    const normText = normalize(message);


    if (isWeatherQuestion(normText)) {
      const reply =
        (await askGemini(
          `Bạn là Bác Ba Lúa, giọng miền Nam.
Người dùng hỏi thời tiết: "${message}".
Trả lời đúng câu hỏi, ngắn gọn, thân thiện.`
        )) ||
        'Bác chưa coi được thời tiết chỗ đó, bà con nói rõ địa điểm giúp bác nha.';

      session.messages.push({ role: 'bot', text: reply });
      await session.save();

      return res.json({
        sessionId: session._id.toString(),
        answer: reply,
        isDiagnosis: false
      });
    }

    /*CHÀO HỎI*/
    if (isGreeting(normText) || isSmallTalk(normText)) {
      const reply =
        (await askGemini(
          `Bạn là Bác Ba Lúa, nói chuyện thân thiện, giọng miền Nam.
Người dùng nói: "${message}"`
        )) ||
        'Dạ bác đang nghe đây, bà con cứ nói tiếp nha 🌾';

      session.messages.push({ role: 'bot', text: reply });
      await session.save();

      return res.json({
        sessionId: session._id.toString(),
        answer: reply,
        isDiagnosis: false
      });
    }

    /*CHẨN ĐOÁN BỆNH*/
    const kbList = await KnowledgeBase.find({})
      .populate('recommendedProducts')
      .lean();

    let best = null;
    let bestScore = 0;

    for (const kb of kbList) {
      let score = 0;

      if (diseaseNameMatch(kb.diseaseName, message)) score += 5;

      for (const s of kb.symptoms || []) {
        if (keywordMatch(s, message)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        best = kb;
      }
    }

    if (best && bestScore > 0) {
      let products = [];

      if (best.recommendedProducts?.length > 0) {
        products = best.recommendedProducts;
      } else {
        products = await Product.find({
          category: 'thuoc',
          activeIngredients: { $in: best.activeIngredients || [] }
        }).limit(5).lean();
      }

      const prompt = `
        Bạn là Bác Ba Lúa, giọng miền Nam.
        Viết ngắn gọn, dễ hiểu, chia đoạn rõ ràng.
        Không dùng dấu sao.

        Tên bệnh: ${best.diseaseName}
        Triệu chứng: ${best.symptoms.slice(0, 3).join(', ')}
        Hoạt chất: ${best.activeIngredients.join(', ')}
        Hướng xử lý: ${best.treatmentGuide}
        Phòng ngừa: ${best.prevention}
      `;

      const answer =
        (await askGemini(prompt)) ||
        `Theo mô tả, bác nghi lúa đang bị ${best.diseaseName}.

        Triệu chứng thường thấy là ${best.symptoms.slice(0, 3).join(', ')}.

        Bà con nên xử lý sớm bằng thuốc có hoạt chất ${best.activeIngredients.join(', ')}.

        Giữ ruộng thông thoáng, hạn chế bón thừa đạm để bệnh mau dứt.`;

      session.title = best.diseaseName;
      session.disease = best.diseaseName;
      session.suggestedProducts = products.map(p => p._id);
      session.messages.push({ role: 'bot', text: answer });
      await session.save();

      return res.json({
        sessionId: session._id.toString(),
        answer,
        disease: best.diseaseName,
        products,
        isDiagnosis: true
      });
    }

    /*KHÔNG XÁC ĐỊNH*/
    const notFound =
      'Bác chưa bắt được bệnh rõ ràng. Bà con mô tả thêm giúp bác nha, ví dụ lá bị sao, màu gì, lan nhanh hông 🌱';

    session.messages.push({ role: 'bot', text: notFound });
    await session.save();

    return res.json({
      sessionId: session._id.toString(),
      answer: notFound,
      isDiagnosis: false
    });

  } catch (err) {
    console.error('CHAT ERROR:', err);
    return res.json({
      answer: 'Bác Ba Lúa hơi mệt 😅 bà con hỏi lại giúp bác nha!',
      isDiagnosis: false
    });
  }
};

/*Lịch sử*/
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .populate('suggestedProducts')
      .lean();

    return res.json(
      sessions.map(s => ({ ...s, _id: s._id.toString() }))
    );
  } catch {
    return res.json([]);
  }
};

module.exports = { chatController, getChatHistory };
