import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Mail, Pencil, Trash2, CalendarCheck, MessageSquare } from 'lucide-react'
import Card from '@/components/Card'
import Button, { IconButton } from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import ConfirmModal from '@/components/ConfirmModal'
import Skeleton from '@/components/Skeleton'
import Avatar from '@/components/Avatar'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/useAuth'
import { customerService } from '@/services/customerService'
import CustomerFormModal from '@/pages/customers/CustomerFormModal'

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
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="mx-auto max-w-3xl space-y-4">
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
        <div className="flex items-start gap-4">
          <Avatar name={customer.name} size="size-12" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-base font-semibold text-ink">{customer.name}</p>
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <Phone size={14} />
              <a href={`tel:${customer.phone}`} className="text-accent hover:underline">
                {customer.phone}
              </a>
            </p>
            {customer.email && (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <Mail size={14} />
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              </p>
            )}
            {customer.notes && (
              <p className="rounded-lg bg-surface-2 p-2.5 text-sm text-ink">{customer.notes}</p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Bookings">
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          hint="This customer's bookings will appear here once the booking engine lands (Feature 5)."
        />
      </Card>

      <Card title="Conversations">
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          hint="Chats with the AI assistant will appear here (Feature 6)."
        />
      </Card>

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
