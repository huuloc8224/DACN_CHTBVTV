const mongoose = require('mongoose');
const KnowledgeBase = require('./models/KnowledgeBase');

const MONGO_URI = 'mongodb://127.0.0.1:27017/pbtv_db';

const data = [
    {
        topic: "Đạo ôn",
        crop: "Lúa",
        symptoms: ["Đốm hình thoi", "Cháy lá", "Lúa sinh trưởng kém"],
        severity: "Nặng",
        treatment_recommendations: "Phun thuốc trừ đạo ôn đúng liều, bón phân cân đối, không bón thừa đạm"
    },
    {
        topic: "Đạo ôn cổ bông",
        crop: "Lúa",
        symptoms: ["Cổ bông bị thối", "Hạt lép nhiều"],
        severity: "Rất nặng",
        treatment_recommendations: "Phun thuốc phòng trước trổ, giữ ruộng thông thoáng"
    },
    {
        topic: "Khô vằn",
        crop: "Lúa",
        symptoms: ["Vết loang hình vằn", "Thân lúa khô"],
        severity: "Trung bình",
        treatment_recommendations: "Giảm mật độ gieo sạ, phun thuốc đặc trị khô vằn"
    },
    {
        topic: "Rầy nâu",
        crop: "Lúa",
        symptoms: ["Lúa vàng", "Cháy rầy", "Rầy tập trung gốc"],
        severity: "Nặng",
        treatment_recommendations: "Phun thuốc trừ rầy, không lạm dụng thuốc"
    },
    {
        topic: "Sâu cuốn lá",
        crop: "Lúa",
        symptoms: ["Lá cuốn lại", "Lá bị ăn"],
        severity: "Nhẹ",
        treatment_recommendations: "Phun thuốc khi mật độ sâu cao"
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected MongoDB");

        await KnowledgeBase.deleteMany({});
        console.log("🧹 Đã xóa dữ liệu cũ");

        await KnowledgeBase.insertMany(data, { ordered: false });
        console.log("🌱 Seed dữ liệu thành công");

        process.exit();
    } catch (err) {
        console.error("❌ Seed lỗi:", err);
        process.exit(1);
    }
}

seed();
