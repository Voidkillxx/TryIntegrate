// Base URL for your Laravel API
const BASE_URL = 'http://localhost:8095/api';

/**
 * Generic Fetch Wrapper
 * Handles Headers (JSON + Authorization) and Errors
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    // Helper: If API returns a paginated object { data: [...] }, return the data array directly for easier frontend use in lists
    // But we keep the original structure if it's not a list or if we need pagination metadata later.
    // For simplicity in your components right now, I will return data exactly as is, 
    // and we handle the .data property in the components (App.js / ProductList.js).
    return data;

  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// --- API ENDPOINTS ---

// 1. AUTHENTICATION
export const loginUser = (creds) => apiRequest('/login', 'POST', creds);
export const registerUser = (data) => apiRequest('/register', 'POST', data);
export const verifyOtp = (data) => apiRequest('/otp/verify', 'POST', data);
export const checkOtpPublic = (data) => apiRequest('/otp/check', 'POST', data); // For forgot password flow
export const resendOtp = (data) => apiRequest('/resend-otp', 'POST', data);
export const logoutUser = () => apiRequest('/logout', 'POST');

// 2. PASSWORD RESET
export const forgotPassword = (data) => apiRequest('/forgot-password', 'POST', data);
export const resetPassword = (data) => apiRequest('/reset-password', 'POST', data);

// 3. CATALOG (Products & Categories)
export const fetchProducts = (page = 1, search = '', categorySlug = null) => {
  let query = `?page=${page}`;
  if (search) query += `&search=${search}`;
  if (categorySlug) query += `&category=${categorySlug}`;
  
  return apiRequest(`/products${query}`);
};
export const fetchProduct = (id) => apiRequest(`/products/${id}`);
export const fetchSingleProduct = (productId) => apiRequest(`/products/${productId}`);
export const fetchCategories = () => apiRequest('/categories');
export const fetchCategory = (id) => apiRequest(`/categories/${id}`);

// 4. USER PROFILE & SECURITY
export const fetchProfile = () => apiRequest('/user/profile');
export const updateProfile = (data) => apiRequest('/user/profile', 'PUT', data);
export const requestProfileOtp = () => apiRequest('/user/request-otp', 'POST');
export const checkProfileOtp = (data) => apiRequest('/user/check-otp', 'POST', data);
export const changePassword = (data) => apiRequest('/user/password', 'PUT', data);
export const changeEmail = (data) => apiRequest('/user/email', 'PUT', data);

// 5. CART
export const fetchCart = () => apiRequest('/cart');
export const addToCart = (productId, qty = 1) => apiRequest('/cart/items', 'POST', { product_id: productId, quantity: qty });
export const updateCartItem = (itemId, qty) => apiRequest(`/cart/items/${itemId}`, 'PUT', { quantity: qty });
export const removeCartItem = (itemId) => apiRequest(`/cart/items/${itemId}`, 'DELETE');
export const clearCartApi = () => apiRequest('/cart/clear', 'DELETE');

// 6. ORDERS
export const checkout = (data) => apiRequest('/checkout', 'POST', data);
export const fetchOrders = () => apiRequest('/orders');
export const fetchOrder = (id) => apiRequest(`/orders/${id}`);
export const cancelOrder = (id) => apiRequest(`/orders/${id}/cancel`, 'PUT');

// 7. ADMIN (Products, Categories, Users)
export const createProduct = (data) => apiRequest('/products', 'POST', data);
export const updateProduct = (id, data) => apiRequest(`/products/${id}`, 'PUT', data);
export const deleteProduct = (id) => apiRequest(`/products/${id}`, 'DELETE');

export const createCategory = (data) => apiRequest('/categories', 'POST', data);
export const updateCategory = (id, data) => apiRequest(`/categories/${id}`, 'PUT', data);
export const deleteCategory = (id) => apiRequest(`/categories/${id}`, 'DELETE');

export const updateOrderStatus = (id, status) => apiRequest(`/admin/orders/${id}/status`, 'PUT', { status });

export const fetchUsers = () => apiRequest('/users');
export const updateUserRole = (id, isAdmin) => apiRequest(`/users/${id}`, 'PUT', { is_admin: isAdmin });
