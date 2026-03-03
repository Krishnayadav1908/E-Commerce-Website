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
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const AUTH_EXCLUDED_ROUTES = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/resend-otp', '/auth/refresh', '/auth/logout'];

const getAuthToken = (token) => token || localStorage.getItem('token') || '';

const withAuth = (token, params) => {
  const authToken = getAuthToken(token);
  if (!authToken) {
    const error = new Error('Missing auth token');
    error.code = 'NO_TOKEN';
    throw error;
  }

  return {
    headers: { Authorization: `Bearer ${authToken}` },
    ...(params ? { params } : {})
  };
};

authApi.interceptors.request.use((config) => {
  const requestConfig = { ...config };
  const url = String(requestConfig.url || '');
  const isAuthExcludedRoute = AUTH_EXCLUDED_ROUTES.some((route) => url.includes(route));
  const hasAuthorizationHeader = Boolean(requestConfig.headers?.Authorization);

  if (!isAuthExcludedRoute && !hasAuthorizationHeader) {
    const token = localStorage.getItem('token');
    if (token) {
      requestConfig.headers = {
        ...(requestConfig.headers || {}),
        Authorization: `Bearer ${token}`
      };
    }
  }

  return requestConfig;
});

let refreshRequest = null;

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = authApi
      .post('/auth/refresh', {}, { withCredentials: true })
      .then((response) => {
        const nextToken = response?.data?.token;
        if (!nextToken) {
          throw new Error('No access token returned from refresh');
        }
        localStorage.setItem('token', nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

const clearClientSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('account');
  localStorage.setItem('isUserAuthenticated', 'false');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const statusCode = error?.response?.status;
    const requestUrl = String(originalRequest?.url || '');
    const isAuthExcludedRoute = AUTH_EXCLUDED_ROUTES.some((route) => requestUrl.includes(route));

    if (statusCode === 401 && !originalRequest._retry && !isAuthExcludedRoute) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await refreshAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${refreshedToken}`,
        };
        return authApi(originalRequest);
      } catch (_refreshError) {
        clearClientSession();

        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/sign-in';
        }

        return Promise.reject(error);
      }
    }

    if (statusCode === 401 && isAuthExcludedRoute) {
      clearClientSession();
    }

    return Promise.reject(error);
  }
)

export const loginUser = (email, password) => 
  authApi.post('/auth/login', { email, password })

export const registerUser = (name, email, password) => 
  authApi.post('/auth/register', { name, email, password })

export const verifyEmailOtp = (email, otp) =>
  authApi.post('/auth/verify-otp', { email, otp })

export const resendEmailOtp = (email) =>
  authApi.post('/auth/resend-otp', { email })

export const refreshAuthToken = () =>
  authApi.post('/auth/refresh', {}, { withCredentials: true })

export const logoutUser = () =>
  authApi.post('/auth/logout', {}, { withCredentials: true })

export const getProducts = (params) =>
  authApi.get('/products', { params })

export const getAdminStats = (token) =>
  authApi.get('/admin/stats', withAuth(token))

export const getAdminOrders = (token, limit) =>
  authApi.get('/admin/orders', withAuth(token, { limit }))

export const getAdminUsers = (token) =>
  authApi.get('/admin/users', withAuth(token))

export const getAdminProducts = (token) =>
  authApi.get('/admin/products', withAuth(token))

export const getLowStockProducts = (token, threshold = 10) =>
  authApi.get('/admin/products/low-stock', withAuth(token, { threshold }))

export const getAdminAuditLogs = (token, limit) =>
  authApi.get('/admin/audit', withAuth(token, { limit }))

export const getEmailLogs = (token, limit = 50, status, type) =>
  authApi.get('/admin/email-logs', withAuth(token, { limit, status, type }))

export const retryEmailLog = (token, logId) =>
  authApi.post(`/admin/email-logs/${logId}/retry`, {}, withAuth(token))

export const createAdminProduct = (token, product) =>
  authApi.post('/admin/products', product, withAuth(token))

export const updateAdminProduct = (token, productId, product) =>
  authApi.patch(`/admin/products/${productId}`, product, withAuth(token))

export const deleteAdminProduct = (token, productId) =>
  authApi.delete(`/admin/products/${productId}`, withAuth(token))

export const updateAdminOrderStatus = (token, orderId, status) =>
  authApi.patch(
    `/admin/orders/${orderId}/status`,
    { status },
    withAuth(token)
  )

export const updateAdminPaymentStatus = (token, orderId, paymentStatus) =>
  authApi.patch(
    `/admin/orders/${orderId}/payment`,
    { paymentStatus },
    withAuth(token)
  )

export const updateAdminUserRole = (token, userId, role) =>
  authApi.patch(
    `/admin/users/${userId}/role`,
    { role },
    withAuth(token)
  )

export const getAnalyticsSummary = (token, days = 30) =>
  authApi.get('/admin/analytics/summary', withAuth(token, { days }))

export const getRevenueTrend = (token, days = 30) =>
  authApi.get('/admin/analytics/revenue-trend', withAuth(token, { days }))

export const getTopProducts = (token, limit = 10) =>
  authApi.get('/admin/analytics/top-products', withAuth(token, { limit }))

export const getCategoryBreakdown = (token) =>
  authApi.get('/admin/analytics/category-breakdown', withAuth(token))

export default api