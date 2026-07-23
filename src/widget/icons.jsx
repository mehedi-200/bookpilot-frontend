// Hand-rolled inline SVGs — pulling in an icon library would multiply the
// widget bundle for six glyphs.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ChatIcon = (props) => (
  <svg {...base} width="24" height="24" {...props}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5a8.4 8.4 0 0 1-.9-3.8 8.4 8.4 0 0 1 8.4-9 8.4 8.4 0 0 1 8.6 8.3Z" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...base} width="18" height="18" {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const SendIcon = (props) => (
  <svg {...base} width="18" height="18" {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...base} width="16" height="16" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const SparkIcon = (props) => (
  <svg {...base} width="16" height="16" {...props}>
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>
)
