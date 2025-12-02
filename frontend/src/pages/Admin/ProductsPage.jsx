// src/pages/Admin/ProductsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Package, PlusCircle, Edit2, Trash2, Image, Tag, Database, Loader2 as Loader } from 'lucide-react';
import api from '../../services/api';

const CATEGORY_OPTIONS = [
  { value: 'thuoc', label: 'Thuốc BVTV' },
  { value: 'phan', label: 'Phân Bón' },
  { value: 'thucan', label: 'Thức Ăn Chăn Nuôi' }
];
const formatCurrency = (v) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;
const getCategoryName = (code) => CATEGORY_OPTIONS.find(c => c.value === code)?.label || code || 'Khác';

const ProductsPage = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [products, setProducts] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock_quantity: '', active_ingredient: '',
    category: 'thuoc', imageFile: null
  });
  const [previewImg, setPreviewImg] = useState('');

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageFile: reader.result }));
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !formData.imageFile) {
      showToast('error', 'Vui lòng chọn hình ảnh sản phẩm');
      return;
    }
    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      stock_quantity: Number(formData.stock_quantity) || 0,
      imageData: formData.imageFile
    };
    try {
      if (isEditing) {
        await api.put(`/products/${editingId}`, payload);
        showToast('success', 'Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', payload);
        showToast('success', 'Thêm sản phẩm mới thành công!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock_quantity: '', active_ingredient: '', category: 'thuoc', imageFile: null });
    setPreviewImg('');
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setIsEditing(true);
    setEditingId(p._id);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock_quantity: p.stock_quantity,
      active_ingredient: p.active_ingredient || '',
      category: p.category,
      imageFile: null
    });
    setPreviewImg(p.image_url ? `http://localhost:3001${p.image_url}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!confirm('Xóa sản phẩm này vĩnh viễn?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('success', 'Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      showToast('error', 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Package className="w-10 h-10 text-green-600" />
        {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-2xl shadow-inner space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phân loại</label>
            <select
              name="category"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
            >
              {CATEGORY_OPTIONS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hoạt chất chính</label>
            <input
              type="text"
              value={formData.active_ingredient}
              onChange={e => setFormData(prev => ({ ...prev, active_ingredient: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-5 h-5" /> {isEditing ? 'Chọn ảnh mới (nếu cần)' : 'Hình ảnh sản phẩm'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg bg-white"
              required={!isEditing}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={e => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
              min="0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Xem trước ảnh</label>
            {previewImg ? (
              <img src={previewImg} alt="Preview" className="w-32 h-32 object-cover rounded-lg border shadow" />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            required
          ></textarea>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
            <PlusCircle className="w-6 h-6" />
            {isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="px-8 bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition">
              Hủy
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Database className="w-8 h-8" /> Danh sách sản phẩm ({products.length})</h3>
        <div className="overflow-x-auto rounded-xl shadow-lg border">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader className="w-10 h-10 animate-spin text-green-600" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Ảnh</th>
                  <th className="text-left p-4">Tên</th>
                  <th className="text-left p-4">Loại</th>
                  <th className="text-right p-4">Giá</th>
                  <th className="text-center p-4">Tồn</th>
                  <th className="text-center p-4">Sửa</th>
                  <th className="text-center p-4">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{p._id.slice(-6)}</td>
                    <td className="p-4"><img src={`http://localhost:3001${p.image_url}`} alt={p.name} className="w-12 h-12 object-cover rounded" /></td>
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4">{getCategoryName(p.category)}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(p.price)}</td>
                    <td className="p-4 text-center">{p.stock_quantity}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-5 h-5" /></button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl text-white font-bold shadow-2xl transition ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
