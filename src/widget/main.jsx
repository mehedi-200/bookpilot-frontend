import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createApi } from './api'
import styles from './widget.css?inline'

/**
 * Entry point for the embeddable widget:
 *
 *   <script src="https://app.example.com/widget.js"
 *           data-widget-key="bp_live_…" defer></script>
 *
 * Everything renders inside a shadow root, so the host page's CSS can't reach
 * in and ours can't leak out.
 */
function boot() {
  const script =
    document.currentScript ?? document.querySelector('script[data-widget-key]')

  const widgetKey = script?.dataset.widgetKey

  if (!widgetKey) {
    // Nothing to authenticate with — stay invisible rather than shout on
    // someone else's website.
    return
  }

  if (document.getElementById('bookpilot-widget')) return // already mounted

  const apiUrl = (
    script?.dataset.apiUrl ??
    import.meta.env.VITE_API_URL ??
    '/api'
  ).replace(/\/$/, '')

  const host = document.createElement('div')
  host.id = 'bookpilot-widget'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = styles
  shadow.appendChild(style)

  const mount = document.createElement('div')
  shadow.appendChild(mount)

  createRoot(mount).render(
    <StrictMode>
      <App api={createApi(apiUrl, widgetKey)} />
    </StrictMode>
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
