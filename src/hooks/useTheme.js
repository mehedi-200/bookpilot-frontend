import { useCallback, useSyncExternalStore } from 'react'

export const THEMES = ['dark', 'light', 'reading']
const KEY = 'bookpilot_theme'

let listeners = []
const notify = () => listeners.forEach((l) => l())

function getTheme() {
  const stored = localStorage.getItem(KEY)
  return THEMES.includes(stored) ? stored : 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove(...THEMES)
  root.classList.add(theme)
  localStorage.setItem(KEY, theme)
  notify()
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.push(cb)
      return () => (listeners = listeners.filter((l) => l !== cb))
    },
    getTheme,
    () => 'dark'
  )

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) applyTheme(next)
  }, [])

  return { theme, setTheme, themes: THEMES }
}
