// backend/config/db.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose 6+ không cần các tùy chọn useNewUrlParser/useUnifiedTopology nữa
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection successful.');
    } catch (error) {
        console.error('❌ Unable to connect to MongoDB:', error.message);
        // Thoát ứng dụng nếu kết nối thất bại
        process.exit(1);
    }
};

module.exports = { connectDB, mongoose };