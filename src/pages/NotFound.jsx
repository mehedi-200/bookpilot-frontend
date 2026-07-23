import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-line bg-surface">
      <EmptyState
        icon={Compass}
        title="Page not found"
        hint="The page you're looking for doesn't exist or has moved."
        action={<Button onClick={() => navigate('/')}>Go to Dashboard</Button>}
      />
    </div>
  )
}
