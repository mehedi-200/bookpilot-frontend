import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  MoreHorizontal,
  X,
  User,
  LogOut,
  Palette,
  Rocket,
} from 'lucide-react'
import { NAV_ITEMS, BOTTOM_NAV, MORE_ITEMS, getPageTitle } from '@/layouts/nav'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import MasterSearch from '@/components/MasterSearch'
import NotificationBell from '@/components/NotificationBell'
import { IconButton } from '@/components/Button'

const SIDEBAR_KEY = 'bookpilot_sidebar_collapsed'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === '1'
  )
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAuth()
  const title = getPageTitle(location.pathname)

  const canSee = (item) => !item.adminOnly || isAdmin
  const navItems = NAV_ITEMS.filter(canSee)
  const moreItems = MORE_ITEMS.filter(canSee)

  const toggleSidebar = () => {
    setCollapsed((c) => {
      localStorage.setItem(SIDEBAR_KEY, c ? '0' : '1')
      return !c
    })
  }

  useEffect(() => setMoreOpen(false), [location.pathname])

  return (
    <div className="flex h-full flex-col bg-app">
      {/* ── Desktop thin header ── */}
      {/* Equal-weight flanks keep the search optically centred whatever the
          logo or right-hand controls grow to. */}
      <header className="hidden h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 lg:flex">
        <div className="flex flex-1 items-center gap-2">
          <IconButton label="Toggle sidebar" onClick={toggleSidebar}>
            <Menu size={18} />
          </IconButton>
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-contrast">
              <Rocket size={14} />
            </span>
            <span className="text-sm font-semibold text-ink">BookPilot</span>
          </NavLink>
        </div>

        <MasterSearch />

        <div className="flex flex-1 items-center justify-end gap-1">
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>

      {/* ── Mobile app-style top bar ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 pt-[env(safe-area-inset-top)] lg:hidden">
        <h1 className="text-base font-semibold text-ink">{title}</h1>
        <div className="ml-auto flex items-center gap-1">
          <NavLink to="/search" aria-label="Search">
            <IconButton label="Search" tabIndex={-1}>
              <Search size={20} />
            </IconButton>
          </NavLink>
          <NotificationBell />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Desktop collapsible sidebar ── */}
        <aside
          className={`hidden shrink-0 flex-col border-r border-line bg-surface lg:flex ${
            collapsed ? 'w-16' : 'w-56'
          }`}
        >
          <nav className="flex-1 space-y-0.5 p-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-surface-2 font-medium text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent'
                      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Page content ── */}
        <main className="min-w-0 flex-1 overflow-y-auto p-3 pb-24 lg:pb-3">
          <Outlet />
        </main>
      </div>

      {/* ── Desktop thin footer ── */}
      <footer className="hidden h-8 shrink-0 items-center justify-center border-t border-line bg-surface text-xs text-ink-muted lg:flex">
        BookPilot v1
      </footer>

      {/* ── Mobile bottom navigation ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
                isActive ? 'font-medium text-accent' : 'text-ink-muted'
              }`
            }
          >
            <Icon size={21} />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
            moreItems.some((i) => location.pathname.startsWith(i.to))
              ? 'font-medium text-accent'
              : 'text-ink-muted'
          }`}
        >
          <MoreHorizontal size={21} />
          More
        </button>
      </nav>

      {/* ── Mobile "More" sheet ── */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden"
          onClick={(e) => e.target === e.currentTarget && setMoreOpen(false)}
        >
          <div className="w-full rounded-t-2xl border-t border-line bg-surface p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">More</p>
              <IconButton label="Close" onClick={() => setMoreOpen(false)}>
                <X size={18} />
              </IconButton>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...moreItems, { to: '/profile', label: 'Profile', icon: User }].map(
                ({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-line text-xs ${
                        isActive
                          ? 'bg-surface-2 font-medium text-accent'
                          : 'text-ink-muted active:bg-surface-2'
                      }`
                    }
                  >
                    <Icon size={22} />
                    {label}
                  </NavLink>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { theme, setTheme, themes } = useTheme()
  const { user, logout: doLogout } = useAuth()

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const logout = async () => {
    await doLogout()
    navigate('/login')
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '…'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          {user && (
            <div className="border-b border-line px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
          >
            <User size={16} /> Profile
          </button>
          <div className="my-1 border-t border-line" />
          <p className="flex items-center gap-2 px-3 pt-1.5 pb-1 text-xs text-ink-muted">
            <Palette size={13} /> Theme
          </p>
          <div className="flex gap-1 px-2 pb-1.5">
            {themes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs capitalize ${
                  theme === t
                    ? 'bg-accent font-medium text-accent-contrast'
                    : 'bg-surface-2 text-ink-muted hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-2"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
