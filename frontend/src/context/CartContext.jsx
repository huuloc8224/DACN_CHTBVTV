import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.map(p => p._id === product._id ? { ...p, quantity: (p.quantity || 0) + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1, product: product._id }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p._id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(p => p._id === id ? { ...p, quantity: qty } : p));
  };

  const clearCart = () => setCart([]);

  // totalItems: tổng quantity của tất cả sản phẩm trong giỏ
  const totalItems = cart.reduce((sum, p) => sum + (p.quantity || 0), 0);

  // totalPrice: dùng unitPrice nếu có, fallback p.price
  const totalPrice = cart.reduce((sum, p) => sum + ((p.unitPrice ?? p.price ?? 0) * (p.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
