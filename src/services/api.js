import axios from 'axios'

// Products API (JSON Server)
const api = axios.create({
  baseURL: 'http://localhost:5001'
})

// Auth API (Express Backend)
const authApi = axios.create({
  baseURL: 'http://localhost:3000/api'
})

export const loginUser = (email, password) => 
  authApi.post('/auth/login', { email, password })

export const registerUser = (name, email, password) => 
  authApi.post('/auth/register', { name, email, password })

export default api