import { useQuery } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import api from '@/services/api'

// Temporary Feature-0 page: proves API + CORS + providers work.
// Replaced by the real app shell in Feature 1.
function SetupCheck() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ping'],
    queryFn: () => api.get('/ping').then((res) => res.data),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
        <h1 className="text-2xl font-semibold">BookPilot</h1>
        <p className="mt-3 text-sm text-neutral-400">
          {isLoading && 'Checking API connection…'}
          {isError && '❌ API unreachable — is the backend running?'}
          {data?.success && `✅ ${data.message}`}
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="*" element={<SetupCheck />} />
    </Routes>
  )
}

export default App
