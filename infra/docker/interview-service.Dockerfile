FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services/interview-service ./services/interview-service
RUN pnpm install --filter @interview-battlefield/interview-service... --frozen-lockfile=false

FROM deps AS build
RUN pnpm --filter @interview-battlefield/interview-service build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 4002
CMD ["pnpm", "--filter", "@interview-battlefield/interview-service", "start"]
