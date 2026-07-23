# bookpilot-frontend

[![build](https://github.com/mehedi-200/bookpilot-frontend/actions/workflows/build.yml/badge.svg)](https://github.com/mehedi-200/bookpilot-frontend/actions/workflows/build.yml)

BookPilot Web — React chat widget + dashboard for the BookPilot AI booking agent.

API repo: https://github.com/mehedi-200/bookpilot-backend
Plan: [PLAN.md](PLAN.md) · Conventions: [CLAUDE.md](CLAUDE.md)

## Stack

React 19 · Vite · Tailwind CSS v4 · TanStack Query · React Router · React Hook Form · Axios

## Setup

```bash
npm install
cp .env.example .env          # VITE_API_URL points at the Laravel API
npm run dev                   # http://localhost:5173
```

The backend must be running (see the API repo). Log in with the seeded admin
(`admin@bookpilot.test` / `password`); run `php artisan db:seed --class=DemoSeeder`
in the API repo first if you want a populated dashboard.

## What's in here

Two applications share this codebase:

- **The dashboard** (`src/pages`, `src/layouts`) — bookings, customers,
  conversations, services, staff, settings, integrations. Three themes
  (dark default, light, reading), a collapsible desktop sidebar, and a
  native-app layout with bottom navigation under `lg`.
- **The chat widget** (`src/widget`) — a separate, self-contained bundle that
  gets embedded on the customer's own website. See below.

`/ui-kit` renders every shared component with fake data — the quickest way to
check a change across all three themes and both layouts.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build:widget` | Build the embeddable widget → `public/widget.js` |
| `npm run build` | Build the widget, then the dashboard → `dist/` |
| `npm run lint` | Lint (oxlint) |

## Embedding the chat widget

The whole install is one line, pasted before the closing `</body>` tag of the
customer's website. Copy it from **Settings › Widget** in the dashboard, which
fills in the business's own key:

```html
<script src="https://your-app-domain.com/widget.js"
        data-widget-key="bp_live_…" defer></script>
```

| Attribute | Required | Purpose |
|---|---|---|
| `data-widget-key` | yes | Identifies the business. Without it the widget stays invisible. |
| `data-api-url` | no | Override the API origin (baked in from `VITE_API_URL` at build time). |

**How it behaves**

- Renders inside a shadow root, so the host page's CSS cannot affect it and its
  styles cannot leak out.
- Follows the visitor's OS light/dark preference; full-screen sheet under 480px.
- Remembers the conversation in `localStorage`, so a refresh resumes the chat.
- An invalid or revoked key simply renders nothing — never an error on the
  customer's site.

**Testing isolation:** `npm run build:widget`, then open
`/embed-test.html` (e.g. via `npm run dev`). That page styles every element as
aggressively as possible — wrong box model, Comic Sans, `!important`
everywhere, and it even tries to hijack the widget's CSS variables. The widget
should look identical to a clean page. Replace the placeholder key in that file
with a real one to chat against a running API.
