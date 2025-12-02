
const User = require('../models/User');

exports.getUserAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

exports.addAddress = async (req, res) => {
    const { recipientName, phoneNumber, addressLine } = req.body;

    if (!recipientName || !phoneNumber || !addressLine) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const newAddress = {
            recipientName,
            phoneNumber,
            addressLine
        };

        user.addresses.push(newAddress); // Thêm địa chỉ mới vào mảng
        await user.save();
        
        // Trả về địa chỉ vừa tạo
        res.status(201).json(user.addresses[user.addresses.length - 1]); 
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};