/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
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

  async function login(credentials) {
    const response = await api.post('/login', credentials)
    localStorage.setItem('focusforge_token', response.data.token)
    setUser(response.data.user)
    return response.data.user
  }

  async function signup(values) {
    const response = await api.post('/signup', values)
    localStorage.setItem('focusforge_token', response.data.token)
    setUser(response.data.user)
    return response.data.user
  }

  function logout() {
    localStorage.removeItem('focusforge_token')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, isAuthenticated: Boolean(user) }),
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
