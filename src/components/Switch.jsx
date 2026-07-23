export default function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      // Track 44×24 with 2px padding = a 40×20 content box that fits the 20px
      // knob exactly. The knob is placed by flex + translate (never by static
      // position), so it cannot drift outside the track. The unchecked outline
      // is an inset shadow so it adds no layout size.
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-50 ${
        checked
          ? 'bg-accent'
          : 'bg-surface-2 shadow-[inset_0_0_0_1px_var(--line)]'
      } after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-['']`}
    >
      <span
        className={`block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
