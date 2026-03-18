FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npx prisma generate --schema packages/database/prisma/schema.prisma
RUN npm run build --workspace @metalgest/database
RUN npm run build --workspace @metalgest/api

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init wget

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN mkdir -p /app/apps/api/logs /app/apps/api/uploads

WORKDIR /app/apps/api

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health >/dev/null || exit 1

CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy --schema /app/packages/database/prisma/schema.prisma && node dist/server.js"]
