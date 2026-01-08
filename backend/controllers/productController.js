const Product = require('../models/Product');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, active_ingredient, disease, sort } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (active_ingredient) {
      filter.activeIngredients = { $regex: active_ingredient, $options: 'i' };
    }

    if (disease) {
      filter.treats = { $in: [disease] };
    }

    let sortOption = { name: 1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (err) {
    console.error('GET PRODUCTS ERROR:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
  }
};


exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    activeIngredients,
    stock_quantity,
    category,
    treats,
    imageData
  } = req.body;

  let imagePath = '/images/placeholder.jpg';
  let filePath = null;

  try {
    if (imageData && typeof imageData === 'string') {
      const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Ảnh Base64 không hợp lệ' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const ext = matches[1].includes('png')
        ? '.png'
        : matches[1].includes('jpeg')
        ? '.jpeg'
        : '.jpg';

      const filename = `${name.replace(/\s+/g, '_')}-${uuidv4()}${ext}`;
      const folder = category || 'general';
      const uploadDir = path.join(__dirname, '../public/uploads', folder);
      filePath = path.join(uploadDir, filename);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);

      imagePath = `/uploads/${folder}/${filename}`;
    }

    const product = new Product({
      name,
      description,
      price: Number(price) || 0,
      activeIngredients: Array.isArray(activeIngredients) ? activeIngredients : [],
      stock_quantity: Number(stock_quantity) || 0,
      category: category || 'thuoc',
      treats: Array.isArray(treats) ? treats : [],
      image_url: imagePath
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    if (filePath) await fs.unlink(filePath).catch(() => {});
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
    }
    res.status(400).json({ message: 'Lỗi tạo sản phẩm: ' + err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    activeIngredients,
    stock_quantity,
    category,
    treats,
    imageData
  } = req.body;

  let newFilePath = null;
  let oldFilePath = null;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (imageData && typeof imageData === 'string') {
      const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Ảnh Base64 không hợp lệ' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const ext = matches[1].includes('png')
        ? '.png'
        : matches[1].includes('jpeg')
        ? '.jpeg'
        : '.jpg';

      const filename = `${(name || product.name).replace(/\s+/g, '_')}-${uuidv4()}${ext}`;
      const folder = category || product.category || 'general';
      const uploadDir = path.join(__dirname, '../public/uploads', folder);
      newFilePath = path.join(uploadDir, filename);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(newFilePath, buffer);

      if (product.image_url && !product.image_url.includes('placeholder')) {
        oldFilePath = path.join(__dirname, '../public', product.image_url);
      }

      product.image_url = `/uploads/${folder}/${filename}`;
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.activeIngredients = Array.isArray(activeIngredients)
      ? activeIngredients
      : product.activeIngredients;
    product.stock_quantity =
      stock_quantity !== undefined ? Number(stock_quantity) : product.stock_quantity;
    product.category = category ?? product.category;
    product.treats = Array.isArray(treats) ? treats : product.treats;

    const updated = await product.save();

    if (oldFilePath) {
      await fs.unlink(oldFilePath).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    if (newFilePath) await fs.unlink(newFilePath).catch(() => {});
    res.status(400).json({ message: 'Lỗi cập nhật sản phẩm: ' + err.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    if (product.image_url && !product.image_url.includes('placeholder')) {
      const filePath = path.join(__dirname, '../public', product.image_url);
      await fs.unlink(filePath).catch(() => {});
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
  }
};
