# bookpilot-frontend

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

The backend must be running (see the API repo) — the start page shows a live API connection check.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production dashboard build |
| `npm run lint` | Lint (oxlint) |
