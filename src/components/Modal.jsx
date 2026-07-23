import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from '@/components/Button'

// Desktop: centered dialog. Mobile/tablet: bottom sheet with drag handle.
export default function Modal({ open, onClose, title, footer, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90dvh] w-full flex-col rounded-t-2xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:max-h-[85vh] lg:w-full lg:max-w-lg lg:rounded-xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line lg:hidden" />
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 lg:pt-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-4 py-2">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
