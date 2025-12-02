
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
    let token;

    // Kiểm tra Token trong Header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];
            
            //Xác minh Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            //Tìm User bằng ID từ token
            req.user = await User.findById(decoded.id).select('-password_hash'); 

            if (!req.user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }
            
            // Gán id dạng string
            req.user.id = req.user._id.toString();

            next();
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


//Middleware kiểm tra vai trò người dùng phải là 'admin'.

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập (Chỉ Admin)' });
    }
};

module.exports = { protect, admin };