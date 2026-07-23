import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '@/services/api'

// Feature-1 stub: token presence only. Feature 2 wires real auth state.
export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!getToken()) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return children
}
