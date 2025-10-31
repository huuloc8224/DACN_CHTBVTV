// backend/controllers/productController.js
const Product = require('../models/Product'); 
const fs = require('fs/promises');
const path = require('path'); 
const { v4: uuidv4 } = require('uuid');
// [SỬA LẠI] Controller lấy tất cả sản phẩm (Thêm logic Filter)
exports.getAllProducts = async (req, res) => {
    try {
        // Lấy các tham số truy vấn (query params)
        const { category, search, active_ingredient, sort } = req.query; // [MỚI] Thêm 'sort'

        // 1. Xây dựng đối tượng Filter
        const filter = {};
        if (category) {
            filter.category = category; 
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' }; 
        }
        if (active_ingredient) {
            filter.active_ingredient = { $regex: active_ingredient, $options: 'i' };
        }

        // 2. [MỚI] Xây dựng đối tượng Sort
        let sortOption = {};
        if (sort === 'price-asc') {
            sortOption = { price: 1 }; // 1 = Tăng dần (Thấp đến Cao)
        } else if (sort === 'price-desc') {
            sortOption = { price: -1 }; // -1 = Giảm dần (Cao đến Thấp)
        } else {
            sortOption = { name: 1 }; // Mặc định sắp xếp theo tên A-Z
        }

        // 3. Tìm sản phẩm trong DB với filter VÀ sort
        const products = await Product.find(filter).sort(sortOption);
        
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
};




// [SỬA LẠI] Hàm createProduct để nhận JSON (Base64)
exports.createProduct = async (req, res) => {
    // Nhận dữ liệu JSON (đã thêm category và imageData)
    const { name, description, price, active_ingredient, stock_quantity, category, imageData } = req.body;
    
    let imagePath = '/images/placeholder.jpg';
    let filePath = null; 

    try {
        if (imageData && typeof imageData === 'string') {
            
            const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length < 3) {
                return res.status(400).json({ message: 'Định dạng dữ liệu ảnh Base64 không hợp lệ.' });
            }
            
            const buffer = Buffer.from(matches[2], 'base64');
            const ext = matches[1].includes('png') ? '.png' : (matches[1].includes('jpeg') ? '.jpeg' : '.jpg');
            
            // [FIX] Dòng 51 (nơi gây lỗi) bây giờ đã hợp lệ
            const filename = `${name.replace(/ /g, '_')}-${uuidv4()}${ext}`; 
            const categoryFolder = category || 'general'; 
            const uploadDir = path.join(__dirname, '../public/uploads', categoryFolder);
            filePath = path.join(uploadDir, filename);

            // [SỬA LỖI] (Dòng 58) Hàm này bây giờ là Promise và hợp lệ
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(filePath, buffer);

            imagePath = `/uploads/${categoryFolder}/${filename}`; 
        }

        const product = new Product({
            name,
            description,
            price: parseFloat(price) || 0,
            active_ingredient,
            stock_quantity: parseInt(stock_quantity) || 0,
            category: category || 'thuoc',
            image_url: imagePath,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error) {
        // [FIX] Xử lý lỗi trùng lặp (E11000)
        if (error.code === 11000) {
            if (filePath) fs.unlink(filePath, () => {}); 
            return res.status(400).json({ message: 'Lỗi: Tên sản phẩm đã tồn tại.' });
        }
        
        console.error("Lỗi tạo sản phẩm (Base64):", error);
        if (filePath) fs.unlink(filePath, () => {}); 
        res.status(400).json({ message: 'Lỗi tạo sản phẩm: ' + error.message });
    }
};
// [MỚI] HÀM CẬP NHẬT SẢN PHẨM (SỬA) - DÙNG BASE64
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, active_ingredient, stock_quantity, category, imageData } = req.body;

    let newImagePath = null; // Đường dẫn URL mới (nếu có)
    let newFilePath = null; // Đường dẫn vật lý mới (để xóa nếu lỗi)
    let oldFilePath = null; // Đường dẫn vật lý cũ (để xóa nếu thành công)

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        // 1. Nếu có ảnh Base64 mới được gửi lên
        if (imageData && typeof imageData === 'string') {
            // Lưu ảnh mới
            const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length < 3) {
                return res.status(400).json({ message: 'Định dạng dữ liệu ảnh Base64 không hợp lệ.' });
            }
            
            const buffer = Buffer.from(matches[2], 'base64');
            const ext = matches[1].includes('png') ? '.png' : (matches[1].includes('jpeg') ? '.jpeg' : '.jpg');
            
            const filename = `${name.replace(/ /g, '_')}-${uuidv4()}${ext}`;
            const categoryFolder = category || 'general';
            const uploadDir = path.join(__dirname, '../public/uploads', categoryFolder);
            newFilePath = path.join(uploadDir, filename);

            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(newFilePath, buffer);

            newImagePath = `/uploads/${categoryFolder}/${filename}`; // URL mới
            
            // Đánh dấu ảnh cũ để xóa
            if (product.image_url && !product.image_url.includes('placeholder.jpg')) {
                oldFilePath = path.join(__dirname, '../public', product.image_url);
            }
        }

        // 2. Cập nhật các trường
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = parseFloat(price) || product.price;
        product.active_ingredient = active_ingredient || product.active_ingredient;
        product.stock_quantity = parseInt(stock_quantity) || product.stock_quantity;
        product.category = category || product.category;
        product.image_url = newImagePath || product.image_url; // Dùng ảnh mới nếu có

        const updatedProduct = await product.save();
        
        // 3. Xóa ảnh cũ (nếu upload ảnh mới thành công)
        if (oldFilePath) {
            await fs.unlink(oldFilePath).catch(err => console.error("Lỗi xóa ảnh cũ:", err));
        }
        
        res.json(updatedProduct);

    } catch (error) {
        // Nếu DB lỗi nhưng đã lỡ upload file mới, xóa file tạm mới
        if (newFilePath) await fs.unlink(newFilePath).catch(console.error);
        res.status(400).json({ message: 'Lỗi cập nhật sản phẩm: ' + error.message });
    }
};

// [MỚI] HÀM LẤY SẢN PHẨM THEO ID (Cần cho trang Chi tiết)
exports.getProductById = async (req, res) => {
try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm này.' });
        }
    } catch (error) {
        console.error("Lỗi tìm sản phẩm theo ID:", error);
        res.status(500).json({ message: 'Lỗi server khi tìm sản phẩm.' });
    }
};

// [MỚI] HÀM XÓA SẢN PHẨM (ADMIN)
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        // 1. Lấy đường dẫn ảnh để xóa file vật lý
        const imageUrl = product.image_url;
        let oldFilePath = null;
        if (imageUrl && !imageUrl.includes('placeholder.jpg')) {
            oldFilePath = path.join(__dirname, '../public', imageUrl);
        }

        // 2. Xóa sản phẩm khỏi MongoDB
        await Product.findByIdAndDelete(productId);

        // 3. Xóa file ảnh vật lý (sau khi đã xóa DB thành công)
        if (oldFilePath) {
            await fs.unlink(oldFilePath).catch(err => console.error("Lỗi xóa file ảnh cũ:", err));
        }

        res.json({ message: 'Sản phẩm đã được xóa thành công.' });

    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.' });
    }
};