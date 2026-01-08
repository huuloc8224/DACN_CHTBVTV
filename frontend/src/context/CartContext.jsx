import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CART ================= */
  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart || []);
    } catch (err) {
      console.error('fetchCart error:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  /* ================= ADD TO CART ================= */
  const addToCart = async (product, quantity = 1, unitPrice = 0) => {
    if (!product?._id) return;
    try {
      const { data } = await api.post('/cart', {
        product: product._id,
        quantity,
        unitPrice
      });
      setCart(data.cart || []);
    } catch (err) {
      console.error('addToCart error:', err);
      throw err;
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (itemId, quantity) => {
    if (!itemId || quantity < 1) return;
    try {
      const { data } = await api.patch(`/cart/${itemId}`, { quantity });
      setCart(data.cart || []);
    } catch (err) {
      console.error('updateQuantity error:', err);
    }
  };

  /* ================= REMOVE ================= */
  const removeFromCart = async (itemId) => {
    if (!itemId) return;
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.cart || []);
    } catch (err) {
      console.error('removeFromCart error:', err);
    }
  };

  /* ================= CLEAR ================= */
  const clearCart = async () => {
    try {
      const { data } = await api.delete('/cart');
      setCart(data.cart || []);
    } catch (err) {
      console.error('clearCart error:', err);
    }
  };

  /* ================= TOTAL ================= */
  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      ((item.unitPrice ?? item.product?.price ?? 0) *
        (item.quantity || 0)),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
