import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Attach JWT automatically so individual pages do not repeat auth header logic.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('focusforge_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
