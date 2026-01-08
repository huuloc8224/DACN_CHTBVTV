require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

/*   LOAD MODELS*/
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/KnowledgeBase');
require('./models/ChatSession'); // 👈 QUAN TRỌNG

/* MIDDLEWARE*/
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

/* CORS */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/*   STATIC FILES*/
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

/* ROUTES*/
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes')); 
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.send('<h1>✅ Backend đang chạy ổn định!</h1>');
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
