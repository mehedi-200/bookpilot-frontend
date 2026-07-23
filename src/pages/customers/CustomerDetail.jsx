import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Phone,
  Mail,
  Pencil,
  Trash2,
  CalendarCheck,
  MessageSquare,
} from 'lucide-react'
import Card from '@/components/Card'
import { IconButton } from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import ConfirmModal from '@/components/ConfirmModal'
import Skeleton from '@/components/Skeleton'
import Avatar from '@/components/Avatar'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { friendlyDate, friendlyDateTime } from '@/utils/dates'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/useAuth'
import { customerService } from '@/services/customerService'
import CustomerFormModal from '@/pages/customers/CustomerFormModal'

function MiniCount({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2 text-center">
      <p
        className="text-lg leading-none font-semibold tabular-nums"
        style={{ color: tone }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-ink-muted">{label}</p>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { isAdmin } = useAuth()

  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.get(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => customerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted')
      navigate('/customers')
    },
    onError: () => toast.error('Could not delete the customer'),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="space-y-3">
      <PageHeader
        title={customer.name}
        backTo="/customers"
        actions={
          <>
            <IconButton label="Edit" onClick={() => setEditing(true)}>
              <Pencil size={16} />
            </IconButton>
            {isAdmin && (
              <IconButton label="Delete" onClick={() => setDeleting(true)}>
                <Trash2 size={16} className="text-danger" />
              </IconButton>
            )}
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={customer.name} size="size-14" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">
                {customer.name}
              </p>
              <p className="text-xs text-ink-muted">
                Customer since {friendlyDate(customer.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 text-sm text-ink tabular-nums hover:text-accent"
            >
              <Phone size={15} className="text-ink-muted" />
              {customer.phone}
            </a>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 text-sm text-ink hover:text-accent"
              >
                <Mail size={15} className="text-ink-muted" />
                {customer.email}
              </a>
            )}
          </div>

          <div className="ml-auto flex gap-2">
            <MiniCount
              label="Bookings"
              value={customer.bookings_count ?? 0}
              tone="var(--accent)"
            />
            <MiniCount
              label="Chats"
              value={(customer.conversations ?? []).length}
              tone="var(--grape)"
            />
          </div>
        </div>

        {customer.notes && (
          <p className="mt-3 rounded-lg bg-surface-2 p-2.5 text-sm text-ink">
            {customer.notes}
          </p>
        )}
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title={`Bookings (${customer.bookings_count ?? 0})`}>
          {(customer.bookings ?? []).length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              hint="Bookings made for this customer will appear here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {customer.bookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    to={`/bookings/${booking.id}`}
                    className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">
                        {booking.service?.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {booking.reference} ·{' '}
                        {friendlyDateTime(booking.starts_at)}
                      </p>
                    </div>
                    <StatusChip tone={STATUS_TONES[booking.status]}>
                      {booking.status}
                    </StatusChip>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Conversations">
          {(customer.conversations ?? []).length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              hint="Chats with the AI assistant will appear here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {customer.conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    to={`/conversations/${conversation.id}`}
                    className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">
                        {conversation.preview ?? 'Conversation'}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {friendlyDateTime(
                          conversation.last_activity_at ??
                            conversation.started_at
                        )}
                      </p>
                    </div>
                    <StatusChip tone={STATUS_TONES[conversation.status]}>
                      {conversation.status === 'handed_off'
                        ? 'needs a human'
                        : conversation.status}
                    </StatusChip>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CustomerFormModal
        open={editing}
        customer={customer}
        onClose={() => setEditing(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['customer', id] })
          queryClient.invalidateQueries({ queryKey: ['customers'] })
          setEditing(false)
        }}
      />

      <ConfirmModal
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        danger
        title={`Delete ${customer.name}?`}
        message="Their bookings and conversation history are kept. You can restore them by re-adding the same phone number."
        confirmLabel="Delete customer"
      />
    </div>
  )
}
