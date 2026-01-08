// controllers/cartController.js
const User = require('../models/User');

// Helper: lấy userId an toàn
const getUserId = (req) => req.user?.id || req.user?._id;

// Lấy giỏ hàng của user hiện tại (đã populate)
exports.getCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).populate('cart.product');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    return res.json({ success: true, cart: user.cart || [] });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy giỏ hàng.' });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    let { product, quantity = 1, unitPrice } = req.body;
    if (!product) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm.' });
    }
    quantity = Number(quantity) || 1;

    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    if (!Array.isArray(user.cart)) user.cart = [];

    // Nếu frontend gửi object product, lấy _id
    const productId = (typeof product === 'object' && product._id) ? product._id : product;

    // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
    const existingItem = user.cart.find(item => item.product.toString() === productId.toString());
    if (existingItem) {
      existingItem.quantity += quantity;
      // nếu có unitPrice mới, cập nhật snapshot
      if (unitPrice !== undefined) existingItem.unitPrice = unitPrice;
    } else {
      user.cart.push({ product: productId, quantity, unitPrice });
    }

    await user.save();

    // Populate trước khi trả về
    await user.populate('cart.product');

    return res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thêm vào giỏ hàng.' });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ.' });
    }

    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    const item = user.cart.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng.' });

    item.quantity = qty;
    await user.save();

    await user.populate('cart.product');

    return res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error('updateCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giỏ hàng.' });
  }
};

// Xóa một sản phẩm khỏi giỏ
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    const item = user.cart.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng.' });

    item.remove();
    await user.save();

    await user.populate('cart.product');

    return res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error('removeCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng.' });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    user.cart = [];
    await user.save();

    return res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng.', cart: [] });
  } catch (error) {
    console.error('clearCart error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa giỏ hàng.' });
  }
};
