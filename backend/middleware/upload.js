// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // [ĐÃ SỬA] Luôn sử dụng thư mục lưu trữ chung 'general'
        const categoryFolder = 'general'; 
        const uploadPath = path.join(__dirname, '../public/uploads', categoryFolder); 
        fs.mkdirSync(uploadPath, { recursive: true }); 
        cb(null, uploadPath); 
    },
    filename: function (req, file, cb) {
        // [SỬA LỖI] Lấy tên sản phẩm từ FormData
        const productName = req.body.name || 'default_product'; 
        
        // Chuyển tên sản phẩm thành tên file an toàn (slug)
        const slug = productName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '');
        
        // Lấy phần mở rộng (extension) của file gốc
        const ext = path.extname(file.originalname);

        // [ĐÃ SỬA] Tên file cuối cùng: CHỈ CÓ TÊN SẢN PHẨM (đã slugify)
        cb(null, `${slug}${ext}`);
    }
});

// Middleware Multer (giữ nguyên)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh (jpeg/png/jpg)'), false);
        }
    }
}).single('imageFile'); 

module.exports = upload;