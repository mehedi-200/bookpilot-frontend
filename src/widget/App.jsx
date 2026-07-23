import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatIcon, CloseIcon, SendIcon, CheckIcon, SparkIcon } from './icons'

const TOKEN_KEY = 'bookpilot_widget_conversation'

export default function App({ api }) {
  const [open, setOpen] = useState(false)
  const [boot, setBoot] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(null) // the message text to retry
  const [unread, setUnread] = useState(false)
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? ''
    } catch {
      return '' // private mode / blocked storage — chat still works, just won't resume
    }
  })

  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Load the greeting the first time the panel opens, not on page load —
  // an unopened widget should cost the host page nothing.
  useEffect(() => {
    if (!open || boot) return
    api
      .bootstrap()
      .then((data) => {
        setBoot(data)
        setMessages((current) =>
          current.length > 0
            ? current
            : [{ id: 'greeting', role: 'agent', text: data.greeting }]
        )
      })
      .catch(() =>
        setBoot({ business: { name: 'Bookings' }, quick_starts: [] })
      )
  }, [open, boot, api])

  useEffect(() => {
    if (open) {
      setUnread(false)
      inputRef.current?.focus()
    }
  }, [open, messages.length])

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, sending])

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || sending) return

      setInput('')
      setFailed(null)
      setMessages((current) => [
        ...current,
        { id: `u-${Date.now()}`, role: 'user', text: trimmed },
      ])
      setSending(true)

      try {
        const data = await api.chat(trimmed, token)

        if (data.conversation_token && data.conversation_token !== token) {
          setToken(data.conversation_token)
          try {
            localStorage.setItem(TOKEN_KEY, data.conversation_token)
          } catch {
            // ignore — resuming is a nicety, not a requirement
          }
        }

        setMessages((current) => [
          ...current,
          {
            id: `a-${Date.now()}`,
            role: 'agent',
            text: data.reply,
            slots: data.slots,
            booking: data.booking,
          },
        ])

        if (!open) setUnread(true)
      } catch (error) {
        setFailed(trimmed)
        setMessages((current) => [
          ...current,
          {
            id: `e-${Date.now()}`,
            role: 'agent',
            text:
              error.status === 429
                ? 'That’s a lot of messages at once — give it a moment and try again.'
                : 'Sorry, I couldn’t send that. Check your connection and try again.',
            isError: true,
          },
        ])
      } finally {
        setSending(false)
      }
    },
    [api, token, sending, open]
  )

  const businessName = boot?.business?.name ?? 'Bookings'

  return (
    <div className="bp">
      {!open && (
        <button
          type="button"
          className="bp-launcher"
          aria-label={`Chat with ${businessName}`}
          onClick={() => setOpen(true)}
          style={{ position: 'relative' }}
        >
          <ChatIcon />
          {unread && <span className="bp-launcher-dot" />}
        </button>
      )}

      {open && (
        <div
          className="bp-panel"
          role="dialog"
          aria-label={`Chat with ${businessName}`}
        >
          <div className="bp-header">
            <span className="bp-avatar">
              <SparkIcon />
            </span>
            <div>
              <div className="bp-title">{businessName}</div>
              <div className="bp-subtitle">AI booking assistant</div>
            </div>
            <button
              type="button"
              className="bp-icon-btn"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="bp-messages" ref={listRef}>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onPick={send}
                disabled={sending}
              />
            ))}

            {/* Quick starts save the visitor composing a first message. */}
            {messages.length <= 1 &&
              boot?.quick_starts?.length > 0 &&
              !sending && (
                <div className="bp-chips">
                  {boot.quick_starts.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="bp-chip"
                      onClick={() => send(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

            {sending && (
              <div className="bp-row">
                <div
                  className="bp-bubble bp-bubble-agent bp-typing"
                  aria-label="Assistant is typing"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {failed && (
            <div className="bp-error">
              Message not sent.{' '}
              <button
                type="button"
                className="bp-retry"
                onClick={() => send(failed)}
              >
                Try again
              </button>
            </div>
          )}

          <form
            className="bp-composer"
            onSubmit={(event) => {
              event.preventDefault()
              send(input)
            }}
          >
            <input
              ref={inputRef}
              className="bp-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message…"
              maxLength={1000}
              aria-label="Message"
            />
            <button
              type="submit"
              className="bp-send"
              disabled={sending || !input.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Message({ message, onPick, disabled }) {
  if (message.booking) {
    return (
      <>
        <TextRow message={message} />
        <div className="bp-row">
          <div className="bp-card">
            <div className="bp-card-head">
              <CheckIcon /> Booking confirmed
            </div>
            <div className="bp-card-row">{message.booking.service?.name}</div>
            <div className="bp-card-row">
              {formatWhen(message.booking.starts_at)}
            </div>
            <div className="bp-card-ref">
              Reference <strong>{message.booking.reference}</strong> — keep this
              handy.
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TextRow message={message} />
      {message.slots && (
        <SlotChips slots={message.slots} onPick={onPick} disabled={disabled} />
      )}
    </>
  )
}

function TextRow({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`bp-row${isUser ? ' bp-row-user' : ''}`}>
      <div
        className={`bp-bubble ${isUser ? 'bp-bubble-user' : 'bp-bubble-agent'}`}
      >
        {message.text}
      </div>
    </div>
  )
}

const GROUPS = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['evening', 'Evening'],
]

function SlotChips({ slots, onPick, disabled }) {
  const [picked, setPicked] = useState(null)

  return (
    <div className="bp-row">
      <div style={{ maxWidth: '85%' }}>
        {GROUPS.map(([key, label]) => {
          const times = slots[key] ?? []
          if (times.length === 0) return null
          return (
            <div className="bp-group" key={key}>
              <div className="bp-group-label">{label}</div>
              <div className="bp-chips">
                {times.map((slot) => (
                  <button
                    key={slot.starts_at}
                    type="button"
                    className="bp-chip"
                    disabled={disabled || picked !== null}
                    onClick={() => {
                      setPicked(slot.starts_at)
                      onPick(slot.time)
                    }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatWhen(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}
