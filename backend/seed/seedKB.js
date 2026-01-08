// backend/seed/seedKB.js
const mongoose = require('mongoose');
const KnowledgeBase = require('../models/KnowledgeBase');
const { connectDB } = require('../config/db'); // Đường dẫn đến file db.js của bạn

const kbData = [
  {
    diseaseName: "Bệnh đạo ôn lá lúa",
    symptoms: [
      "đốm hình thoi",
      "vết bệnh hình thoi",
      "viền nâu đỏ",
      "giữa vết xám trắng",
      "lem lép hạt",
      "cháy lá",
      "vết bệnh lan rộng nhanh",
      "lá cháy từ chóp xuống"
    ],
    activeIngredients: [
      "Tricyclazole",
      "Azoxystrobin",
      "Isoprothiolane",
      "Propiconazole",
      "Tebuconazole",
      "Picoxystrobin",
      "Difenoconazole"
    ],
    description: "Bệnh nguy hiểm nhất trên lúa, do nấm Pyricularia oryzae gây ra, phát triển mạnh trong điều kiện ẩm ướt, bón thừa đạm.",
    causes: "Nấm Pyricularia oryzae, mưa nhiều, sương mù, bón thừa đạm, giống cảm bệnh.",
    prevention: "Chọn giống kháng bệnh, bón phân cân đối (giảm đạm), vệ sinh đồng ruộng, tiêu hủy tàn dư.",
    treatmentGuide: "Phun thuốc ngay khi phát hiện vết bệnh đầu tiên. Phun ướt đều 2 mặt lá, phun lần 2 cách lần 1 7-10 ngày. Tránh phun khi trời mưa."
  },
  {
    diseaseName: "Rệp sáp hại lúa",
    symptoms: [
      "rệp trắng bám gốc",
      "rệp chích hút nhựa",
      "lá xoăn",
      "cháy bìa lá",
      "cây còi cọc",
      "bụi rệp trắng ở bẹ lá",
      "truyền virus gây bệnh vàng lùn"
    ],
    activeIngredients: [
      "Imidacloprid",
      "Dinotefuran",
      "Pymetrozine",
      "Buprofezin",
      "Thiamethoxam",
      "Clothianidin"
    ],
    description: "Rệp hại chích hút nhựa cây, truyền virus, gây giảm năng suất nghiêm trọng.",
    causes: "Rệp di cư từ cỏ dại, thời tiết nóng ẩm, ruộng dày.",
    prevention: "Dọn sạch cỏ dại ven bờ, thả thiên địch (bọ rùa), thăm ruộng thường xuyên.",
    treatmentGuide: "Phun thuốc nội hấp mạnh, phun kỹ gốc cây và mặt dưới lá. Phun vào buổi sáng sớm hoặc chiều mát."
  },
  {
    diseaseName: "Sâu cuốn lá lúa",
    symptoms: [
      "lá bị cuốn lại thành ống",
      "sâu non bên trong lá cuốn",
      "lá bị cào xước",
      "giảm diện tích quang hợp",
      "lá cuốn dọc theo gân"
    ],
    activeIngredients: [
      "Chlorantraniliprole",
      "Emamectin benzoate",
      "Cartap",
      "Lufenuron",
      "Indoxacarb",
      "Spinosad"
    ],
    description: "Sâu non ăn biểu bì lá, cuốn lá làm tổ, gây giảm năng suất.",
    causes: "Sâu trưởng thành đẻ trứng trên lá, sâu non tuổi nhỏ gây hại nặng.",
    prevention: "Cày vùi gốc rạ sau thu hoạch, thả thiên địch, sử dụng bẫy đèn.",
    treatmentGuide: "Phun khi sâu tuổi 1-2 (mới cuốn lá), dùng thuốc nội hấp hoặc tiếp xúc mạnh."
  },
  {
    diseaseName: "Bệnh khô vằn",
    symptoms: [
      "vết bệnh hình vằn nâu",
      "vệt vằn lan từ gốc lên",
      "gốc cây thối",
      "cây đổ ngã",
      "vết bệnh có viền rõ",
      "vằn trắng xám ở giữa"
    ],
    activeIngredients: [
      "Validamycin",
      "Jinggangmycin",
      "Hexaconazole",
      "Propiconazole",
      "Tebuconazole"
    ],
    description: "Bệnh do nấm Rhizoctonia solani gây ra, hại nặng ở giai đoạn lúa đẻ nhánh.",
    causes: "Nấm tồn tại trong đất, thời tiết mát mẻ, ẩm cao, ruộng thoát nước kém.",
    prevention: "Luân canh cây trồng, thoát nước tốt, bón vôi cải tạo đất chua.",
    treatmentGuide: "Phun thuốc gốc khi bệnh chớm xuất hiện, phun kỹ phần gốc cây."
  },
  {
    diseaseName: "Bệnh bạc lá (cháy bìa lá)",
    symptoms: [
      "lá bạc màu",
      "cháy bìa lá",
      "vết bệnh lan từ bìa vào",
      "lá xoăn",
      "cây còi cọc",
      "vết bệnh màu nâu cam"
    ],
    activeIngredients: [
      "Kasugamycin",
      "Copper compounds (Đồng)",
      "Streptomycin",
      "Oxolinic acid"
    ],
    description: "Bệnh do vi khuẩn Xanthomonas oryzae gây ra, thường kết hợp thiếu kali.",
    causes: "Vi khuẩn xâm nhập qua vết thương, gió mưa mạnh, thiếu kali.",
    prevention: "Bón đủ kali, thoát nước tốt, chọn giống kháng.",
    treatmentGuide: "Phun thuốc diệt khuẩn kết hợp bổ sung phân kali qua lá."
  },
  {
    diseaseName: "Bệnh vàng lùn và lùn xoắn lá",
    symptoms: [
      "cây lúa lùn bất thường",
      "lá xoắn lại",
      "lá vàng cam",
      "cây không trỗ",
      "bông nhỏ lép"
    ],
    activeIngredients: [
      "Imidacloprid",
      "Dinotefuran",
      "Thiamethoxam"
    ],
    description: "Bệnh virus do rệp hại truyền, không chữa được, chỉ phòng bằng diệt rệp.",
    causes: "Virus do rệp sáp truyền từ cây bệnh sang cây khỏe.",
    prevention: "Diệt rệp vector triệt để, sử dụng giống kháng, né vụ gieo sạ.",
    treatmentGuide: "Không có thuốc chữa virus. Chỉ diệt rệp và nhổ bỏ cây bệnh."
  },
  {
    diseaseName: "Bệnh đốm vằn",
    symptoms: [
      "vết đốm nâu có viền vàng",
      "đốm nhỏ lan rộng",
      "lá vàng úa",
      "vết bệnh hình bầu dục"
    ],
    activeIngredients: [
      "Mancozeb",
      "Propineb",
      "Chlorothalonil"
    ],
    description: "Bệnh nấm phổ biến trên lá lúa giai đoạn đẻ nhánh.",
    causes: "Nấm Alternaria, thời tiết ẩm.",
    prevention: "Bón phân cân đối, thông thoáng ruộng.",
    treatmentGuide: "Phun thuốc tiếp xúc bảo vệ khi thời tiết thuận lợi cho bệnh."
  }
];

const seedKB = async () => {
  try {
    await connectDB(); // Kết nối DB
    console.log('Đang seed KnowledgeBase...');

    for (const item of kbData) {
      await KnowledgeBase.findOneAndUpdate(
        { diseaseName: item.diseaseName },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('✅ Seed KnowledgeBase thành công với 7 bệnh phổ biến!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed KB:', err);
    process.exit(1);
  }
};

seedKB();