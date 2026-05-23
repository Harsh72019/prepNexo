FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY services/ai-service ./services/ai-service
RUN pnpm install --filter @interview-battlefield/ai-service... --frozen-lockfile=false

FROM deps AS build
RUN pnpm --filter @interview-battlefield/ai-service build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 4003
CMD ["pnpm", "--filter", "@interview-battlefield/ai-service", "start"]
