FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install --workspaces --include-workspace-root --no-audit --no-fund

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN npm run build --workspace @achievex/web

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S achievex && adduser -S achievex -G achievex
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/public ./apps/web/public
USER achievex
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@achievex/web"]
