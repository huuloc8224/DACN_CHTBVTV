
const User = require('../models/User'); 
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body; 
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email đã được sử dụng." });
        }
        const finalRole = (role === 'admin') ? 'admin' : 'user'; 

        const user = await User.create({ name, email, password_hash: password, role: finalRole });

        if (user) {
            res.status(201).json({
                id: user._id, 
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                id: user._id, 
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin xem danh sách TẤT CẢ người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password_hash'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng.' });
    }
};

// Admin xem đơn hàng theo User ID
exports.getUserOrders = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ userId: userId })
            .populate('userId', 'name email')
            .sort({ orderDate: -1 });
            
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy đơn hàng của người dùng.' });
    }
};