
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const KnowledgeBase = require('../models/KnowledgeBase');

dotenv.config({ path: './backend/.env' });

const knowledgeData = [
    {
        topic: "Bệnh đạo ôn (Cháy lá)",
        crop: "lúa",
        symptoms: [
            "vết bệnh hình thoi",
            "tâm màu xám trắng",
            "viền nâu",
            "vết bệnh lớn có thể làm gãy lá",
            "bệnh nặng gây cháy khô ruộng"
        ],
        severity: "cao",
        treatment_recommendations: "Sử dụng các loại thuốc đặc trị có hoạt chất Tricyclazole (ví dụ: Beam 75WP) hoặc Isoprothiolane. Phun khi bệnh mới chớm xuất hiện."
    },
    {
        topic: "Bệnh bạc lá do vi khuẩn",
        crop: "lúa",
        symptoms: [
            "vết bệnh ở mép lá",
            "lan dần vào trong tạo thành các mảng lớn màu vàng xám",
            "buổi sáng có dịch vi khuẩn trắng đục",
            "xuất hiện khi trời mưa bão, độ ẩm cao"
        ],
        severity: "trung bình",
        treatment_recommendations: "Dùng thuốc gốc Đồng (Copper Hydroxide) hoặc Kasugamycin. Dừng bón đạm và giữ khô ruộng."
    },
    {
        topic: "Rầy nâu",
        crop: "lúa",
        symptoms: [
            "rầy tập trung ở gốc lúa",
            "chích hút nhựa làm cây vàng úa, khô héo",
            "mật độ cao có thể lây lan nhanh"
        ],
        severity: "cao",
        treatment_recommendations: "Dùng thuốc đặc trị rầy có hoạt chất Pymetrozine (Chess 50WG) hoặc Imidacloprid (Confidor). Phun tập trung vào gốc lúa."
    },
    {
        topic: "Bệnh vàng lá chét",
        crop: "lúa",
        symptoms: [
            "lá non chuyển màu vàng nhạt",
            "lá già vẫn xanh",
            "rễ kém phát triển"
        ],
        severity: "trung bình",
        treatment_recommendations: "Bón đủ phân đa lượng, đặc biệt là Nitrogen và Kẽm. Sử dụng giống kháng bệnh nếu có."
    },
    {
        topic: "Bệnh sương mai (Bắp, cà chua)",
        crop: "cà chua",
        symptoms: [
            "vết bệnh dạng đốm nâu đen trên lá",
            "trên mặt dưới lá có lớp nấm màu xám trắng",
            "lá bị xoăn và rụng sớm"
        ],
        severity: "cao",
        treatment_recommendations: "Phun fungicide chứa Mancozeb hoặc Metalaxyl. Quản lý độ ẩm và thoát nước tốt."
    },
    {
        topic: "Bệnh đốm lá Alternaria",
        crop: "bắp",
        symptoms: [
            "vết bệnh hình tròn, tâm nâu, viền vàng",
            "lá già bị hư hại nhiều hơn lá non",
            "bệnh phát triển mạnh khi ẩm độ cao"
        ],
        severity: "trung bình",
        treatment_recommendations: "Phun thuốc chứa Mancozeb, Azoxystrobin. Loại bỏ lá bệnh để hạn chế lây lan."
    },
    {
        topic: "Rầy mềm (Bắp)",
        crop: "bắp",
        symptoms: [
            "rầy xuất hiện ở ngọn và lá non",
            "chích hút nhựa làm cây còi cọc",
            "mật độ cao gây vàng lá"
        ],
        severity: "cao",
        treatment_recommendations: "Sử dụng Imidacloprid hoặc Pymetrozine. Phun vào sáng sớm hoặc chiều mát."
    },
    {
        topic: "Bệnh thán thư (Đậu tương)",
        crop: "đậu tương",
        symptoms: [
            "đốm nâu sậm trên lá, tâm màu xám",
            "lá khô dần từ mép vào trong",
            "bệnh lan nhanh khi ẩm độ cao"
        ],
        severity: "trung bình",
        treatment_recommendations: "Phun fungicide chứa Mancozeb hoặc Chlorothalonil. Dọn vệ sinh đồng ruộng."
    },
    {
        topic: "Bệnh sương mai hại khoai tây",
        crop: "khoai tây",
        symptoms: [
            "lá xuất hiện đốm nâu ẩm ướt",
            "mặt dưới lá có nấm màu xám",
            "thân và củ bị thối khi bệnh nặng"
        ],
        severity: "cao",
        treatment_recommendations: "Phun fungicide chứa Metalaxyl hoặc Mancozeb. Tránh tưới nước quá nhiều và đảm bảo thoát nước tốt."
    },
    {
        topic: "Bệnh đốm nâu lá cà phê",
        crop: "cà phê",
        symptoms: [
            "vết bệnh hình tròn, màu nâu",
            "lá già bị rụng trước lá non",
            "bệnh nặng làm giảm năng suất"
        ],
        severity: "trung bình",
        treatment_recommendations: "Phun fungicide chứa Copper Hydroxide hoặc Mancozeb. Loại bỏ lá bệnh và kiểm soát độ ẩm."
    }
];

const importData = async () => {
    try {
        await connectDB();
        await KnowledgeBase.deleteMany();
        await KnowledgeBase.insertMany(knowledgeData);
        console.log('✅ Dữ liệu Kiến thức RAG đã được nạp thành công!');
        process.exit();
    } catch (error) {
        console.error('❌ Lỗi nạp dữ liệu RAG:', error);
        process.exit(1);
    }
};

importData();
