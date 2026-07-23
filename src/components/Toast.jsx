import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (type, message, { sticky = false } = {}) => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, type, message }])
      if (!sticky) setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  const toast = {
    success: (msg, opts) => push('success', msg, opts),
    // Errors stick around until dismissed — users must never miss a failure.
    error: (msg, opts) => push('error', msg, { sticky: true, ...opts }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:right-4 lg:items-end">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-line bg-surface p-3 shadow-lg"
            >
              {t.type === 'success' ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" />
              ) : (
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-danger"
                />
              )}
              <p className="flex-1 text-sm text-ink">{t.message}</p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="text-ink-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
