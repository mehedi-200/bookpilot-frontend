# BookPilot Frontend — Project Conventions

AI booking agent SPA — embeddable chat widget + business dashboard. React + Vite + TanStack Query + Tailwind CSS.
API repo: https://github.com/mehedi-200/bookpilot-backend

## ⛔ UI/UX RULES — STRICT, NEVER BREAK, NO EXCEPTIONS

These rules apply to EVERY page and EVERY component. Never ship anything that violates a single one of them.

### 1. Fully responsive — always
Every page must work perfectly on mobile, tablet, and desktop. No page is "desktop only". Test all three breakpoints for every feature.

### 2. Mobile & tablet = native app experience
On mobile and tablet, every page must look and feel like a modern native app, not a shrunken website:
- Full-screen app-style layout (no desktop chrome)
- App-style top bar per page (title + contextual actions)
- Bottom navigation bar for primary navigation (native app pattern)
- Touch-friendly targets (min 44×44px), swipe-friendly lists, card-based layouts
- Modern app design: rounded cards, clean spacing, smooth transitions

### 3. Desktop = thin chrome + collapsible sidebar
- **Thin header** (slim, not tall)
- **Thin footer**
- **Thin sidebar** for navigation, and it MUST be collapsible (icons-only when collapsed)

### 4. Three themes — dark is DEFAULT
- **Dark mode** — the default theme
- **Light mode**
- **Reading mode** — comfortable reading palette (sepia/soft contrast)
Implement with CSS variables + a theme class on the root element; persist the user's choice (localStorage); every component must render correctly in all three themes. Never hardcode colors in components — always use theme tokens.

### 5. Global app chrome — present on every authenticated page
- **Master search bar** (global search across bookings, customers, conversations)
- **Notification area** (bell + dropdown/panel)
- **Profile menu** (avatar → profile, settings, logout)
On desktop these live in the thin header; on mobile/tablet they live in the app-style top bar / navigation per native app conventions.

### 6. Always reuse components
Before writing any new component, check `src/components/` for an existing one that fits (or can be extended with a prop). Build shared UI as reusable components — Button, Input, Select, Card, Modal, Table/ListView, StatusChip, PageHeader, EmptyState, etc. — and use them everywhere. Never copy-paste UI markup between pages; if two pages need similar UI, extract a component.

### 7. Pagination — every list page, ONE shared component, exact design
Every page that lists data MUST use pagination, and always through the single shared `<Pagination>` component. It has exactly two responsive designs:

**Desktop design (fixed — matches the approved reference):**
A full-width rounded bar (subtle elevated surface on the page background) containing, from left to right:
- Circular primary-accent (indigo) **refresh icon button**
- `Showing [13] entries` — total count in a small dark rounded badge
- *(spacer pushes the rest right)*
- `Show [10]` — per-page size in a small rounded outlined input
- `‹ Previous` link (accent color)
- Page numbers: **active page = solid indigo rounded square with white number**, inactive pages = plain numbers
- `Next ›` link (accent color)

**Mobile/tablet design (app view):**
Same component, same data/behavior, rendered as a compact, touch-friendly native-app style control (large tap targets, current page indicator, previous/next; refresh and page-size accessible but space-efficient). No desktop bar squeezed onto mobile.

Rules: all colors from theme tokens (must look right in dark/light/reading); never build a second pagination UI anywhere; API list endpoints always return Laravel paginated responses that feed this component.

### 8. Compact layouts — never waste vertical space
- Page headers are SLIM: small title with the subtitle beside it on one line, tight margins. No tall empty header bands.
- Consistent tight padding (`p-4`); no large empty gaps between sections.
- Desktop sidebar collapse is toggled ONLY by the hamburger (3-line) icon next to the BookPilot logo in the header — never a collapse button inside the sidebar.
- **Detail/view pages always have a back button** (all breakpoints, desktop included) that returns to the index page, rendered as a compact `← Title` row — never a floating standalone title.
- **List-page search/filters live in a toolbar attached to the top of the table** (DataList's `toolbar` prop, same bordered container) — never floating above the table with a gap. Nothing is ever placed loose in a gap.
- **List/index pages have NO desktop title band** (`bare` Page) — the sidebar already names the page. Primary actions (Add …) sit on the LEFT of the table toolbar; **search/filters are always right-aligned** (`md:ml-auto`), search bar starts from the right side.
- One uniform small gap everywhere: `p-3` between content and header/sidebar — same size as the sidebar gap, never more.

## React Architecture

```
Component
    ↓
React Query / Redux Toolkit
    ↓
API Service (Axios)
    ↓
Laravel API
```

## Project Structure

```
src/
├── components/
├── pages/
├── widget/        // embeddable chat widget (separate build entry)
├── services/      // Axios API calls
├── store/         // Redux Toolkit (if needed)
├── hooks/         // Custom hooks
├── utils/
└── App.jsx
```

## Best Practices

- Keep API calls inside `services/`.
- Use React Query for server state (fetching, caching, refetching).
- Use Redux Toolkit only for global application state (auth, UI, settings).
- Keep components focused on rendering and user interactions.
- Reuse logic through custom hooks.
- Separate business logic from UI.
- Use Axios interceptors for authentication and error handling.

## Git

`main` ← `develop` ← `feature/*` branches, meaningful commit messages, PRs into develop.
