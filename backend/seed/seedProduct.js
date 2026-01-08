require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product'); 

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pbtv_db';

const products = [
  {
    name: 'Actara 25WG',
    description: 'Thuốc trừ rầy nâu, rầy lưng trắng, gián tiếp phòng bệnh vàng lùn, lùn xoắn lá.',
    price: 85000,
    activeIngredients: ['Thiamethoxam'],
    stock_quantity: 120,
    category: 'thuoc',
    treats: ['Bệnh vàng lùn và lùn xoắn lá'],
    image_url: '/images/actara.jpg'
  },
  {
    name: 'Confidor 100SL',
    description: 'Thuốc trừ rầy, rệp, bọ trĩ, hiệu quả cao trên lúa.',
    price: 78000,
    activeIngredients: ['Imidacloprid'],
    stock_quantity: 95,
    category: 'thuoc',
    treats: ['Bệnh vàng lùn và lùn xoắn lá'],
    image_url: '/images/confidor.jpg'
  },
  {
    name: 'Oshin 20WP',
    description: 'Thuốc trừ rầy nâu, rầy lưng trắng, phòng bệnh virus trên lúa.',
    price: 67000,
    activeIngredients: ['Dinotefuran'],
    stock_quantity: 150,
    category: 'thuoc',
    treats: ['Bệnh vàng lùn và lùn xoắn lá'],
    image_url: '/images/oshin.jpg'
  },
  {
    name: 'Filia 525SE',
    description: 'Thuốc đặc trị bệnh đạo ôn lá và đạo ôn cổ bông.',
    price: 135000,
    activeIngredients: ['Tricyclazole', 'Azoxystrobin'],
    stock_quantity: 80,
    category: 'thuoc',
    treats: ['Bệnh đạo ôn'],
    image_url: '/images/filia.jpg'
  },
  {
    name: 'Beam 75WP',
    description: 'Thuốc trừ nấm gây bệnh đạo ôn lúa.',
    price: 92000,
    activeIngredients: ['Tricyclazole'],
    stock_quantity: 60,
    category: 'thuoc',
    treats: ['Bệnh đạo ôn'],
    image_url: '/images/beam.jpg'
  },
  {
    name: 'Anvil 5SC',
    description: 'Thuốc trừ nấm phổ rộng, hiệu quả với bệnh khô vằn.',
    price: 110000,
    activeIngredients: ['Hexaconazole'],
    stock_quantity: 70,
    category: 'thuoc',
    treats: ['Bệnh khô vằn'],
    image_url: '/images/anvil.jpg'
  },
  {
    name: 'Validacin 5L',
    description: 'Thuốc đặc trị bệnh khô vằn trên lúa.',
    price: 98000,
    activeIngredients: ['Validamycin'],
    stock_quantity: 90,
    category: 'thuoc',
    treats: ['Bệnh khô vằn'],
    image_url: '/images/validacin.jpg'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB');

    await Product.deleteMany({});
    console.log('🗑️ Đã xoá dữ liệu thuốc cũ');

    await Product.insertMany(products);
    console.log('🌾 Seed Product thành công');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Product lỗi:', err);
    process.exit(1);
  }
};

seed();
