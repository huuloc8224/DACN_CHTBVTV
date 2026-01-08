// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy Token. Không được ủy quyền.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verify error:', err);
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token không chứa thông tin người dùng.' });
    }

    // Lấy user từ DB, loại bỏ các trường nhạy cảm
    const user = await User.findById(userId).select('-password_hash -resetPasswordTokenHashed -resetPasswordExpires').lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    // Gán req.user là object nhẹ, đảm bảo có id dạng string
    req.user = { id: user._id.toString(), role: user.role, ...user };

    next();
  } catch (error) {
    console.error('protect middleware unexpected error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực.' });
  }
};

const admin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yêu cầu quyền admin.' });
    }
    next();
  } catch (error) {
    console.error('admin middleware error:', error);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền.' });
  }
};

module.exports = { protect, admin };
