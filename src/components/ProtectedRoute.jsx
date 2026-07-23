import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '@/services/api'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!getToken()) {
    // A visitor landing on the bare root should see the marketing page, not a
    // login form. Deep links still route through login and come back after.
    if (location.pathname === '/') {
      return <Navigate to="/welcome" replace />
    }
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return children
}
