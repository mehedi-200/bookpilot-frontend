import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, PartyPopper, X } from 'lucide-react'
import { IconButton } from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Spinner from '@/components/Spinner'
import { notificationService } from '@/services/searchService'
import { friendlyDateTime } from '@/utils/dates'

// Where each type sends you when clicked.
const LINKS = {
  ai_booking: (data) => `/bookings/${data?.booking_id}`,
  booking_cancelled: (data) => `/bookings/${data?.booking_id}`,
  sync_failed: (data) => `/bookings/${data?.booking_id}`,
  handoff: (data) => `/conversations/${data?.conversation_id}`,
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.unreadCount,
    refetchInterval: 30_000,
  })

  const { data: list, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationService.list({ per_page: 15 }),
    enabled: open, // only fetch the list when someone actually looks
  })

  useEffect(() => {
    const onClickAway = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: invalidate,
  })

  const openNotification = (notification) => {
    setOpen(false)
    if (!notification.read_at) markRead.mutate(notification.id)
    const link = LINKS[notification.type]?.(notification.data)
    if (link && !link.includes('undefined')) navigate(link)
  }

  const rows = list?.data ?? []

  const panel = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="text-sm font-semibold text-ink">Notifications</p>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <IconButton
            label="Close"
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </IconButton>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto lg:max-h-96">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size={18} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="You're all caught up"
            hint="New AI bookings and anything needing a human land here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-2 ${
                    notification.read_at ? '' : 'bg-accent/5'
                  }`}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      notification.read_at ? 'bg-transparent' : 'bg-accent'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {notification.title}
                    </span>
                    {notification.body && (
                      <span className="block text-sm text-ink-muted">
                        {notification.body}
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {friendlyDateTime(notification.created_at)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )

  return (
    <div ref={containerRef} className="relative">
      <IconButton label="Notifications" onClick={() => setOpen((o) => !o)}>
        <span className="relative">
          <Bell size={19} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
      </IconButton>

      {/* Desktop: dropdown. Mobile: full-screen sheet. */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 flex flex-col bg-surface pt-[env(safe-area-inset-top)] lg:hidden">
            {panel}
          </div>
          <div className="absolute right-0 z-50 mt-2 hidden w-96 overflow-hidden rounded-xl border border-line bg-surface shadow-lg lg:block">
            {panel}
          </div>
        </>
      )}
    </div>
  )
}
