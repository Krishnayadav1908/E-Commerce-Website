// Get user profile (requires token)
export const getUserProfile = (token) =>
  authApi.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

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

export default api