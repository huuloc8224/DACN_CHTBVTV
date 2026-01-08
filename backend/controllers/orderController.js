// controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');


const getRequesterId = (req) => {
  if (!req.user) return null;
  return req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : null);
};

//TẠO ĐƠN HÀNG
const createOrder = async (req, res) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Không xác thực' });

    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'COD',
      recipientName,
      phoneNumber,
      note
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    let itemsPrice = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.productId;
      if (!productId) return res.status(400).json({ message: 'Sản phẩm không hợp lệ' });

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Không tìm thấy sản phẩm (id: ${productId})` });

      const qty = Number(item.quantity || 0);
      if (product.stock_quantity < qty) {
        return res.status(400).json({ message: `Sản phẩm "${product.name}" chỉ còn ${product.stock_quantity} cái` });
      }

      const unitPrice = Number(item.unitPrice ?? product.price ?? 0);
      itemsPrice += unitPrice * qty;

      processedItems.push({
        product: product._id,
        name: product.name,
        image_url: product.image_url,
        unitPrice,
        quantity: qty
      });

      // Giảm tồn kho
      await Product.findByIdAndUpdate(product._id, { $inc: { stock_quantity: -qty } });
    }

    const taxPrice = Math.round(itemsPrice * 0.05);
    const shippingPrice = itemsPrice > 2000000 ? 0 : 30000;
    const totalAmount = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      userId: requesterId,
      orderItems: processedItems,
      shippingAddress,
      recipientName,
      phoneNumber,
      note,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      paymentMethod,
      status: 'Pending',
      isPaid: paymentMethod === 'VNPAY',
      paidAt: paymentMethod === 'VNPAY' ? new Date() : null
    });

    await order.populate('userId', 'name email');
    return res.status(201).json(order);
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng', detail: error.message });
  }
};

//LẤY ĐƠN HÀNG CỦA USER
const getMyOrders = async (req, res) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Không xác thực' });

    const orders = await Order.find({ userId: requesterId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng của user', detail: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID không hợp lệ' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.status === 'Cancelled') return res.status(400).json({ message: 'Đơn đã bị hủy' });

    for (const it of order.orderItems) {
      if (it.product) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock_quantity: it.quantity } });
      }
    }

    order.status = 'Cancelled';
    await order.save();

    return res.json({ message: 'Hủy đơn thành công', order });
  } catch (err) {
    console.error('cancelOrder error', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

//LẤY CHI TIẾT ĐƠN HÀNG
const getOrderById = async (req, res) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Không xác thực' });

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const orderUserId = order.userId?._id?.toString() || order.userId?.toString();
    if (orderUserId !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
    }

    return res.json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn hàng', detail: error.message });
  }
};

//ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy tất cả đơn hàng', detail: error.message });
  }
};

// ADMIN: CẬP NHẬT TRẠNG THÁI 
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    order.status = status;

    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    if (status === 'Cancelled') {
      // hoàn trả tồn kho
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock_quantity: item.quantity } });
      }
    }

    await order.save();
    await order.populate('userId', 'name email');
    return res.json(order);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái', detail: error.message });
  }
};

//XÓA ĐƠN HÀNG (ADMIN)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy' });

    if (!['Delivered', 'Cancelled'].includes(order.status)) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock_quantity: item.quantity } });
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    console.error('deleteOrder error:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa đơn hàng', detail: error.message });
  }
};

// THỐNG KÊ DOANH THU
const getSalesStatistics = async (req, res) => {
  try {
    const summaryAgg = [
      { $match: {
          $or: [
            { paymentMethod: 'VNPAY', isPaid: true },
            { paymentMethod: 'COD', status: 'Delivered' }
          ]
        }
      },
      { $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
          totalOrders: { $sum: 1 }
        }
      }
    ];
    const summaryRes = await Order.aggregate(summaryAgg);
    const totalRevenue = summaryRes[0]?.totalRevenue || 0;
    const totalOrders = summaryRes[0]?.totalOrders || 0;

    const monthlyAgg = [
      { $match: {
          $or: [
            { paymentMethod: 'VNPAY', isPaid: true },
            { paymentMethod: 'COD', status: 'Delivered' }
          ]
        }
      },
      { $addFields: { dateForMonth: { $ifNull: ['$paidAt', '$createdAt'] } } },
      { $project: { month: { $dateToString: { format: '%Y-%m', date: '$dateForMonth' } }, totalAmount: { $ifNull: ['$totalAmount', 0] } } },
      { $group: { _id: '$month', totalRevenue: { $sum: '$totalAmount' } } },
      { $project: { _id: 0, month: '$_id', totalRevenue: 1 } },
      { $sort: { month: 1 } }
    ];
    const monthlySales = await Order.aggregate(monthlyAgg);

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    return res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      monthlySales
    });
  } catch (error) {
    console.error('Lỗi thống kê doanh thu:', error);
    return res.status(500).json({ message: 'Lỗi thống kê', detail: error.message });
  }
};

//TOP KHÁCH HÀNG 
const getTopCustomers = async (req, res) => {
  try {
    const minSpend = Number(req.query.minSpend || 0);
    const pipeline = [
      { $match: {
          $or: [
            { paymentMethod: 'VNPAY', isPaid: true },
            { paymentMethod: 'COD', status: 'Delivered' }
          ]
        }
      },
      { $group: {
          _id: '$userId',
          totalSpent: { $sum: { $ifNull: ['$totalAmount', 0] } },
          orderCount: { $sum: 1 }
        }
      },
      { $match: { totalSpent: { $gte: minSpend } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalSpent: 1,
          orderCount: 1
        }
      }
    ];

    const topCustomers = await Order.aggregate(pipeline);
    return res.json(topCustomers);
  } catch (error) {
    console.error('Lỗi top customers:', error);
    return res.status(500).json({ message: 'Lỗi thống kê khách hàng', detail: error.message });
  }
};

//TOP SẢN PHẨM BÁN CHẠY
const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const by = req.query.by === 'revenue' ? 'revenue' : 'quantity';

    const matchStage = {
      $or: [
        { paymentMethod: 'VNPAY', isPaid: true },
        { paymentMethod: 'COD', status: 'Delivered' }
      ]
    };

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$orderItems' },

      { $addFields: {
          pid: {
            $ifNull: [
              '$orderItems.product',
              { $ifNull: ['$orderItems.productId', '$orderItems._id'] }
            ]
          },
          itemQty: { $ifNull: ['$orderItems.quantity', 0] },
          itemUnitPrice: { $ifNull: ['$orderItems.unitPrice', '$orderItems.price', 0] },
          itemRevenue: {
            $multiply: [
              { $ifNull: ['$orderItems.unitPrice', '$orderItems.price', 0] },
              { $ifNull: ['$orderItems.quantity', 0] }
            ]
          },
          snapshotName: { $ifNull: ['$orderItems.name', null] },
          snapshotImage: { $ifNull: ['$orderItems.image_url', null] }
        }
      },

      { $addFields: {
          keyGroup: {
            $cond: [
              { $ne: ['$pid', null] },
              { $toString: '$pid' },
              {
                $concat: [
                  'snap::',
                  { $ifNull: ['$snapshotName', 'unknown'] },
                  '::',
                  { $toString: '$itemUnitPrice' },
                  '::',
                  { $ifNull: ['$snapshotImage', ''] }
                ]
              }
            ]
          }
        }
      },

      { $group: {
          _id: '$keyGroup',
          totalQty: { $sum: '$itemQty' },
          totalRevenue: { $sum: '$itemRevenue' },
          sampleName: { $first: '$snapshotName' },
          sampleImage: { $first: '$snapshotImage' },
          pidSample: { $first: '$pid' }
        }
      },

      { $addFields: { pidForLookup: { $cond: [{ $ne: ['$pidSample', null] }, '$pidSample', null] } } },
      { $lookup: { from: 'products', localField: 'pidForLookup', foreignField: '_id', as: 'productDoc' } },
      { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },

      { $project: {
          _id: 0,
          productId: { $cond: [{ $ne: ['$pidSample', null] }, '$pidSample', null] },
          name: { $ifNull: ['$productDoc.name', '$sampleName', 'Sản phẩm đã xóa'] },
          image_url: { $ifNull: ['$productDoc.image_url', '$sampleImage', '/images/placeholder.jpg'] },
          category: { $ifNull: ['$productDoc.category', 'khac'] },
          totalQty: 1,
          totalRevenue: { $round: ['$totalRevenue', 0] }
        }
      },

      { $match: { name: { $ne: null } } },
      { $sort: by === 'revenue' ? { totalRevenue: -1 } : { totalQty: -1 } },
      { $limit: limit }
    ];

    const topProducts = await Order.aggregate(pipeline);
    return res.json(topProducts);
  } catch (error) {
    console.error('Lỗi getTopProducts:', error);
    return res.status(500).json({ message: 'Lỗi thống kê sản phẩm', detail: error.message });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getSalesStatistics,
  getTopCustomers,
  cancelOrder,
  getTopProducts
};
