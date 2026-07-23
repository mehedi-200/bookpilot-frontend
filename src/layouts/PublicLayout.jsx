import { Link, NavLink, Outlet } from 'react-router-dom'
import { Rocket, Sun, Moon, BookOpen } from 'lucide-react'
import Button from '@/components/Button'
import { useTheme } from '@/hooks/useTheme'

// Marketing chrome — deliberately unlike the app's dashboard shell: no sidebar,
// a centred nav, and a full footer.
export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

const THEME_ICON = { dark: Moon, light: Sun, reading: BookOpen }

function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme()
  const Icon = THEME_ICON[theme] ?? Moon

  const cycle = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length]
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to change.`}
      className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <Icon size={17} />
    </button>
  )
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link to="/welcome" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-contrast">
            <Rocket size={16} />
          </span>
          <span className="text-base font-semibold text-ink">BookPilot</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <HeaderLink to="/welcome" hash="#features">
            Features
          </HeaderLink>
          <HeaderLink to="/welcome" hash="#how">
            How it works
          </HeaderLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            Pricing
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:block">
            <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
              Log in
            </span>
          </Link>
          <Link to="/login">
            <Button>Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

// Anchor links that also work when you're already on the landing page.
function HeaderLink({ to, hash, children }) {
  return (
    <a
      href={`${to}${hash}`}
      className="rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </a>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center">
        <Link to="/welcome" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-contrast">
            <Rocket size={13} />
          </span>
          <span className="text-sm font-semibold text-ink">BookPilot</span>
        </Link>
        <p className="text-sm text-ink-muted">AI booking, done for you.</p>
        <div className="flex flex-wrap gap-4 text-sm text-ink-muted sm:ml-auto">
          <Link to="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link to="/login" className="hover:text-ink">
            Log in
          </Link>
          <span>© {new Date().getFullYear()} BookPilot</span>
        </div>
      </div>
    </footer>
  )
}
