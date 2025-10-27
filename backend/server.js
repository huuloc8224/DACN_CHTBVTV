// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db'); 
const path = require('path');

// Import Models
require('./models/User'); 
require('./models/Product');
require('./models/Order'); 

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); // [MỚI] Import userRoutes

const app = express();
const PORT = process.env.PORT || 3001;

// =======================================================
// [BƯỚC 1: BODY PARSERS - PHẢI Ở ĐẦU TIÊN]
// Tăng giới hạn kích thước body (100MB)
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true })); 
// =======================================================

// BƯỚC 2: CORS (Sau Body Parsers)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']; 
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
};
app.use(cors(corsOptions)); 

// BƯỚC 3: PHỤC VỤ FILE TĨNH (Ảnh upload)
app.use(express.static(path.join(__dirname, 'public'))); 

// BƯỚC 4: API ROUTES (Sau các middleware chung)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // [MỚI] Đăng ký userRoutes

app.get('/', (req, res) => {
  res.send('🌿 Thuốc BVTV API Server is running.');
});

// Đồng bộ DB và chạy server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
};

startServer();