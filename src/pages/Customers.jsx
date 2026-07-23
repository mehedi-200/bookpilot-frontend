import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Phone, Mail, CalendarCheck } from 'lucide-react'
import DataList from '@/components/DataList'
import Button from '@/components/Button'
import SearchInput from '@/components/SearchInput'
import Avatar from '@/components/Avatar'
import { customerService } from '@/services/customerService'
import { friendlyDate } from '@/utils/dates'
import CustomerFormModal from '@/pages/customers/CustomerFormModal'

/** Bookings count reads as a status, not a raw number. */
function BookingsBadge({ count }) {
  if (!count) {
    return <span className="text-xs text-ink-muted">No bookings</span>
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        color: 'var(--accent)',
        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
      }}
    >
      <CalendarCheck size={12} />
      {count} {count === 1 ? 'booking' : 'bookings'}
    </span>
  )
}

export default function Customers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)

  const params = { page, per_page: perPage, q: q || undefined }
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.list(params),
    placeholderData: (prev) => prev,
  })

  return (
    <>
      <DataList
        columns={[
          {
            key: 'name',
            header: 'Customer',
            render: (c) => (
              <span className="flex items-center gap-3">
                <Avatar name={c.name} size="size-9" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {c.email ?? 'No email on file'}
                  </span>
                </span>
              </span>
            ),
          },
          {
            key: 'phone',
            header: 'Phone',
            render: (c) => (
              <a
                href={`tel:${c.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm text-ink tabular-nums hover:text-accent"
              >
                <Phone size={13} className="text-ink-muted" />
                {c.phone}
              </a>
            ),
          },
          {
            key: 'bookings_count',
            header: 'Activity',
            render: (c) => <BookingsBadge count={c.bookings_count} />,
          },
          {
            key: 'created_at',
            header: 'Added',
            className: 'text-right text-ink-muted whitespace-nowrap',
            render: (c) => friendlyDate(c.created_at),
          },
        ]}
        rows={data?.data ?? []}
        loading={isLoading}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        renderCard={(c) => (
          <div className="flex items-start gap-3">
            <Avatar name={c.name} size="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{c.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted tabular-nums">
                <Phone size={12} />
                {c.phone}
              </p>
              {c.email && (
                <p className="flex items-center gap-1.5 truncate text-xs text-ink-muted">
                  <Mail size={12} />
                  {c.email}
                </p>
              )}
              <div className="mt-2">
                <BookingsBadge count={c.bookings_count} />
              </div>
            </div>
          </div>
        )}
        toolbar={
          <>
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} /> Add customer
            </Button>
            <SearchInput
              className="w-full md:ml-auto md:w-64"
              placeholder="Search name or phone…"
              value={q}
              onChange={(next) => {
                setQ(next)
                setPage(1)
              }}
            />
          </>
        }
        empty={{
          icon: Users,
          title: q ? `No customers matching “${q}”` : 'No customers yet',
          hint: q
            ? 'Phone numbers match however they’re written — try just the digits.'
            : 'They’re created automatically when the AI books someone — or add one yourself.',
          action: !q && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} /> Add customer
            </Button>
          ),
        }}
        pagination={{
          meta: data?.meta,
          onPage: setPage,
          onPerPage: (n) => {
            setPerPage(n)
            setPage(1)
          },
          onRefresh: refetch,
          refreshing: isFetching,
        }}
      />

      <CustomerFormModal
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(customer) => {
          queryClient.invalidateQueries({ queryKey: ['customers'] })
          setAdding(false)
          navigate(`/customers/${customer.id}`)
        }}
      />
    </>
  )
}
