import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Wrench,
  ChevronRight,
  UserRound,
  Phone,
  CalendarCheck,
  LifeBuoy,
  Coins,
} from 'lucide-react'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { conversationService } from '@/services/conversationService'
import { friendlyDateTime, timeLabel } from '@/utils/dates'

// Friendly names for the agent's tools — the owner shouldn't have to read code.
const TOOL_LABELS = {
  list_services: 'Looked up services',
  check_availability: 'Checked availability',
  create_booking: 'Created a booking',
  reschedule_booking: 'Rescheduled a booking',
  cancel_booking: 'Cancelled a booking',
  handoff_to_human: 'Asked for a human',
}

export default function ConversationDetail() {
  const { id } = useParams()

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.get(id),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  if (!conversation) return null

  // Tool results are stored on their own row; the input lives on the assistant
  // turn that requested it. Match them up by tool_use_id.
  const toolInputs = {}
  conversation.messages.forEach((message) => {
    ;(message.tool_calls ?? []).forEach((call) => {
      toolInputs[call.id] = call.input
    })
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title={conversation.contact_name}
        backTo="/conversations"
        actions={
          <StatusChip tone={STATUS_TONES[conversation.status]}>
            {conversation.status === 'handed_off' ? 'needs a human' : conversation.status}
          </StatusChip>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          {conversation.customer_id ? (
            <Link
              to={`/customers/${conversation.customer_id}`}
              className="flex items-center gap-1.5 text-accent hover:underline"
            >
              <UserRound size={14} /> {conversation.contact_name}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5">
              <UserRound size={14} /> {conversation.contact_name}
            </span>
          )}
          {conversation.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> {conversation.phone}
            </span>
          )}
          <span>Started {friendlyDateTime(conversation.started_at)}</span>
          {conversation.tokens_used > 0 && (
            <span className="flex items-center gap-1.5" title="Claude tokens used">
              <Coins size={14} /> {conversation.tokens_used.toLocaleString()} tokens
            </span>
          )}
        </div>

        {conversation.bookings?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            {conversation.bookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink transition-colors hover:border-accent"
              >
                <CalendarCheck size={13} className="text-ok" />
                {booking.reference} · {booking.service?.name}
                <StatusChip tone={STATUS_TONES[booking.status]}>{booking.status}</StatusChip>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {conversation.status === 'handed_off' && (
        <div className="rounded-xl border border-line border-l-4 border-l-grape bg-surface p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <LifeBuoy size={16} className="text-grape" />
            This conversation needs a human
          </p>
          {conversation.handoff_reason && (
            <p className="mt-1 text-sm text-ink-muted">{conversation.handoff_reason}</p>
          )}
        </div>
      )}

      <Card title="Transcript">
        <div className="space-y-3">
          {conversation.messages.map((message) => {
            if (message.role === 'tool') {
              return (
                <ToolRow
                  key={message.id}
                  message={message}
                  input={toolInputs[message.tool_use_id]}
                />
              )
            }

            // Assistant turns that only requested tools have no text to show.
            if (!message.content) return null

            const isUser = message.role === 'user'
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-surface-2 text-ink'
                  }`}
                >
                  {message.content}
                  <span
                    className={`mt-1 block text-[11px] ${
                      isUser ? 'text-accent-contrast/70' : 'text-ink-muted'
                    }`}
                  >
                    {timeLabel(message.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function ToolRow({ message, input }) {
  const [open, setOpen] = useState(false)
  const failed = message.tool_result?.error

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <Wrench size={12} className={failed ? 'text-warn' : ''} />
          <span>{TOOL_LABELS[message.tool_name] ?? message.tool_name}</span>
          {failed && <span className="text-warn">· didn’t work</span>}
          <ChevronRight
            size={13}
            className={`ml-auto transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </button>

        {open && (
          <div className="mt-1 space-y-2 rounded-lg bg-surface-2 p-2.5 text-[11px]">
            {input && Object.keys(input).length > 0 && (
              <div>
                <p className="mb-0.5 font-medium text-ink-muted">Asked for</p>
                <pre className="overflow-x-auto text-ink">
                  {JSON.stringify(input, null, 2)}
                </pre>
              </div>
            )}
            <div>
              <p className="mb-0.5 font-medium text-ink-muted">Got back</p>
              <pre className="max-h-60 overflow-auto text-ink">
                {JSON.stringify(message.tool_result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
