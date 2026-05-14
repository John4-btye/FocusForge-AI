import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Loading from '../components/Loading'

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <Loading label="Loading FocusForge..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
