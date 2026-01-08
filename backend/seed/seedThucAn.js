// seed/seedThucAn.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Chưa có MONGODB_URI trong file .env');
  process.exit(1);
}

const seedThucAn = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    await Product.deleteMany({ category: 'thucan' });

    await Product.insertMany([
      {
        name: 'Cám heo con tập ăn',
        description: 'Thức ăn hỗn hợp cho heo con giai đoạn tập ăn.',
        price: 320000,
        activeIngredients: ['Đạm', 'Tinh bột', 'Khoáng'],
        stock_quantity: 200,
        category: 'thucan',
        treats: ['Heo con']
      },
      {
        name: 'Cám heo thịt tăng trọng',
        description: 'Giúp heo lớn nhanh, tăng trọng đều.',
        price: 290000,
        activeIngredients: ['Đạm', 'Năng lượng'],
        stock_quantity: 250,
        category: 'thucan',
        treats: ['Heo thịt']
      },
      {
        name: 'Cám heo nái nuôi con',
        description: 'Bổ sung dinh dưỡng cho heo nái đang nuôi con.',
        price: 340000,
        activeIngredients: ['Đạm', 'Canxi', 'Khoáng'],
        stock_quantity: 180,
        category: 'thucan',
        treats: ['Heo nái']
      },
      {
        name: 'Cám gà con từ 1–21 ngày',
        description: 'Thức ăn cho gà con giúp phát triển đồng đều.',
        price: 270000,
        activeIngredients: ['Đạm', 'Vitamin'],
        stock_quantity: 220,
        category: 'thucan',
        treats: ['Gà con']
      },
      {
        name: 'Cám gà thịt tăng trưởng',
        description: 'Giúp gà thịt lớn nhanh, chắc thịt.',
        price: 260000,
        activeIngredients: ['Đạm', 'Tinh bột'],
        stock_quantity: 300,
        category: 'thucan',
        treats: ['Gà thịt']
      },
      {
        name: 'Cám gà đẻ trứng',
        description: 'Giúp gà đẻ đều, trứng to vỏ dày.',
        price: 280000,
        activeIngredients: ['Canxi', 'Đạm'],
        stock_quantity: 240,
        category: 'thucan',
        treats: ['Gà đẻ']
      },
      {
        name: 'Thức ăn vịt con',
        description: 'Thức ăn cho vịt con khỏe mạnh, mau lớn.',
        price: 260000,
        activeIngredients: ['Đạm', 'Vitamin'],
        stock_quantity: 210,
        category: 'thucan',
        treats: ['Vịt con']
      },
      {
        name: 'Thức ăn vịt thịt',
        description: 'Giúp vịt tăng trọng nhanh, ít hao thức ăn.',
        price: 250000,
        activeIngredients: ['Đạm', 'Năng lượng'],
        stock_quantity: 260,
        category: 'thucan',
        treats: ['Vịt thịt']
      },
      {
        name: 'Thức ăn vịt đẻ trứng',
        description: 'Giúp vịt đẻ trứng đều, trứng chắc.',
        price: 275000,
        activeIngredients: ['Canxi', 'Khoáng'],
        stock_quantity: 230,
        category: 'thucan',
        treats: ['Vịt đẻ']
      },
      {
        name: 'Cám cá tra giai đoạn nhỏ',
        description: 'Thức ăn cho cá tra con mau lớn.',
        price: 360000,
        activeIngredients: ['Đạm cá', 'Khoáng'],
        stock_quantity: 200,
        category: 'thucan',
        treats: ['Cá tra']
      },
      {
        name: 'Cám cá tra tăng trưởng',
        description: 'Giúp cá tra tăng trọng nhanh, thịt săn.',
        price: 350000,
        activeIngredients: ['Đạm', 'Năng lượng'],
        stock_quantity: 220,
        category: 'thucan',
        treats: ['Cá tra']
      },
      {
        name: 'Thức ăn cá rô phi',
        description: 'Phù hợp cho cá rô phi nuôi ao.',
        price: 330000,
        activeIngredients: ['Đạm thực vật'],
        stock_quantity: 210,
        category: 'thucan',
        treats: ['Cá rô phi']
      },
      {
        name: 'Thức ăn tôm thẻ chân trắng',
        description: 'Giúp tôm lớn nhanh, hạn chế hao hụt.',
        price: 420000,
        activeIngredients: ['Đạm', 'Khoáng'],
        stock_quantity: 180,
        category: 'thucan',
        treats: ['Tôm']
      },
      {
        name: 'Thức ăn bò thịt',
        description: 'Bổ sung năng lượng cho bò thịt.',
        price: 310000,
        activeIngredients: ['Xơ', 'Tinh bột'],
        stock_quantity: 190,
        category: 'thucan',
        treats: ['Bò thịt']
      },
      {
        name: 'Thức ăn dê cừu',
        description: 'Giúp dê cừu khỏe mạnh, tăng trọng ổn định.',
        price: 300000,
        activeIngredients: ['Xơ', 'Khoáng'],
        stock_quantity: 170,
        category: 'thucan',
        treats: ['Dê', 'Cừu']
      }
    ]);

    console.log('🐷🐔🐟 Seed THỨC ĂN CHĂN NUÔI thành công (15 sản phẩm)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed thức ăn lỗi:', err);
    process.exit(1);
  }
};

seedThucAn();
