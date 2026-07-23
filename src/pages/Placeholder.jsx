import { Construction } from 'lucide-react'
import EmptyState from '@/components/EmptyState'

// Route placeholder — replaced feature by feature.
export default function Placeholder({ title, feature }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <EmptyState
        icon={Construction}
        title={title}
        hint={`This page is built in Feature ${feature} — see PLAN.md.`}
      />
    </div>
  )
}
