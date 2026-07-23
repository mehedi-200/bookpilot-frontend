import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { getToken, setToken, clearToken } from '@/services/api'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: !!getToken(),
    staleTime: 5 * 60_000,
  })

  const login = async (email, password) => {
    const { user: loggedIn, token } = await authService.login(email, password)
    setToken(token)
    queryClient.setQueryData(['profile'], loggedIn)
    return loggedIn
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Token may already be dead — local cleanup matters either way.
    }
    clearToken()
    queryClient.clear()
  }

  return {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  }
}

// Small helper: push Laravel 422 errors into react-hook-form fields.
export function applyServerErrors(error, setError) {
  const errors = error?.response?.data?.errors
  if (!errors) return false
  Object.entries(errors).forEach(([field, messages]) => {
    setError(field, { type: 'server', message: messages[0] })
  })
  return true
}
