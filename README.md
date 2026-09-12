# Calcite

Calcite is a local-first personal productivity workspace for today, tasks, habits, notes, expenses, analytics and saved quotes.

## V1 features

- Dashboard with daily score, weekly habit progress, tasks and quote
- Today view for daily habits, due tasks and overdue tasks
- Task lists/folders with priorities, due dates, editing and completion
- Habit tracking with daily/weekday/custom recurrence and points
- Notes with folders and Markdown preview
- Expense tracker with INR totals, categories and editable amount presets
- Analytics for habit performance and trends
- Quote library with dashboard quote rotation
- Settings with JSON export/import and local reset
- Responsive mobile UI
- Installable PWA support

## Tech

React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router + Recharts + Framer Motion + Lucide + vite-plugin-pwa.

## Data model

V1 is intentionally local-first. Productivity data is stored in browser localStorage, so Calcite works without a backend or account and remains usable offline after installation. Use Settings → Export backup before clearing browser data or moving devices.

Cloud sync/authentication can be added as a V2 without changing the core UI.

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run lint
npm run build
```

## Install on phone

Open the deployed Calcite URL in Chrome/Edge on Android and choose Install app / Add to Home screen. On iOS, use Safari → Share → Add to Home Screen.
