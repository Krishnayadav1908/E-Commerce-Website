
import axios from 'axios'

// Products API (JSON Server)
const api = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API_URL
})

// Auth API (Express Backend)
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export const loginUser = (email, password) => 
  authApi.post('/auth/login', { email, password })

export const registerUser = (name, email, password) => 
  authApi.post('/auth/register', { name, email, password })

export default api