# Memo Mission

A full-stack memory card matching game built with React 19 and Deno.

## Project Structure

```
benestudio/
├── frontend/    React 19 + Vite + Zustand + TypeScript
├── backend/     Deno + Danet framework + TypeScript
├── shared/      Shared types, models, and DTOs
└── deno.json    Monorepo task runner
```

## Getting Started

### Prerequisites

- [Deno 2.x](https://deno.land/)
- [Node.js 20+](https://nodejs.org/)

### Install Dependencies

```bash
deno task install
```

This runs `deno cache` for the backend and `npm install` for the frontend.

### Run in Development

```bash
deno task dev
```

Starts both servers concurrently:
- Frontend: `http://localhost:5173` (Vite dev server, proxies API requests)
- Backend: `http://localhost:3001` (Danet API server)

### Run Individually

```bash
# Frontend only
deno task dev:frontend

# Backend only
deno task dev:backend
```

### Build for Production

```bash
deno task build
```

Then serve with:

```bash
deno task start
```

The backend serves the built frontend as static assets and handles SPA routing.

## Running Tests

### All Tests

```bash
deno task test
```

### Frontend Tests (Vitest)

```bash
cd frontend && npm test        # single run
cd frontend && npm run test:watch  # watch mode
```

### Backend Tests (Deno)

```bash
cd backend && deno task test
```

## Docker

### Prerequisites

- [Docker](https://www.docker.com/) (Docker Desktop or Docker Engine + Colima)

### Build and Run

```bash
docker build -t memo-mission .
docker run -p 3001:3001 memo-mission
```

The app will be available at `http://localhost:3001`.

### What the Dockerfile Does

The build uses a multi-stage approach:

1. **Stage 1 (`node:22-alpine`)** — installs npm dependencies and builds the React frontend with Vite
2. **Stage 2 (`denoland/deno:latest`)** — copies the backend source, shared types, and the built frontend assets, then caches Deno dependencies

The final image contains only Deno and the production artifacts. Node.js is not present in the runtime image.

### Environment Variables

| Variable   | Default | Description            |
|------------|---------|------------------------|
| `PORT`     | `3001`  | Server listening port  |
| `DENO_ENV` | `production` | Set by Dockerfile |

To override the port:

```bash
docker run -p 8080:8080 -e PORT=8080 memo-mission
```

## Key Design Decisions

### Deno and Danet

The backend runs on [Deno](https://deno.land/), a modern runtime that executes TypeScript natively — no transpilation step, no `tsconfig` build pipeline, no `ts-node`. TypeScript is a first-class citizen, which means the backend source files are the runtime files.

[Danet](https://danet.land/) is the web framework layer, heavily inspired by [NestJS](https://nestjs.com/). It brings the same familiar patterns — decorators, dependency injection, modules, controllers, and injectable services — but built from the ground up for Deno. Because Deno handles TypeScript directly, Danet avoids the compilation overhead and toolchain complexity that NestJS requires on Node.js. The result is a faster startup, simpler project configuration, and a leaner dependency graph while keeping the structured, opinionated architecture that makes NestJS productive.

### Shared Types Between Frontend and Backend

The `shared/` directory contains all models, DTOs, and type definitions used by both sides. This guarantees the API contract stays in sync at compile time without code generation or schema validation libraries. Both the frontend (via TypeScript path aliases) and backend (via Deno import maps) resolve `@shared/` to this directory.

### In-Memory Game State

Games are stored in a `Map<string, GameInternal>` inside `GameRepository`. This keeps the architecture simple with no database dependency. The trade-off is that all game state is lost on server restart, which is acceptable for a casual browser game.

### Server-Authoritative Game Logic

All game rules (card matching, turn counting, bad guess limits, win/loss conditions) are enforced in `GameService` on the backend. The frontend is a thin client that sends actions and renders the response. This prevents cheating and keeps the source of truth in one place.

### Real-Time Timer via WebSocket

The countdown timer is driven by a server-side `setInterval` that pushes `timer/tick` messages to the client every second. This ensures the timer is authoritative (not dependent on the client clock) and that game-over from timeout is detected server-side. `GameTimerService` tracks intervals per-socket to prevent leaks on disconnect or re-subscribe.

### Zustand for Client State

Zustand was chosen over React Context or Redux for its minimal boilerplate and direct store access outside of React components (e.g., in `GameService` which calls `useGameStore.getState()`). This keeps service logic decoupled from the component tree.

### CSS Modules with Responsive Grid

The game board uses CSS Grid with `clamp()` for dynamic gap sizing and media query breakpoints (8 columns > 860px: 6 columns > 640px: 4 columns). This provides a responsive layout without a CSS framework dependency.

## Trade-offs and Potential Improvements

### Current Trade-offs

- **No persistent storage.** All game data lives in memory. A server restart wipes every active game. For a casual single-session game this is fine; for leaderboards or session resumption it is not.
- **Single-process, single-server.** The in-memory `Map` store and per-socket interval tracking assume a single Deno process. Horizontal scaling would require shared state (e.g., Redis).
- **No authentication.** The username is just a string in the DTO. Anyone with a game ID can interact with that game. Acceptable for a demo; not suitable for competitive play.

### Potential Improvements

- **Database persistence** (e.g., Deno KV or SQLite) for game history and leaderboards.
- **Multiplayer support** where two players race on the same board via WebSocket.
- **Difficulty modes** that vary grid size, timer, and max bad guesses as predefined presets.
- **Animations and sound effects** to make card flips and matches more engaging.
- **Accessibility** improvements: ARIA labels for cards, keyboard navigation, screen reader announcements for matches.
- **Rate limiting** on the flip endpoint to prevent brute-force solving.
- **E2E tests** with a browser automation tool (e.g., Playwright) to cover the full user flow.
- **Multilingual support** (i18n) using a library like `react-i18next` to translate UI strings and serve multiple locales.
- **Progressive Web App (PWA)** with a service worker and web app manifest for offline play, home screen installation, and push notifications.
- **Hall of Fame** leaderboard that ranks players by fewest turns, fastest completion time, and lowest bad guesses, persisted across sessions with a database backend.
