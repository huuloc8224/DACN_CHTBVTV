// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

const initialCart = JSON.parse(localStorage.getItem('cart')) || [];

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(initialCart);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item._id === product._id);

            if (existingItem) {
                // [SỬA LỖI] Kiểm tra tồn kho trước khi tăng số lượng
                const newQuantity = existingItem.quantity + 1;
                if (newQuantity > product.stock_quantity) {
                    alert(`Không thể thêm! Chỉ còn ${product.stock_quantity} sản phẩm trong kho.`);
                    return prevCart; // Không thay đổi giỏ hàng
                }
                
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: newQuantity } : item
                );
            } else {
                // Thêm mới (nếu tồn kho > 0)
                if (product.stock_quantity <= 0) {
                     alert("Sản phẩm này đã hết hàng!");
                     return prevCart;
                }
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter(item => item._id !== id));
    };

    const updateQuantity = (id, quantity) => {
        setCart((prevCart) => {
            if (quantity <= 0) return prevCart.filter(item => item._id !== id);
            return prevCart.map(item =>
                item._id === id ? { ...item, quantity: quantity } : item
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
