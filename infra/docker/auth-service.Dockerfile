FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services/auth-service ./services/auth-service
RUN pnpm install --filter @interview-battlefield/auth-service... --frozen-lockfile=false

FROM deps AS build
RUN pnpm --filter @interview-battlefield/auth-service prisma:generate
RUN pnpm --filter @interview-battlefield/auth-service build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 4001
CMD ["pnpm", "--filter", "@interview-battlefield/auth-service", "start"]
