// backend/models/User.js (Mongoose Schema)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// [MỚI] Tạo một Schema con cho Địa chỉ
const AddressSchema = new mongoose.Schema({
    recipientName: { // Tên người nhận (có thể khác tên tài khoản)
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    addressLine: { // Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP)
        type: String,
        required: true
    },
    isDefault: { // (Tùy chọn) Đánh dấu địa chỉ mặc định
        type: Boolean,
        default: false
    }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // [THAY ĐỔI] Thêm mảng địa chỉ
    addresses: [AddressSchema]
}, { timestamps: true });

// Mongoose Pre-Save Hook để Hash mật khẩu
UserSchema.pre('save', async function (next) {
    // Chỉ hash nếu trường password_hash bị thay đổi (khi tạo hoặc update)
    if (!this.isModified('password_hash')) {
        return next();
    }
    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
});

// Phương thức để so sánh mật khẩu
UserSchema.methods.comparePassword = function (candidatePassword) {
    // So sánh mật khẩu được cung cấp với mật khẩu đã hash trong DB
    return bcrypt.compare(candidatePassword, this.password_hash);
};

// Sử dụng 'User' làm tên collection
module.exports = mongoose.model('User', UserSchema);