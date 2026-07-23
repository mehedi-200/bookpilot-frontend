import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/Spinner'

// Admin-only route guard — staff are sent home, never shown a dead end.
export default function RequireAdmin({ children }) {
  const { user, isLoading, isAdmin } = useAuth()

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={24} />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
