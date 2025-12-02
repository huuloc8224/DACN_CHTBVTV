
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const categoryFolder = 'general'; 
        const uploadPath = path.join(__dirname, '../public/uploads', categoryFolder); 
        fs.mkdirSync(uploadPath, { recursive: true }); 
        cb(null, uploadPath); 
    },
    filename: function (req, file, cb) {

        const productName = req.body.name || 'default_product'; 

        const slug = productName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '');

        const ext = path.extname(file.originalname);

        cb(null, `${slug}${ext}`);
    }
});

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