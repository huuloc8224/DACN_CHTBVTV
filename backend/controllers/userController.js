// controllers/userController.js
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper: trả về userId hoặc null
const ensureUserId = (req) => {
  return req?.user?.id || req?.user?._id || null;
};

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId).select('-password_hash -resetPasswordTokenHashed -resetPasswordExpires').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    return res.json({ success: true, user });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin cá nhân.' });
  }
};

// PATCH /api/user/profile
exports.updateProfile = async (req, res) => {
  const updates = req.body || {};
  const allowedFields = ['name', 'email', 'phone', 'address', 'birthDate', 'gender', 'avatar'];

  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    // Filter chỉ các trường cho phép
    const filtered = {};
    Object.keys(updates).forEach((k) => {
      if (allowedFields.includes(k)) filtered[k] = updates[k];
    });

    if (Object.keys(filtered).length === 0) {
      return res.status(400).json({ success: false, message: 'Không có thông tin nào để cập nhật.' });
    }

    // Email: chuẩn hóa và kiểm tra trùng
    if (filtered.email) {
      const email = String(filtered.email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });

      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi tài khoản khác.' });
      }
      filtered.email = email;
    }

    if (filtered.phone) filtered.phone = String(filtered.phone).trim();
    if (filtered.address) filtered.address = String(filtered.address).trim();

    if (filtered.birthDate) {
      const d = new Date(filtered.birthDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'Ngày sinh không hợp lệ.' });
      }
      filtered.birthDate = d.toISOString();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...filtered, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password_hash -resetPasswordTokenHashed -resetPasswordExpires');

    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    return res.json({ success: true, message: 'Cập nhật thông tin cá nhân thành công!', user });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông tin.' });
  }
};

// GET /api/user/addresses
exports.getAddresses = async (req, res) => {
  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId).select('addresses').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    // Đưa địa chỉ mặc định lên đầu
    const addresses = (user.addresses || []).slice();
    addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    return res.json({ success: true, addresses });
  } catch (error) {
    console.error('getAddresses error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy địa chỉ.' });
  }
};

// POST /api/user/addresses
exports.addAddress = async (req, res) => {
  const { recipientName, phoneNumber, addressLine, ward = '', district = '', province = '', isDefault = false } = req.body || {};

  if (!recipientName || !phoneNumber || !addressLine) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ: tên người nhận, số điện thoại và địa chỉ.' });
  }

  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    if (!Array.isArray(user.addresses)) user.addresses = [];

    const newAddress = {
      recipientName: String(recipientName).trim(),
      phoneNumber: String(phoneNumber).trim(),
      addressLine: String(addressLine).trim(),
      ward: ward ? String(ward).trim() : '',
      district: district ? String(district).trim() : '',
      province: province ? String(province).trim() : '',
      isDefault: Boolean(isDefault)
    };

    // Nếu là default, unset các địa chỉ khác
    if (newAddress.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    // Nếu chưa có địa chỉ nào, đặt mặc định
    if (user.addresses.length === 0) newAddress.isDefault = true;

    user.addresses.push(newAddress);
    await user.save();

    // Trả về danh sách địa chỉ mới để frontend cập nhật nhanh
    const addresses = user.addresses.slice();
    addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    return res.status(201).json({ success: true, message: 'Thêm địa chỉ thành công!', address: user.addresses[user.addresses.length - 1], addresses });
  } catch (error) {
    console.error('addAddress error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thêm địa chỉ.' });
  }
};

// PATCH /api/user/addresses/:id
exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  if (!id) return res.status(400).json({ success: false, message: 'Thiếu id địa chỉ.' });
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật.' });

  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    if (!Array.isArray(user.addresses)) user.addresses = [];

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);
    if (addressIndex === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    const allowed = ['recipientName', 'phoneNumber', 'addressLine', 'ward', 'district', 'province', 'isDefault'];
    allowed.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'isDefault') {
          user.addresses[addressIndex][field] = Boolean(updates[field]);
        } else {
          user.addresses[addressIndex][field] = String(updates[field]).trim();
        }
      }
    });

    // Nếu đặt isDefault true, unset các địa chỉ khác
    if (updates.isDefault === true) {
      user.addresses.forEach((addr, idx) => { if (idx !== addressIndex) addr.isDefault = false; });
      user.addresses[addressIndex].isDefault = true;
    }

    await user.save();

    // Trả về address cập nhật và danh sách mới
    const addresses = user.addresses.slice();
    addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    return res.json({ success: true, message: 'Cập nhật địa chỉ thành công!', address: user.addresses[addressIndex], addresses });
  } catch (error) {
    console.error('updateAddress error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật địa chỉ.' });
  }
};

// DELETE /api/user/addresses/:id
exports.deleteAddress = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Thiếu id địa chỉ.' });

  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    if (!Array.isArray(user.addresses)) user.addresses = [];

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);
    if (addressIndex === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    // Nếu là địa chỉ duy nhất và mặc định, chặn xóa
    if (user.addresses.length === 1 && user.addresses[addressIndex].isDefault) {
      return res.status(400).json({ success: false, message: 'Không thể xóa địa chỉ duy nhất. Vui lòng thêm địa chỉ mới trước.' });
    }

    const removed = user.addresses.splice(addressIndex, 1);

    // Nếu xóa địa chỉ mặc định và còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
    if (removed[0]?.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const addresses = user.addresses.slice();
    addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    return res.json({ success: true, message: 'Xóa địa chỉ thành công!', addresses });
  } catch (error) {
    console.error('deleteAddress error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa địa chỉ.' });
  }
};

// PATCH /api/user/addresses/:id/default
exports.setDefaultAddress = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Thiếu id địa chỉ.' });

  try {
    const userId = ensureUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    if (!Array.isArray(user.addresses)) user.addresses = [];

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);
    if (addressIndex === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    user.addresses.forEach((addr, idx) => { addr.isDefault = idx === addressIndex; });

    await user.save();

    return res.json({ success: true, message: 'Đặt địa chỉ mặc định thành công!', address: user.addresses[addressIndex], addresses: user.addresses });
  } catch (error) {
    console.error('setDefaultAddress error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đặt địa chỉ mặc định.' });
  }
};
