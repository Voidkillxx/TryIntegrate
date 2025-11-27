import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCart, addToCart as apiAdd, updateCartItem, removeCartItem, clearCartApi } from '../utils/api';
import { calculateSellingPrice } from '../utils/PricingUtils'; 

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. LOAD CART FROM DATABASE
  const refreshCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setCartItems([]);
        setCartCount(0);
        return;
    }
    
    try {
      const data = await fetchCart();
      if (data.cart_items) {
        setCartItems(data.cart_items);
        
        // Calculate total quantity for badge
        const count = data.cart_items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Failed to sync cart", error);
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
      const price = item.product ? item.product.price : 0; 
      const validQuantity = parseInt(item.quantity) || 0;
      return total + (validQuantity * price);
    }, 0);

  // 4. API ACTIONS

  const addToCart = async (productToAdd, quantity = 1) => {
    setLoading(true);
    try {
        // FIX: Pass ID directly if object, or pass ID if already ID
        const productId = productToAdd.id ? productToAdd.id : productToAdd;
        
        // API requires Product ID
        await apiAdd(productId, quantity);
        await refreshCart(); 
        // Success is handled by UI component usually, but we can return true here
        return true;
    } catch (error) {
        // Re-throw so UI handles the alert
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

  // Placeholder for setUser to avoid errors if App.js calls it
  const setUser = (userId) => {
      // You can add logic here if you need to track user ID in context
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        selectedItems,
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