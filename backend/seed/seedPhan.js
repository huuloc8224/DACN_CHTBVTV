// seed/seedPhan.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Chưa có MONGODB_URI trong file .env');
  process.exit(1);
}

const seedPhan = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa phân bón cũ
    await Product.deleteMany({ category: 'phan' });

    await Product.insertMany([
      {
        name: 'NPK 16-16-8 – Bón lót lúa',
        description: 'Phân NPK dùng bón lót giúp lúa bén rễ, hồi xanh nhanh.',
        price: 320000,
        activeIngredients: ['N', 'P', 'K'],
        stock_quantity: 200,
        category: 'phan',
        treats: ['Bón lót']
      },
      {
        name: 'DAP 18-46 – Kích rễ lúa',
        description: 'Giúp rễ phát triển mạnh, cây cứng khỏe.',
        price: 360000,
        activeIngredients: ['N', 'P'],
        stock_quantity: 180,
        category: 'phan',
        treats: ['Kích rễ']
      },
      {
        name: 'Ure – Thúc đẻ nhánh lúa',
        description: 'Cung cấp đạm giúp lúa đẻ nhánh mạnh.',
        price: 290000,
        activeIngredients: ['N'],
        stock_quantity: 250,
        category: 'phan',
        treats: ['Đẻ nhánh']
      },
      {
        name: 'NPK 20-20-15 – Thúc đẻ nhánh',
        description: 'Giúp lúa sinh trưởng mạnh giai đoạn đẻ nhánh.',
        price: 350000,
        activeIngredients: ['N', 'P', 'K'],
        stock_quantity: 200,
        category: 'phan',
        treats: ['Đẻ nhánh']
      },
      {
        name: 'Kali Clorua – Cứng cây lúa',
        description: 'Giúp thân lúa cứng, hạn chế đổ ngã.',
        price: 310000,
        activeIngredients: ['K'],
        stock_quantity: 170,
        category: 'phan',
        treats: ['Cứng cây']
      },
      {
        name: 'NPK 15-5-20 – Nuôi đòng',
        description: 'Giúp đòng phát triển đều, chắc.',
        price: 340000,
        activeIngredients: ['N', 'P', 'K'],
        stock_quantity: 160,
        category: 'phan',
        treats: ['Nuôi đòng']
      },
      {
        name: 'Canxi Bo – Chống lép hạt',
        description: 'Bổ sung canxi và bo, giảm lép hạt.',
        price: 280000,
        activeIngredients: ['Ca', 'Bo'],
        stock_quantity: 150,
        category: 'phan',
        treats: ['Chống lép hạt']
      },
      {
        name: 'Silic – Cứng lá lúa',
        description: 'Giúp lá dày, cứng, hạn chế sâu bệnh.',
        price: 300000,
        activeIngredients: ['Si'],
        stock_quantity: 140,
        category: 'phan',
        treats: ['Cứng lá']
      },
      {
        name: 'Trung vi lượng tổng hợp – Phục hồi lúa',
        description: 'Giúp lúa phục hồi sau ngập, phun thuốc.',
        price: 260000,
        activeIngredients: ['Ca', 'Mg', 'Zn'],
        stock_quantity: 130,
        category: 'phan',
        treats: ['Phục hồi cây']
      },
      {
        name: 'Phân hữu cơ vi sinh – Cải tạo đất',
        description: 'Cải tạo đất, tăng độ phì nhiêu.',
        price: 240000,
        activeIngredients: ['Hữu cơ', 'Vi sinh'],
        stock_quantity: 300,
        category: 'phan',
        treats: ['Cải tạo đất']
      },
      {
        name: 'Humic – Kích thích sinh trưởng',
        description: 'Giúp rễ khỏe, cây phát triển nhanh.',
        price: 270000,
        activeIngredients: ['Humic'],
        stock_quantity: 160,
        category: 'phan',
        treats: ['Kích thích sinh trưởng']
      },
      {
        name: 'Amino Acid – Giải độc lúa',
        description: 'Giải độc thuốc, giúp lúa phục hồi nhanh.',
        price: 290000,
        activeIngredients: ['Amino Acid'],
        stock_quantity: 140,
        category: 'phan',
        treats: ['Giải độc']
      },
      {
        name: 'Bo Kẽm – Chắc hạt lúa',
        description: 'Giúp hạt chắc, tăng năng suất.',
        price: 260000,
        activeIngredients: ['Bo', 'Zn'],
        stock_quantity: 150,
        category: 'phan',
        treats: ['Chắc hạt']
      },
      {
        name: 'NPK 12-12-17 – Giai đoạn làm đòng',
        description: 'Phù hợp giai đoạn làm đòng – trổ.',
        price: 330000,
        activeIngredients: ['N', 'P', 'K'],
        stock_quantity: 180,
        category: 'phan',
        treats: ['Làm đòng']
      },
      {
        name: 'Phân bón lá tổng hợp – Tăng năng suất',
        description: 'Phun qua lá giúp lúa khỏe, tăng năng suất.',
        price: 250000,
        activeIngredients: ['N', 'P', 'K', 'Vi lượng'],
        stock_quantity: 200,
        category: 'phan',
        treats: ['Tăng năng suất']
      }
    ]);

    console.log('🌾 Seed phân bón thành công (15 sản phẩm, không trùng)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed phân bón lỗi:', err);
    process.exit(1);
  }
};

seedPhan();
