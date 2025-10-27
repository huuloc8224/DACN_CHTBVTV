// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); 
const User = require('../models/User'); // <--- [SỬA LỖI] THÊM DÒNG NÀY
const mongoose = require('mongoose');
// [USER] TẠO ĐƠN HÀNG
exports.createOrder = async (req, res) => {
    const { orderItems, totalAmount, paymentMethod, shippingAddress } = req.body; 
    try {
        const newOrder = await Order.create({
            userId: req.user.id, 
            orderItems,
            totalAmount,
            paymentMethod,
            // Lưu trữ Tên, SĐT, Địa chỉ (snapshot tại thời điểm đặt hàng)
            shippingAddress: shippingAddress.addressLine, 
            phoneNumber: shippingAddress.phoneNumber, 
            recipientName: shippingAddress.recipientName, // Thêm trường này vào Order.js nếu cần
            status: 'Pending'
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
    }
};

// [USER] XEM LỊCH SỬ ĐƠN HÀNG CỦA MÌNH
exports.getOrdersByUser = async (req, res) => {
    try {
        // Lấy tất cả đơn hàng có userId khớp với người dùng đang đăng nhập
        const orders = await Order.find({ userId: req.user.id })
            // Có thể populate thông tin sản phẩm tại đây nếu cần hiển thị chi tiết
            .sort({ orderDate: -1 }); 
            
        res.json(orders);
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng.' });
    }
};

// [USER] HỦY ĐƠN HÀNG
exports.cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; 

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        // Tìm đơn hàng bằng ID VÀ đảm bảo quyền sở hữu bằng userId
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này.' });
        }

        // Quy tắc nghiệp vụ: Chỉ cho phép hủy khi đơn hàng ở trạng thái Pending
        if (order.status !== 'Pending') {
            return res.status(400).json({ 
                message: `Không thể hủy đơn hàng này. Đơn hàng đang ở trạng thái: ${order.status}.` 
            });
        }

        // Cập nhật trạng thái thành 'Cancelled'
        order.status = 'Cancelled';
        await order.save();
        
        res.json({ message: 'Đã hủy đơn hàng thành công.', order });
    } catch (error) {
        console.error("Lỗi hủy đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi hủy đơn hàng.' });
    }
};

// -------------------------------------------------------------------------------- //

// [ADMIN] LẤY TẤT CẢ ĐƠN HÀNG
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .sort({ orderDate: -1 }); 
            
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.' });
    }
};

// [ADMIN] CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id; 

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        const order = await Order.findById(orderId); 
        
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }
        
        order.status = status;
        await order.save();
        
        res.json(order);
    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(404).json({ message: 'ID đơn hàng không tồn tại.' });
        }
        console.error("Lỗi cập nhật đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái. Vui lòng kiểm tra log backend.' });
    }
};

// [ADMIN] XÓA ĐƠN HÀNG
exports.deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        const deletedOrder = await Order.findByIdAndDelete(orderId);
        
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa.' });
        }
        
        res.json({ message: 'Đã xóa đơn hàng thành công.' });
    } catch (error) {
        console.error("Lỗi xóa đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng.' });
    }
};

// [MỚI] HÀM LẤY CHI TIẾT ĐƠN HÀNG (CHO CẢ USER VÀ ADMIN)
exports.getOrderById = async (req, res) => {
    const orderId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        // Lấy đơn hàng và populate tên/email của user liên quan
        const order = await Order.findById(orderId).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        // [BẢO MẬT] Kiểm tra quyền truy cập
        // 1. Nếu là Admin, cho phép xem
        // 2. Nếu là User, chỉ cho phép xem nếu order.userId khớp với req.user.id
        if (req.user.role === 'admin' || order.userId._id.toString() === req.user.id) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Không có quyền truy cập đơn hàng này.' });
        }
        
    } catch (error) {
        console.error("Lỗi tìm đơn hàng theo ID:", error);
        res.status(500).json({ message: 'Lỗi server khi tìm đơn hàng.' });
    }
};

// === [TÍNH NĂNG THỐNG KÊ MỚI - ĐÃ SỬA LỖI LOGIC] ===

/**
 * @desc    Lấy Thống kê Doanh thu (VÀ TỔNG QUAN)
 * @route   GET /api/orders/stats/sales
 * @access  Private/Admin
 */
exports.getSalesStatistics = async (req, res) => {
    try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // [SỬA LỖI] Chỉ $match các đơn hàng 'Delivered'
        const filterDelivered = { 
            status: 'Delivered', 
            createdAt: { $gte: startOfYear } 
        };
        const filterDeliveredAllTime = { status: 'Delivered' };

        // 1. Doanh thu theo Tháng (trong năm nay)
        const monthlySales = await Order.aggregate([
            { $match: filterDelivered },
            { $group: { _id: { $month: "$createdAt" }, totalRevenue: { $sum: "$totalAmount" } } },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Doanh thu theo Phân loại Sản phẩm (Category)
        const categorySales = await Order.aggregate([
            { $match: filterDeliveredAllTime }, // Tính trên tất cả đơn đã giao
            { $unwind: "$orderItems" },
            {
                $lookup: { 
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category", 
                    totalRevenue: { $sum: { $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"] } }
                }
            }
        ]);

        // 3. Lấy 3 số liệu tổng quan
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments(); 
        // [SỬA LỖI] Chỉ đếm đơn hàng đã giao
        const totalDeliveredOrders = await Order.countDocuments(filterDeliveredAllTime); 

        res.json({
            monthlySales, 
            categorySales,
            totalProducts: totalProducts,
            totalUsers: totalUsers,
            totalOrders: totalDeliveredOrders // Trả về số đơn đã giao
        });

    } catch (error) {
        console.error("Lỗi khi lấy thống kê sales:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê.' });
    }
};

/**
 * @desc    Lấy Top Khách hàng theo Doanh thu
 * @route   GET /api/orders/stats/top-customers
 * @access  Private/Admin
 */
exports.getTopCustomers = async (req, res) => {
    const minSpend = Number(req.query.minSpend) || 0; 
    
    try {
        const topCustomers = await Order.aggregate([
            { $match: { status: 'Delivered' } }, // [SỬA LỖI] Chỉ tính đơn đã giao
            {
                $group: {
                    _id: "$userId", 
                    totalSpent: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $match: { totalSpent: { $gte: minSpend } } },
            {
                $lookup: { 
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: { 
                    userId: "$_id",
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    totalSpent: 1,
                    orderCount: 1
                }
            },
            { $sort: { totalSpent: -1 } }, 
            { $limit: 10 } 
        ]);

        res.json(topCustomers);
    } catch (error) {
        console.error("Lỗi khi lấy top khách hàng:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê.' });
    }
};

/**
 * @desc    [ADMIN] Lấy tất cả đơn hàng của 1 User cụ thể
 * @route   GET /api/orders/user/:userId
 * @access  Private/Admin
 */
exports.getOrdersByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User ID không hợp lệ.' });
        }
        
        const orders = await Order.find({ userId: userId })
            .populate('userId', 'name email')
            .sort({ orderDate: -1 });
            
        res.json(orders);
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng của user:", error);
        res.status(500).json({ message: 'Lỗi khi lấy đơn hàng của người dùng.' });
    }
};