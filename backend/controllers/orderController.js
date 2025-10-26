// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); // [QUAN TRỌNG] Phải import Product
const mongoose = require('mongoose'); 

// [USER] TẠO ĐƠN HÀNG (Giữ nguyên - Hàm này đã trừ tồn kho khi tạo)
exports.createOrder = async (req, res) => {
    const { orderItems, shippingAddress, totalAmount, phoneNumber, paymentMethod } = req.body; 

    try {
        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('Không có sản phẩm nào trong đơn hàng');
        }

        // 1. Trừ tồn kho (khi User đặt hàng)
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                if (product.stock_quantity < item.quantity) {
                    res.status(400);
                    throw new Error(`Không đủ hàng cho sản phẩm: ${product.name}`); 
                }
                product.stock_quantity = product.stock_quantity - item.quantity;
                await product.save();
            } else {
                res.status(404);
                throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
            }
        }

        // 2. Tạo đơn hàng
        const newOrder = await Order.create({
            userId: req.user.id, 
            orderItems, shippingAddress, totalAmount, phoneNumber, paymentMethod,
            status: 'Pending'
        });
        
        res.status(201).json(newOrder);

    } catch (error) {
        // Nếu lỗi (ví dụ: không đủ hàng), không cần hoàn kho vì 'await product.save()' chưa chạy
        res.status(res.statusCode || 400).json({ message: 'Lỗi tạo đơn hàng: ' + error.message });
    }
};

// [USER] XEM LỊCH SỬ ĐƠN HÀNG CỦA MÌNH
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ orderDate: -1 }); 
        res.json(orders);
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng.' });
    }
};

// [USER] HỦY ĐƠN HÀNG (Đã cập nhật logic hoàn trả tồn kho)
exports.cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; 

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này.' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ 
                message: `Không thể hủy đơn hàng này. Đơn hàng đang ở trạng thái: ${order.status}.` 
            });
        }

        // [LOGIC MỚI] Hoàn trả tồn kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock_quantity = product.stock_quantity + item.quantity;
                await product.save();
            }
        }

        order.status = 'Cancelled';
        await order.save();
        
        res.json({ message: 'Đã hủy đơn hàng và hoàn trả tồn kho thành công.', order });
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

// [ADMIN] LẤY CHI TIẾT ĐƠN HÀNG (CHO CẢ USER VÀ ADMIN)
exports.getOrderById = async (req, res) => {
    const orderId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }
        const order = await Order.findById(orderId).populate('userId', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }
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

// [ADMIN] CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ĐÃ SỬA LOGIC TỒN KHO)
exports.updateOrderStatus = async (req, res) => {
    const { status: newStatus } = req.body;
    const orderId = req.params.id; 

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }
        const order = await Order.findById(orderId); 
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        const oldStatus = order.status;

        // Logic Hoàn/Trừ tồn kho khi Admin thay đổi trạng thái
        if (oldStatus !== newStatus) {
            
            // TRƯỜNG HỢP 1: Admin hủy đơn (CỘNG HÀNG VÀO KHO)
            // (Chỉ cộng khi đơn hàng trước đó chưa bị hủy)
            if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.stock_quantity = product.stock_quantity + item.quantity;
                        await product.save();
                    }
                }
            }
            
            // TRƯỜNG HỢP 2: Admin khôi phục đơn (TRỪ HÀNG KHỎI KHO)
            // (Chỉ trừ khi đơn hàng trước đó đã bị hủy)
            else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        if (product.stock_quantity < item.quantity) {
                            // Nếu khôi phục mà hết hàng thì báo lỗi
                            return res.status(400).json({ message: `Không thể khôi phục đơn hàng. Sản phẩm ${product.name} không đủ tồn kho.` });
                        }
                        product.stock_quantity = product.stock_quantity - item.quantity;
                        await product.save();
                    }
                }
            }
        }
        
        order.status = newStatus;
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

// [ADMIN] XÓA ĐƠN HÀNG (ĐÃ SỬA LOGIC TỒN KHO)
exports.deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ message: 'ID đơn hàng không hợp lệ.' });
        }

        // Tìm đơn hàng trước khi xóa để kiểm tra trạng thái
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa.' });
        }
        
        // [LOGIC MỚI] Chỉ hoàn trả tồn kho nếu đơn hàng CHƯA BỊ HỦY
        // (Vì nếu đã hủy, tồn kho đã được trả lại rồi)
        if (order.status !== 'Cancelled') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock_quantity = product.stock_quantity + item.quantity;
                    await product.save();
                }
            }
        }

        // Tiến hành xóa đơn hàng khỏi DB
        await Order.findByIdAndDelete(orderId);
        
        res.json({ message: 'Đã xóa đơn hàng và cập nhật tồn kho thành công.' });
    } catch (error) {
        console.error("Lỗi xóa đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng.' });
    }
};
// [MỚI] HÀM THỐNG KÊ BÁN HÀNG (ADMIN)
exports.getOrderStats = async (req, res) => {
    try {
        // 1. Tính Tổng Doanh Thu và Tổng Số Đơn Hàng (Chỉ tính đơn không bị hủy)
        const salesData = await Order.aggregate([
            {
                $match: { 
                    status: { $ne: 'Cancelled' } // Chỉ tính các đơn hàng không bị hủy
                } 
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // 2. Thống kê số lượng sản phẩm đã bán (chỉ tính đơn không bị hủy)
        const productSales = await Order.aggregate([
            {
                $match: { status: { $ne: 'Cancelled' } }
            },
            {
                $unwind: "$orderItems" // Tách các sản phẩm trong mảng orderItems ra
            },
            {
                $group: {
                    _id: "$orderItems.name", // Nhóm theo Tên sản phẩm
                    totalQuantitySold: { $sum: "$orderItems.quantity" }
                }
            },
            {
                $sort: { totalQuantitySold: -1 } // Sắp xếp bán chạy nhất
            },
            {
                $limit: 5 // Lấy 5 sản phẩm bán chạy nhất
            }
        ]);

        // 3. Lấy tổng số lượng sản phẩm và khách hàng
        const totalProducts = await Product.countDocuments();
        const totalUsers = await mongoose.model('User').countDocuments(); // Dùng mongoose.model('User') nếu User model chưa được import

        res.json({
            totalRevenue: salesData[0]?.totalRevenue || 0,
            totalOrders: salesData[0]?.totalOrders || 0,
            totalProducts,
            totalUsers,
            topSellingProducts: productSales
        });

    } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê.' });
    }
};