import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import DataList from '@/components/DataList'
import Button from '@/components/Button'
import SearchInput from '@/components/SearchInput'
import { customerService } from '@/services/customerService'
import { friendlyDate } from '@/utils/dates'
import CustomerFormModal from '@/pages/customers/CustomerFormModal'
import Avatar from '@/components/Avatar'

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

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <DataList
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (c) => (
              <span className="flex items-center gap-2.5 font-medium">
                <Avatar name={c.name} />
                {c.name}
              </span>
            ),
          },
          { key: 'phone', header: 'Phone', className: 'text-ink-muted' },
          {
            key: 'email',
            header: 'Email',
            className: 'text-ink-muted',
            render: (c) => c.email ?? '—',
          },
          {
            key: 'bookings_count',
            header: 'Bookings',
            render: (c) => (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink">
                {c.bookings_count}
              </span>
            ),
          },
          {
            key: 'created_at',
            header: 'Added',
            className: 'text-ink-muted',
            render: (c) => friendlyDate(c.created_at),
          },
        ]}
        rows={rows}
        loading={isLoading}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        renderCard={(c) => (
          <div className="flex items-center gap-3">
            <Avatar name={c.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{c.name}</p>
              <p className="truncate text-xs text-ink-muted">{c.phone}</p>
            </div>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink">
              {c.bookings_count} bookings
            </span>
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
            ? undefined
            : 'They’ll appear here automatically when the AI books for them — or add one yourself.',
          action: !q && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} /> Add customer
            </Button>
          ),
        }}
        pagination={{
          meta,
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
