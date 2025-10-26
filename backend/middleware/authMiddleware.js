// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import Mongoose Model

/**
 * Middleware bảo vệ các tuyến đường, xác minh JWT token
 * và gán thông tin người dùng (req.user) vào request.
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra Token trong Header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header (format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];
            
            // 2. Xác minh Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. Tìm User bằng ID từ token (Mongoose: findById)
            // .select('-password_hash') để loại trừ mật khẩu khỏi object user
            req.user = await User.findById(decoded.id).select('-password_hash'); 

            if (!req.user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }
            
            // Gán id dạng string (từ Mongoose _id)
            req.user.id = req.user._id.toString();

            next(); // Chuyển sang middleware/controller tiếp theo
        } catch (error) {
            console.error("JWT Error:", error.message);
            // Lỗi token không hợp lệ hoặc hết hạn
            return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
        }
    }

    if (!token) {
        // Không tìm thấy token trong header
        return res.status(401).json({ message: 'Không tìm thấy Token. Không được ủy quyền' });
    }
};

/**
 * Middleware kiểm tra vai trò người dùng phải là 'admin'.
 */
const admin = (req, res, next) => {
    // req.user phải tồn tại (đã qua protect) và vai trò phải là 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập (Chỉ Admin)' });
    }
};

module.exports = { protect, admin };