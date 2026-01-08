// controllers/authController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Order = require('../models/Order');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// --- Mailer fallback: always log email to console (dev only) ---
let transporter = {
  sendMail: async (mailOptions) => {
    console.log('--- Email fallback (dev) ---');
    console.log('To:', mailOptions.to);
    console.log('From:', mailOptions.from);
    console.log('Subject:', mailOptions.subject);
    console.log('Text:', mailOptions.text);
    console.log('HTML:', mailOptions.html);
    console.log('---------------------------');
    // Return a fake result similar to nodemailer for compatibility
    return Promise.resolve({ accepted: [mailOptions.to], messageId: 'dev-fallback' });
  },
};

// -----------------------------
// REGISTER
// -----------------------------
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('registerUser called:', { name, emailProvided: !!email, role });
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    const finalRole = role === 'admin' ? 'admin' : 'user';

    // Create user; model pre-save will hash password_hash
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password_hash: password, // gán thô, model sẽ hash
      role: finalRole,
    });

    if (!user) {
      return res.status(500).json({ success: false, message: 'Tạo tài khoản thất bại.' });
    }

    const safe = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      user: safe,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server.' });
  }
};

// -----------------------------
// LOGIN
// -----------------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('loginUser called:', { emailProvided: !!email, passwordProvided: !!password });
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    console.log('loginUser found user:', !!user, user?._id);
    if (user && (await user.comparePassword(password))) {
      const safe = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt,
      };
      return res.json({
        success: true,
        user: safe,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server.' });
  }
};

// -----------------------------
// GET CURRENT USER (me)
// -----------------------------
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId).select('-password_hash').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -----------------------------
// FORGOT PASSWORD (send reset email or log token in dev)
// -----------------------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('forgotPassword called:', { email: String(email).toLowerCase() });
  if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email.' });

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
    }

    console.log('forgotPassword: user found id=', user._id);

    // Tạo token gốc, lưu hash + expiry vào user
    let resetToken;
    try {
      resetToken = user.createPasswordResetToken();
      console.log('forgotPassword: created resetToken (plain) length=', resetToken?.length);
    } catch (err) {
      console.error('forgotPassword: createPasswordResetToken error:', err);
      return res.status(500).json({ success: false, message: 'Lỗi khi tạo token.' });
    }

    try {
      await user.save();
      console.log('forgotPassword: user saved, resetPasswordExpires=', user.resetPasswordExpires);
    } catch (saveErr) {
      console.error('forgotPassword: error saving user:', saveErr);
      return res.status(500).json({ success: false, message: 'Lỗi khi lưu token vào DB.', error: saveErr.message });
    }

    // Prepare mail options
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${encodeURIComponent(resetToken)}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TBVTV" <no-reply@tbvtv.vn>',
      to: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      text: `Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Mở link sau để đặt lại mật khẩu (hết hạn sau 1 giờ):\n\n${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
      html: `<p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
             <p><a href="${resetUrl}" target="_blank" style="background:#16a34a;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;">Đặt lại mật khẩu</a></p>
             <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
    };

    // Log mailOptions for debugging
    console.log('forgotPassword: mailOptions prepared:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      resetUrl,
    });

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('forgotPassword: sendMail result:', result);
    } catch (mailErr) {
      console.error('forgotPassword sendMail error:', mailErr);
      // Nếu gửi mail thất bại, vẫn trả success để không lộ thông tin người dùng
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
    }

    return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý yêu cầu.', error: error.message });
  }
};

// -----------------------------
// RESET PASSWORD (use token)
// -----------------------------
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log('resetPassword called, tokenProvided:', !!token, 'passwordProvided:', !!password);
  if (!token) return res.status(400).json({ success: false, message: 'Token không hợp lệ.' });
  if (!password || String(password).trim().length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  try {
    // Hash token to compare with stored hashed token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('resetPassword tokenHash:', tokenHash);

    const user = await User.findOne({
      resetPasswordTokenHashed: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    console.log('resetPassword found user:', !!user, user?._id, 'expires:', user?.resetPasswordExpires);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    // Gán mật khẩu thô; model pre('save') sẽ hash một lần
    user.password_hash = password;

    // Clear reset token fields
    user.clearPasswordResetToken();

    await user.save();

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đặt lại mật khẩu.' });
  }
};

// -----------------------------
// ADMIN: GET ALL USERS
// -----------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password_hash -resetPasswordTokenHashed -resetPasswordExpires');
    res.json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng.' });
  }
};

// -----------------------------
// ADMIN: GET ORDERS BY USER ID
// -----------------------------
exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId: userId })
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('getUserOrders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy đơn hàng của người dùng.' });
  }
};

// CHANGE PASSWORD (user authenticated)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    console.log('changePassword called, userId:', userId);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }
    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    // Gán mật khẩu thô; model pre('save') sẽ hash một lần
    user.password_hash = newPassword;

    await user.save();

    return res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu.' });
  }
};
