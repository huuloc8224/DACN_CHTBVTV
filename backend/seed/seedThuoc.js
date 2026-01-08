// seed/seedThuoc.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Chưa có MONGODB_URI trong file .env');
  process.exit(1);
}

const seedThuoc = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    await Product.insertMany([
      {
        name: 'Chlorothalonil – Trị đốm nâu lúa',
        description: 'Đặc trị bệnh đốm nâu trên lá lúa.',
        price: 99000,
        activeIngredients: ['Chlorothalonil'],
        stock_quantity: 100,
        category: 'thuoc',
        treats: ['Bệnh đốm nâu']
      },
      {
        name: 'Chlorothalonil – Phòng cháy lá lúa',
        description: 'Phòng trừ bệnh cháy lá, đốm lá do nấm.',
        price: 102000,
        activeIngredients: ['Chlorothalonil'],
        stock_quantity: 90,
        category: 'thuoc',
        treats: ['Bệnh cháy lá']
      },
      {
        name: 'Tricyclazole 75WP – Trị đạo ôn lá',
        description: 'Đặc trị bệnh đạo ôn lá lúa.',
        price: 120000,
        activeIngredients: ['Tricyclazole'],
        stock_quantity: 100,
        category: 'thuoc',
        treats: ['Bệnh đạo ôn lá lúa']
      },
      {
        name: 'Tricyclazole – Trị lem lép hạt',
        description: 'Phòng trị lem lép hạt do nấm đạo ôn.',
        price: 125000,
        activeIngredients: ['Tricyclazole'],
        stock_quantity: 85,
        category: 'thuoc',
        treats: ['Bệnh lem lép hạt']
      },
      {
        name: 'Kasugamycin – Trị bạc lá lúa',
        description: 'Đặc trị bạc lá, cháy bìa lá do vi khuẩn.',
        price: 135000,
        activeIngredients: ['Kasugamycin'],
        stock_quantity: 80,
        category: 'thuoc',
        treats: ['Bệnh bạc lá']
      },
      {
        name: 'Copper Hydroxide – Trị cháy bìa lá',
        description: 'Thuốc gốc đồng phòng trừ vi khuẩn hại lúa.',
        price: 95000,
        activeIngredients: ['Copper compounds'],
        stock_quantity: 120,
        category: 'thuoc',
        treats: ['Bệnh cháy bìa lá']
      },
      {
        name: 'Propiconazole – Trị cháy lá lúa',
        description: 'Đặc trị nấm gây cháy lá, vàng lá.',
        price: 110000,
        activeIngredients: ['Propiconazole'],
        stock_quantity: 100,
        category: 'thuoc',
        treats: ['Bệnh cháy lá']
      },
      {
        name: 'Difenoconazole – Trị đốm lá',
        description: 'Phòng trị bệnh đốm lá lúa.',
        price: 125000,
        activeIngredients: ['Difenoconazole'],
        stock_quantity: 90,
        category: 'thuoc',
        treats: ['Bệnh đốm lá']
      },
      {
        name: 'Azoxystrobin – Trị nấm hại lúa',
        description: 'Phòng trừ nhiều loại nấm hại trên lúa.',
        price: 140000,
        activeIngredients: ['Azoxystrobin'],
        stock_quantity: 100,
        category: 'thuoc',
        treats: ['Bệnh đạo ôn', 'Bệnh cháy lá']
      },
      {
        name: 'Isoprothiolane – Trị đạo ôn cổ bông',
        description: 'Đặc trị đạo ôn cổ bông lúa.',
        price: 150000,
        activeIngredients: ['Isoprothiolane'],
        stock_quantity: 70,
        category: 'thuoc',
        treats: ['Bệnh đạo ôn cổ bông']
      },
      {
        name: 'Streptomycin – Trị vi khuẩn lúa',
        description: 'Phòng trừ bệnh vi khuẩn gây hại lúa.',
        price: 98000,
        activeIngredients: ['Streptomycin'],
        stock_quantity: 110,
        category: 'thuoc',
        treats: ['Bệnh bạc lá']
      },
      {
        name: 'Oxolinic Acid – Trị cháy lá vi khuẩn',
        description: 'Đặc trị vi khuẩn gây cháy lá lúa.',
        price: 105000,
        activeIngredients: ['Oxolinic acid'],
        stock_quantity: 85,
        category: 'thuoc',
        treats: ['Bệnh bạc lá']
      },
      {
        name: 'Validamycin – Trị khô vằn lúa',
        description: 'Đặc trị bệnh khô vằn trên lúa.',
        price: 130000,
        activeIngredients: ['Validamycin'],
        stock_quantity: 75,
        category: 'thuoc',
        treats: ['Bệnh khô vằn']
      },
      {
        name: 'Hexaconazole – Phòng khô vằn',
        description: 'Phòng trừ nấm gây khô vằn.',
        price: 115000,
        activeIngredients: ['Hexaconazole'],
        stock_quantity: 90,
        category: 'thuoc',
        treats: ['Bệnh khô vằn']
      },
      {
        name: 'Carbendazim – Trị thối thân lúa',
        description: 'Đặc trị nấm gây thối thân, thối gốc.',
        price: 92000,
        activeIngredients: ['Carbendazim'],
        stock_quantity: 100,
        category: 'thuoc',
        treats: ['Bệnh thối thân']
      }
    ]);

    console.log('🌾 Seed thuốc thành công (15 sản phẩm, không trùng)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed thuốc lỗi:', err);
    process.exit(1);
  }
};

seedThuoc();
