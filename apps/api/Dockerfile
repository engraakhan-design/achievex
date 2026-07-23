FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install --workspaces --include-workspace-root --no-audit --no-fund

FROM deps AS builder
COPY . .
RUN npm run db:generate && npm run build --workspace @achievex/api

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S achievex && adduser -S achievex -G achievex
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
USER achievex
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
