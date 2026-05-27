import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
})

// Attach JWT automatically so individual pages do not repeat auth header logic.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('focusforge_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/signup')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('focusforge_token')
      window.dispatchEvent(new Event('focusforge:auth-expired'))
    }

    return Promise.reject(error)
  },
)

export default api
