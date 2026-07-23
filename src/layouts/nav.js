import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Users,
  Package,
  UserCog,
  Plug,
  Settings,
} from 'lucide-react'

// One nav source of truth: sidebar, bottom nav, More sheet, page titles.
// adminOnly filtering activates in Feature 2 when real roles arrive.
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/conversations', label: 'Conversations', icon: MessageSquare },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/services', label: 'Services', icon: Package },
  { to: '/staff', label: 'Staff', icon: UserCog, adminOnly: true },
  { to: '/integrations', label: 'Integrations', icon: Plug, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
]

// First 3 + More on mobile bottom nav.
export const BOTTOM_NAV = NAV_ITEMS.slice(0, 3)
export const MORE_ITEMS = NAV_ITEMS.slice(3)

export const PAGE_TITLES = {
  '/': 'Dashboard',
  '/bookings': 'Bookings',
  '/conversations': 'Conversations',
  '/customers': 'Customers',
  '/services': 'Services',
  '/staff': 'Staff',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/search': 'Search',
  '/ui-kit': 'UI Kit',
}

// Detail pages (dynamic segments) fall back by prefix.
const PREFIX_TITLES = [
  ['/customers/', 'Customer'],
  ['/bookings/', 'Booking'],
  ['/conversations/', 'Conversation'],
]

export function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const prefixed = PREFIX_TITLES.find(([prefix]) => pathname.startsWith(prefix))
  return prefixed ? prefixed[1] : 'BookPilot'
}
