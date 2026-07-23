import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounce = 300,
  className = '',
  ...props
}) {
  const [inner, setInner] = useState(value ?? '')
  const timer = useRef()

  useEffect(() => setInner(value ?? ''), [value])

  const handle = (next) => {
    setInner(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange?.(next), debounce)
  }

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        value={inner}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-lg border border-line bg-surface pr-8 pl-9 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none lg:min-h-9 lg:text-sm"
        {...props}
      />
      {inner && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => handle('')}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted hover:text-ink"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
