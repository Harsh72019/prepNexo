# PrepNexo Phase Plan

## Phase 1

- Monorepo workspace with `apps`, `services`, `packages`, `infra`, and `docs`.
- Shared TypeScript, Tailwind, UI tokens, reusable primitives, dark mode, loading and error states.
- Auth service with register, login, refresh token rotation, logout, forgot password, reset password, email verification, Google OAuth callback, and `/me`.
- Prisma auth schema and seed user.
- Next.js auth screens and responsive dashboard shell.
- Expo + NativeWind mobile foundation.

## Phase 2

- Expand database schema for attempts, topic progress, daily activity, and roadmap items.
- Dashboard API service boundaries and real dashboard data wiring.
- Topic radar, heatmap, topic cards, recent activity, roadmap, and skeleton/error states backed by persisted data.
- Prisma migration and seed data for a realistic demo dashboard.

## Phase 3

- Socket.IO gateway in `interview-service`.
- Redis adapter for horizontal scaling with in-memory fallback during local development.
- Rooms for live coding, DSA contests, leaderboard updates, and system design canvas sync.
- Web pages for live coding collaboration, DSA leaderboard, and system design block synchronization.

## Phase 4

- AI service around Gemini API via Google Gen AI SDK.
- Interviewer chat, code review feedback, system design critique, and personalized roadmap generation.
- Web AI coach, coding review, system design critique, and dashboard roadmap generation wired to the AI service.

## Phase 5

- Test coverage, observability, Docker hardening, Nginx routing, deployment docs, performance passes.
