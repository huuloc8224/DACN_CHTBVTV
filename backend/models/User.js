// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const AddressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  addressLine: { type: String, required: true, trim: true },
  ward: { type: String },
  district: { type: String },
  province: { type: String },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  avatar: { type: String, default: '' },
  phone: { type: String, default: '', trim: true },
  birthDate: { type: Date },
  gender: { type: String, enum: ['nam', 'nữ', 'khác', null], default: null },

  addresses: [AddressSchema],

  // Giỏ hàng của user
  cart: [CartItemSchema],

  // Reset password fields
  resetPasswordTokenHashed: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

/* ---------------- Hooks ---------------- */
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

UserSchema.pre('save', async function(next) {
  // Hash password when it's modified
  if (!this.isModified('password_hash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/* ---------------- Instance methods ---------------- */
UserSchema.methods.comparePassword = function(candidatePassword) {
  if (!this.password_hash) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Tạo token đặt lại mật khẩu: trả token plain, lưu hash + expiry vào document
UserSchema.methods.createPasswordResetToken = function() {
  // tạo token plain
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hash token để lưu vào DB
  const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // gán vào document
  this.resetPasswordTokenHashed = hash;
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

  return resetToken;
};

// Kiểm tra token 
UserSchema.methods.verifyPasswordResetToken = function(token) {
  if (!this.resetPasswordTokenHashed || !this.resetPasswordExpires) return false;
  if (this.resetPasswordExpires.getTime() < Date.now()) return false;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === this.resetPasswordTokenHashed;
};

// Xóa token sau khi reset thành công
UserSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordTokenHashed = null;
  this.resetPasswordExpires = null;
};

/* ---------------- Virtuals / Helpers ---------------- */
UserSchema.virtual('safeInfo').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    phone: this.phone,
    birthDate: this.birthDate,
    gender: this.gender,
    addresses: this.addresses,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Loại bỏ password_hash và reset token khi toJSON / toObject
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.resetPasswordTokenHashed;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
