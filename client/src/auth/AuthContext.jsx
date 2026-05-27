/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Auth state is centralized so protected routes and the navbar see the same user.
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      // On refresh, try to rebuild the logged-in user from the stored JWT.
      const token = localStorage.getItem('focusforge_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/me')
        setUser(response.data)
      } catch {
        localStorage.removeItem('focusforge_token')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setLoading(false)
    }

    window.addEventListener('focusforge:auth-expired', handleAuthExpired)
    return () => window.removeEventListener('focusforge:auth-expired', handleAuthExpired)
  }, [])

  async function login(credentials) {
    // Store token first, then expose user state to the rest of the React app.
    const response = await api.post('/login', credentials)
    localStorage.setItem('focusforge_token', response.data.token)
    setUser(response.data.user)
    return response.data.user
  }

  async function signup(values) {
    // Signup returns the same auth shape as login for a seamless first session.
    const response = await api.post('/signup', values)
    localStorage.setItem('focusforge_token', response.data.token)
    setUser(response.data.user)
    return response.data.user
  }

  function logout() {
    // JWT logout is client-side: removing the token blocks future protected calls.
    localStorage.removeItem('focusforge_token')
    setUser(null)
  }

  function updateUser(nextUser) {
    setUser(nextUser)
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updateUser, isAuthenticated: Boolean(user) }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
