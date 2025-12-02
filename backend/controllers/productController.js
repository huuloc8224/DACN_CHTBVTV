const Product = require('../models/Product'); 
const fs = require('fs/promises');
const path = require('path'); 
const { v4: uuidv4 } = require('uuid');
//Controller lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {

        const { category, search, active_ingredient, sort } = req.query;

        // Xây dựng Filter
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

        //Xây dựng Sort
        let sortOption = {};
        if (sort === 'price-asc') {
            sortOption = { price: 1 }; // Tăng dầ
        } else if (sort === 'price-desc') {
            sortOption = { price: -1 }; //Giảm dần
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




// Hàm createProduct để nhận JSON
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
            
            const filename = `${name.replace(/ /g, '_')}-${uuidv4()}${ext}`; 
            const categoryFolder = category || 'general'; 
            const uploadDir = path.join(__dirname, '../public/uploads', categoryFolder);
            filePath = path.join(uploadDir, filename);

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
        //Xử lý lỗi trùng lặp
        if (error.code === 11000) {
            if (filePath) fs.unlink(filePath, () => {}); 
            return res.status(400).json({ message: 'Lỗi: Tên sản phẩm đã tồn tại.' });
        }
        
        console.error("Lỗi tạo sản phẩm (Base64):", error);
        if (filePath) fs.unlink(filePath, () => {}); 
        res.status(400).json({ message: 'Lỗi tạo sản phẩm: ' + error.message });
    }
};
//HÀM CẬP NHẬT SẢN PHẨM
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, active_ingredient, stock_quantity, category, imageData } = req.body;

    let newImagePath = null; // Đường dẫn URL mới
    let newFilePath = null; // Đường dẫn vật lý mới
    let oldFilePath = null; // Đường dẫn vật lý cũ

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }


        if (imageData && typeof imageData === 'string') {
           
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

            newImagePath = `/uploads/${categoryFolder}/${filename}`;
            
            // Đánh dấu ảnh cũ để xóa
            if (product.image_url && !product.image_url.includes('placeholder.jpg')) {
                oldFilePath = path.join(__dirname, '../public', product.image_url);
            }
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = parseFloat(price) || product.price;
        product.active_ingredient = active_ingredient || product.active_ingredient;
        product.stock_quantity = parseInt(stock_quantity) || product.stock_quantity;
        product.category = category || product.category;
        product.image_url = newImagePath || product.image_url; // Dùng ảnh mới nếu có

        const updatedProduct = await product.save();
        
        //Xóa ảnh cũ (nếu upload ảnh mới thành công)
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

//HÀM LẤY SẢN PHẨM THEO ID
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

//HÀM XÓA SẢN PHẨM (ADMIN)
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        //Lấy đường dẫn ảnh để xóa file vật lý
        const imageUrl = product.image_url;
        let oldFilePath = null;
        if (imageUrl && !imageUrl.includes('placeholder.jpg')) {
            oldFilePath = path.join(__dirname, '../public', imageUrl);
        }

        //Xóa sản phẩm khỏi MongoDB
        await Product.findByIdAndDelete(productId);

        //Xóa file ảnh vật lý (sau khi đã xóa DB thành công)
        if (oldFilePath) {
            await fs.unlink(oldFilePath).catch(err => console.error("Lỗi xóa file ảnh cũ:", err));
        }

        res.json({ message: 'Sản phẩm đã được xóa thành công.' });

    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.' });
    }
};