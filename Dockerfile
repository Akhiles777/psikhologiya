# Dockerfile
FROM node:20-alpine AS base

# Устанавливаем зависимости только для production
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Создаем папку для загрузок с правильными правами
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Собираем приложение
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем standalone сборку
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Создаем папку для загрузок
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Указываем папку для загрузок как volume
VOLUME /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV UPLOAD_DIR="/app/uploads"

CMD ["node", "server.js"]