// Get user profile (requires token)
export const getUserProfile = (token) =>
  authApi.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

// Update user profile (requires token)
export const updateUserProfile = (token, profileData) =>
  authApi.put('/auth/profile', profileData, { headers: { Authorization: `Bearer ${token}` } });

// Change password (requires token)
export const changeUserPassword = (token, currentPassword, newPassword) =>
  authApi.put('/auth/change-password', { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });

import axios from 'axios'

// Products API (JSON Server)
const api = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API_URL
})

// Auth API (Express Backend)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export const loginUser = (email, password) => 
  authApi.post('/auth/login', { email, password })

export const registerUser = (name, email, password) => 
  authApi.post('/auth/register', { name, email, password })

export const verifyEmailOtp = (email, otp) =>
  authApi.post('/auth/verify-otp', { email, otp })

export const resendEmailOtp = (email) =>
  authApi.post('/auth/resend-otp', { email })

export const getProducts = (params) =>
  authApi.get('/products', { params })

export const getAdminStats = (token) =>
  authApi.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })

export const getAdminOrders = (token, limit) =>
  authApi.get('/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit }
  })

export const getAdminUsers = (token) =>
  authApi.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })

export const getAdminProducts = (token) =>
  authApi.get('/admin/products', { headers: { Authorization: `Bearer ${token}` } })

export const getLowStockProducts = (token, threshold = 10) =>
  authApi.get('/admin/products/low-stock', {
    headers: { Authorization: `Bearer ${token}` },
    params: { threshold }
  })

export const getAdminAuditLogs = (token, limit) =>
  authApi.get('/admin/audit', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit }
  })

export const getEmailLogs = (token, limit = 50, status, type) =>
  authApi.get('/admin/email-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, status, type }
  })

export const retryEmailLog = (token, logId) =>
  authApi.post(`/admin/email-logs/${logId}/retry`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })

export const createAdminProduct = (token, product) =>
  authApi.post('/admin/products', product, {
    headers: { Authorization: `Bearer ${token}` }
  })

export const updateAdminProduct = (token, productId, product) =>
  authApi.patch(`/admin/products/${productId}`, product, {
    headers: { Authorization: `Bearer ${token}` }
  })

export const deleteAdminProduct = (token, productId) =>
  authApi.delete(`/admin/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

export const updateAdminOrderStatus = (token, orderId, status) =>
  authApi.patch(
    `/admin/orders/${orderId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  )

export const updateAdminPaymentStatus = (token, orderId, paymentStatus) =>
  authApi.patch(
    `/admin/orders/${orderId}/payment`,
    { paymentStatus },
    { headers: { Authorization: `Bearer ${token}` } }
  )

export const updateAdminUserRole = (token, userId, role) =>
  authApi.patch(
    `/admin/users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  )

export const getAnalyticsSummary = (token, days = 30) =>
  authApi.get('/admin/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` },
    params: { days }
  })

export const getRevenueTrend = (token, days = 30) =>
  authApi.get('/admin/analytics/revenue-trend', {
    headers: { Authorization: `Bearer ${token}` },
    params: { days }
  })

export const getTopProducts = (token, limit = 10) =>
  authApi.get('/admin/analytics/top-products', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit }
  })

export const getCategoryBreakdown = (token) =>
  authApi.get('/admin/analytics/category-breakdown', {
    headers: { Authorization: `Bearer ${token}` }
  })

export default api