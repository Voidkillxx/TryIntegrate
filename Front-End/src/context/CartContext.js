import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCart, addToCart as apiAdd, updateCartItem, removeCartItem, clearCartApi } from '../utils/api';
import { calculateSellingPrice } from '../utils/PricingUtils'; 

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // FIX: Initialize from sessionStorage so selection survives page refreshes/navigation
  const [selectedItems, setSelectedItems] = useState(() => {
    try {
        const saved = sessionStorage.getItem('cart_selected_items');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  const [cartCount, setCartCount] = useState(0);
  // FIX: Start loading as true to prevent "No Items" flash before data loads
  const [loading, setLoading] = useState(true); 

  // FIX: Save to sessionStorage whenever selection changes
  useEffect(() => {
    sessionStorage.setItem('cart_selected_items', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // 1. LOAD CART FROM DATABASE
  const refreshCart = async () => {
    // Only set loading if we don't have items yet (prevents UI flicker)
    if(cartItems.length === 0) setLoading(true); 
    
    const token = localStorage.getItem('token');
    if (!token) {
        setCartItems([]);
        setCartCount(0);
        setLoading(false);
        return;
    }
    
    try {
      const data = await fetchCart();
      if (data.cart_items) {
        setCartItems(data.cart_items);
        const count = data.cart_items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Failed to sync cart", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    refreshCart();
  }, []);

  // 2. SELECTION LOGIC
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(itemId)
        ? prevSelected.filter(id => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // 3. CALCULATION LOGIC
  const selectedSubtotal = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((total, item) => {
      if (!item.product) return total;
      const validQuantity = parseInt(item.quantity) || 0;
      const finalPrice = calculateSellingPrice(item.product.price, item.product.discount);
      return total + (validQuantity * finalPrice);
    }, 0);

  // 4. API ACTIONS
  const addToCart = async (productToAdd, quantity = 1) => {
    setLoading(true);
    try {
        const productId = productToAdd.id ? productToAdd.id : productToAdd;
        await apiAdd(productId, quantity);
        await refreshCart(); 
        return true;
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!window.confirm("Remove item?")) return;
    try {
        await removeCartItem(cartItemId);
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
        await refreshCart();
    } catch (error) {
        console.error(error);
    }
  };

  const increaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (item) {
        try {
            await updateCartItem(cartItemId, item.quantity + 1);
            await refreshCart();
        } catch(e) {}
    }
  };

  const decreaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (item && item.quantity > 1) {
        try {
            await updateCartItem(cartItemId, item.quantity - 1);
            await refreshCart();
        } catch(e) {}
    }
  };

  const clearCart = async () => {
    try {
        await clearCartApi();
        setCartItems([]);
        setSelectedItems([]);
    } catch(e) {}
  };

  const removeSelectedItems = async () => {
    for (const id of selectedItems) {
        await removeCartItem(id);
    }
    setSelectedItems([]);
    await refreshCart();
  };

  const setUser = (userId) => { };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        selectedItems,
        setSelectedItems,
        selectedSubtotal,
        loading,
        toggleSelectItem,
        toggleSelectAll,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        removeSelectedItems,
        refreshCart,
        setUser
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);