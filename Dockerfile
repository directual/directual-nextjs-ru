# Stage 1: Билд приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем файлы package
COPY package.json package-lock.json ./

# Ставим ВСЕ зависимости (включая dev для билда)
RUN npm ci

# Копируем исходники
COPY . .

# Билдим Next.js с standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Получаем NEXT_PUBLIC_DIRECTUAL_APP_ID при билде для встраивания в клиентский код
ARG NEXT_PUBLIC_DIRECTUAL_APP_ID
ENV NEXT_PUBLIC_DIRECTUAL_APP_ID=$NEXT_PUBLIC_DIRECTUAL_APP_ID

RUN npm run build

# Stage 3: Production образ
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаём пользователя nextjs для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем только нужное из билда
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запускаем standalone сервер
CMD ["node", "server.js"]
