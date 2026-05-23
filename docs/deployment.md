# PrepNexo Deployment Checklist

## Required Secrets

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` when OAuth is enabled
- `RESEND_API_KEY` when email delivery is enabled

## Build Verification

Run this before shipping:

```bash
pnpm install
pnpm db:generate
pnpm prod:check
```

`prod:check` runs Prisma client generation, TypeScript checks, tests, and production builds across the workspace.

## Database

Use Prisma migrations in production:

```bash
pnpm --filter @interview-battlefield/auth-service prisma migrate deploy
```

Seed only non-production environments:

```bash
pnpm db:seed
```

## Runtime Services

- `web` on port `3000`
- `auth-service` on port `4001`
- `interview-service` on port `4002`
- `ai-service` on port `4003`
- PostgreSQL
- Redis

For a single AWS VM deployment with PM2:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @interview-battlefield/auth-service prisma migrate deploy
pnpm build
pm2 start infra/pm2/ecosystem.config.cjs
pm2 save
```

Set `PREPNEXO_RELEASE_DIR=/var/www/prepnexo/current` if PM2 is launched outside the release directory.

## Health Checks

- `GET /health` on every backend service
- Web root `/`
- Socket.IO path `/socket.io/`

## Scaling Notes

- Scale `interview-service` horizontally only when every instance points at the same Redis.
- Keep `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` identical across auth replicas.
- Route `/socket.io/` through a websocket-capable reverse proxy.
- Keep Gemini calls server-side through `ai-service`; never expose `GEMINI_API_KEY` to the browser.
- Keep Resend calls server-side through `auth-service`; never expose `RESEND_API_KEY` to the browser.
