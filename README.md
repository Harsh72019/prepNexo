# PrepNexo

AI-powered technical interview preparation platform built as a scalable TypeScript monorepo.

## Stack

- Web: Next.js 15, TypeScript, TailwindCSS, shadcn-style shared UI, Zustand, React Query, Framer Motion
- Mobile: React Native Expo, TypeScript, NativeWind
- Backend: Node.js, Express, TypeScript
- Data: PostgreSQL, Prisma ORM, Redis
- Realtime roadmap: Socket.IO with Redis Pub/Sub adapter
- AI roadmap: Gemini API via Google Gen AI SDK
- Infra: Docker, Docker Compose, Nginx

## Structure

```txt
apps/
  web/
  mobile/
services/
  auth-service/
  interview-service/
  ai-service/
  analytics-service/
packages/
  ui/
  types/
  config/
infra/
  docker/
  nginx/
docs/
```

## Phase 1 Status

Implemented:

- Monorepo initialization with pnpm workspaces and Turborepo.
- Shared UI package with design tokens, Tailwind globals, shadcn-compatible primitives, dark mode support.
- Auth service with modular routes, controllers, services, repositories, validators, middleware, JWT access tokens, refresh token rotation, Google OAuth plumbing, forgot password, and email verification.
- Prisma schema and seed data for auth.
- Next.js web shell with auth pages, responsive app layout, dashboard foundation, React Query, Zustand, and Framer Motion.
- Expo mobile foundation with NativeWind tokens.
- Docker Compose for PostgreSQL, Redis, auth service, and web.

## Phase 2 Status

Implemented:

- Prisma dashboard schema for interview attempts, topic progress, daily activity heatmap data, and roadmap items.
- Explicit Prisma migration at `services/auth-service/prisma/migrations/20260520000000_phase2_dashboard`.
- Seeded demo analytics for the demo account.
- Protected dashboard API at `GET /api/dashboard/summary`.
- Modular backend stack for dashboard repository, service, controller, and routes.
- Web dashboard wired to real API data with metric cards, topic radar, heatmap, topic progress, roadmap, recent activity, loading states, and error recovery.

## Phase 3 Status

Implemented:

- Socket.IO server in `services/interview-service`.
- Typed realtime event contracts shared through `packages/types`.
- Redis adapter for horizontal Socket.IO scaling with local in-memory fallback.
- Live coding room events for join/leave, presence, code patch sync, and execution console broadcasts.
- DSA contest leaderboard room events.
- System design canvas room events for infra block synchronization.
- Web realtime client hook and pages at `/coding`, `/dsa-arena`, and `/system-design`.
- Dockerfile and Compose wiring for `interview-service`.

## Phase 4 Status

Implemented:

- Gemini-backed `ai-service` using `@google/genai`.
- AI endpoints for interviewer replies, code feedback, system design critique, and roadmap generation.
- Web AI coach page at `/ai-coach`.
- Gemini code review inside `/coding`.
- Gemini architecture critique inside `/system-design`.
- Gemini roadmap generation inside `/dashboard`.
- Dockerfile, Compose, and Nginx routing for `ai-service`.

## Phase 5 Status

Implemented:

- Vitest test runner across service workspaces.
- Focused tests for auth validators, token crypto helpers, realtime room state, leaderboard sorting, canvas updates, and Gemini missing-key behavior.
- Health checks with uptime/timestamp metadata for backend services.
- Graceful shutdown handlers for realtime and AI services.
- Docker healthchecks and root `.dockerignore`.
- Deployment checklist in `docs/deployment.md`.

## Setup

```bash
cd interview-battlefield
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

For realtime development, run the interview service as well:

```bash
pnpm --filter @interview-battlefield/interview-service dev
```

The demo seeded account is:

```txt
Email: demo@prepnexo.dev
Password: PrepNexo@123
```

## Docker

```bash
cd interview-battlefield
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up --build
```

Run migrations inside the auth service container after the database is healthy:

```bash
docker compose -f infra/docker/docker-compose.yml exec auth-service pnpm db:migrate
```

## Environment

Set strong secrets in `.env` before running auth:

```txt
JWT_ACCESS_SECRET=replace-with-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-at-least-32-characters
DATABASE_URL=postgresql://battlefield:battlefield@localhost:5432/interview_battlefield?schema=public
```

Before deploying, run the production gate:

```bash
pnpm prod:check
```

Google OAuth is optional for local password auth. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` when ready.

Resend is optional for local development. Add `RESEND_API_KEY` and a verified `EMAIL_FROM` domain when you want real verification and reset emails. If `RESEND_API_KEY` is empty, the auth service prints email content to the console.

For AI features, use your Gemini key:

```txt
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```
