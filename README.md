# Calcite

**🚀 Live App:** https://thisisshreyy.github.io/Calcite/

Calcite is a local-first personal productivity workspace for daily focus, tasks, habits, markdown notes, expenses, analytics, and saved quotes — with optional cloud sync via Gmail / Google authentication.

---

## Features

- **Dashboard**: Daily score, weekly habit progress, active tasks, and rotating quotes.
- **Today View**: Focused view for scheduled habits, today's due tasks, and highlighted overdue tasks.
- **Task Management**: Folders/lists, priorities (high, medium, low), due dates, and inline completion toggling.
- **Habit Tracking**: Daily, weekday, or custom-day recurrence with historical point snapshotting.
- **Markdown Notes**: Multi-folder note hierarchy with a secure virtual DOM Markdown previewer (tables, checklists, code blocks, quotes).
- **Expense Tracker**: INR totals, categorized expenses, and customizable quick-amount presets.
- **Productivity Analytics**: Recharts visualizations for weekly/monthly scores, consecutive streaks, and habit consistency rates.
- **Quote Library**: Curated and custom quotes with dashboard shuffle.
- **Google Sign-In & Cloud Sync**: Sign in with Gmail to back up and sync your workspace across devices, while continuing to save locally for zero-latency offline use.
- **Settings & Data Portability**: Full JSON backup export/import, safe factory reset, and cloud synchronization controls.
- **Error Boundary**: Graceful crash recovery with emergency backup export.
- **PWA Support**: Installable on Android, iOS, and desktop with offline support.
- **Docker Ready**: Multi-stage production container with embedded API server and persistent volume storage.

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router DOM 7 + Recharts + Framer Motion + Lucide + vite-plugin-pwa
- **Backend**: Node.js + Express + TypeScript + JWT + Atomic Persistent JSON/SQLite storage
- **Containerization**: Docker (multi-stage Alpine) + Docker Compose

## Data Model & Sync

Calcite remains **strictly local-first**:
1. All changes save to browser `localStorage` instantly — no delay, zero latency, and fully operational without an internet connection.
2. When signed in with Gmail, changes automatically sync in the background to your private cloud storage.
3. If offline, changes remain safely stored locally and sync automatically when internet connectivity returns.

---

## Running with Docker

Run the entire Calcite workspace (Frontend + Backend + Cloud Storage) with Docker:

```bash
docker compose up --build
```

Then open **http://localhost:3000** in your browser. User data is automatically persisted in the `calcite-data` Docker volume.

To stop the container:

```bash
docker compose down
```

---

## Running Locally for Development

### 1. Install Dependencies

```bash
npm install
npm --prefix server install
```

### 2. Start Development Servers

Start the frontend (Vite dev server on http://localhost:5173):
```bash
npm run dev
```

Start the backend server (API on http://localhost:3000):
```bash
npm run server:dev
```

### 3. Production Check & Build

```bash
npm run lint
npm run build
npm run server:build
```

---

## Google Sign-In Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add your authorized JavaScript origins (e.g. `http://localhost:3000`, `http://localhost:5173`, or your production domain).
4. Supply your Client ID in `docker-compose.yml` (`GOOGLE_CLIENT_ID`) or enter it directly in the app under **Settings → Cloud Account & Sync → Configure Google Client ID**.
5. *Note:* A built-in Gmail Demo sign-in is also provided for instant testing without needing immediate Google Cloud credentials.
