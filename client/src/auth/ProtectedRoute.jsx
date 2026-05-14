import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Loading from '../components/Loading'

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  // Wait for token restoration before deciding whether to redirect.
  if (loading) {
    return <Loading label="Loading FocusForge..." />
  }

  // Unauthenticated users are sent back to login before seeing private data.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
