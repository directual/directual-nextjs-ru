# Next.js + Directual Starter Template

Стартовый шаблон с авторизацией (magic link, reset password), dashboard, WebSocket подключением и SSE стримингом к Directual.

Подрбнее о деталях работы Directual с NextJS: https://readme.directual.com/directual-react-js/directual-+-nextjs#pattern-raboty-s-directual

![nextjs + directual temaplte](https://api.directual.com/fileUploaded/nextjs/250c0951-c4e8-458f-8018-8dc481d788a0.jpg)

## Технологии

- **Next.js 16** — React фреймворк с App Router
- **Directual** — Backend-as-a-Service платформа
- **Tailwind CSS** — Utility-first CSS фреймворк
- **shadcn/ui** — Компоненты на базе Radix UI
- **Socket.IO** — Real-time WebSocket соединение
- **SSE (Server-Sent Events)** — Стриминг ответов от AI без буферизации
- **TypeScript** — Типизация

## Quick Start

```bash
# 1. Клонировать репозиторий

# 2. Установить зависимости
npm install

# 3. Создать .env.local (см. ниже)

# 4. Запустить dev-сервер
npm run dev
```

Откройте [http://localhost:3002](http://localhost:3002)

## Брендинг

Замените шаблонные логотипы и иконки на свои:

- **`components/ui/logo.tsx`** — SVG-логотип приложения (используется в sidebar и на страницах авторизации). Содержит варианты: полный, маленький и очень маленький (для свёрнутого sidebar)
- **`public/icon.png`** — Favicon
- **`public/icon-192.png`** — PWA иконка 192x192
- **`public/icon-512.png`** — PWA иконка 512x512
- **`public/apple-icon.png`** — Apple Touch Icon 180x180
- **`public/opengraph-image.png`** — OG-картинка для соцсетей (1200x630)
- **`public/manifest.json`** — Название и описание PWA

## Переменные окружения

Создайте `.env.local`:

```env
# Directual API
NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id_here
```

`your_app_id_here` — идем в приложение Directual => API => API keys, копируем (или создаем) `APP_ID`

## Чеклист настройки Directual

### Необходимые эндпоинты

Все механизмы шаблона (авторизация, профиль, загрузка файлов) работают через эндпоинты Directual API. Шаблон использует следующие эндпоинты (см. `lib/directual/fetcher.ts`):

| Эндпоинт | Метод | Структура | Назначение |
|----------|-------|-----------|------------|
| `magicLinkRequest` | POST | `magic_link_link_request` | Запрос magic link по email |
| `resetPass` | POST | `ResetPasswordRequest` | Запрос ссылки для сброса пароля |
| `resetPassword` | POST | `reset_password_inputs` | Установка нового пароля (с токеном) |
| `profile` | GET/POST | `WebUser` | Чтение/обновление профиля |
| `postUserAction` | POST | `user_actions` | Единая точка входа для пользовательских действий |
| `uploadFiles` | POST | `file_links` | Загрузка файлов |

> **В новом базовом шаблоне приложения Directual (после 7 февраля 2026 года) все необходимые эндпоинты уже созданы.** Если вы создали приложение на актуальном шаблоне — всё готово из коробки, просто укажите APP_ID.
>
> Если вы работаете со старым приложением — убедитесь, что все перечисленные эндпоинты существуют и настроены. Без нужного эндпоинта соответствующий механизм работать не будет.

### Получить APP_ID

1. Зайти в личный кабинет [Directual](https://my.directual.com)
2. Открыть ваше приложение → **API** → **API Keys**
3. Скопировать **APP_ID** в `.env.local`

### Создать первого пользователя

Пользователи хранятся в системной структуре **App Users** (`WebUser`). После того как вы добавили APP_ID, можно вручную создать первого пользователя:

1. В Directual откройте структуру **App Users** (она же `WebUser`)
2. Создайте новый объект:
   - **id** — email пользователя (например `admin@example.com`)
   - **password** — пароль. **Обязательно нажмите кнопку encrypt** рядом с полем, т.к. пароли хранятся в зашифрованном виде
3. Сохраните объект

Теперь можно залогиниться в приложении под этим email и паролем.

> Если не нажать Encrypt — пароль сохранится как обычная строка, и авторизация работать не будет: Directual сравнивает хэши, а не plain text.

### Настроить отправку email

Для работы **magic link** (вход по ссылке из письма) и **восстановления пароля** необходимо подключить отправку электронной почты в вашем приложении Directual:

1. **Подключить email-шлюз** — один из вариантов:
   - Плагин **SMTP** в Directual (Plugins → SMTP) — подключите свой почтовый сервер или сервис (Gmail, Yandex, SendGrid, Mailgun и т.д.)
   - Любой другой email-шлюз, поддерживаемый Directual

2. **Настроить сценарии отправки писем:**

#### Magic Link:
1. Создать сценарий в Directual
2. Триггер: создание записи в `magic_link_link_request`
3. Действие: отправка email с ссылкой `https://your-app.com/auth/magic/${token}`

#### Reset Password:
1. Создать сценарий в Directual
2. Триггер: создание записи в `ResetPasswordRequest`
3. Действие: отправка email с ссылкой `https://your-app.com/auth/new-password/${token}`

> Без подключённой электронной почты magic link и восстановление пароля работать не будут — письма просто не уйдут.

### Настроить WebSocket

1. В Directual → **Plugins** → **Socket.IO**
2. В сценариях можно отправлять события через шаг PUSH-уведомления:
   ```javascript
   // Пример: отправка уведомления пользователю
   user: "*", // * для бродкаста, или укажите ID юзера
   event: 'alert', 
   message: // валидный JSON
    {
      "variant": "default",
      "title": "Успех",
      "description": "Проект \"{{payload.title}}\" успешно создан",
      "icon": "CheckCircle"
    }
   ```

Встроенные события (обрабатываются автоматически в `SocketListener`):
- **`alert`** — показать уведомление (через `window.__showGlobalAlert`)
- **`refresh`** — обновить данные (через `window.__refreshData` → `refreshAll()` в DataProvider)

**Можно добавлять какие угодно свои события** — для этого зарегистрируйте обработчик в `SocketListener` или используйте хук `useSocketEvent` (см. ниже).

> **Важно:** не подписывайтесь на `alert` и `refresh` через `useSocketEvent` — они уже обрабатываются в `SocketListener`. Двойная подписка приведёт к дублированию вызовов.

## Структура проекта

```
app/
├── api/
│   ├── auth/          # API routes для авторизации
│   └── good/api/v5/stream/[...path]/  # SSE стриминг прокси (без буферизации)
├── auth/              # Страницы авторизации (login, magic, reset)
├── dashboard/         # Защищенные страницы dashboard
│   ├── page.tsx       # Home с тестовой формой стриминга
│   ├── profile/       # Профиль пользователя
│   └── settings/      # Настройки
├── layout.tsx         # Root layout с провайдерами
└── globals.css        # Глобальные стили (Tailwind + shadcn/ui)

components/
├── ui/                # shadcn/ui компоненты
├── dashboard/         # Компоненты dashboard (sidebar, etc.)
├── auth/              # Формы авторизации
├── socket-listener.tsx # Слушатель WebSocket событий
└── global-alerts.tsx  # Глобальные уведомления

context/
├── auth-provider.tsx  # Контекст авторизации
├── data-provider.tsx  # Контекст данных (профиль)
└── theme-provider.tsx # Контекст темы (light/dark)

lib/
├── directual/         # Directual API интеграция
│   ├── client.ts      # API client (apiHost + streamApiHost)
│   ├── fetcher.ts     # Wrapper с методами (get/post/stream/upload)
│   └── socket.ts      # Socket.IO connection
└── utils.ts           # Утилиты

types/
└── index.ts           # TypeScript типы
```

## Добавление новых страниц

### Публичная страница:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

### Защищенная страница:

```tsx
// app/dashboard/my-page/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';

export default function MyPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Загрузка...</div>;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

Добавьте пункт меню в `config/dashboard-menu.json`:

```json
{
  "topItems": [
    {
      "id": "my-page",
      "label": "Моя страница",
      "icon": "Star",
      "type": "route",
      "route": "/dashboard/my-page"
    }
  ]
}
```

## Добавление новых эндпоинтов в Fetcher

```typescript
// lib/directual/fetcher.ts

// GET запрос
async getMyData(queryParams: Record<string, unknown> = {}): Promise<GetResponse> {
  return this.get('my_structure', 'getMyData', queryParams);
}

// POST запрос
async postMyAction(payload: Record<string, unknown> = {}): Promise<PostResponse> {
  return this.post('my_actions', 'postMyAction', payload);
}
```

Использование:

```typescript
import { fetcher } from '@/lib/directual/fetcher';

const result = await fetcher.getMyData({ page: 1 });
if (result.success) {
  console.log(result.data);
}
```

## Стриминг (SSE)

Темплейт поддерживает реал-тайм стриминг через Server-Sent Events. Под капотом: Route Handler проксирует запросы на `api.alfa.directual.com` без буферизации.

### Архитектура стриминга

```
Browser → /api/good/api/v5/stream/* → Route Handler → api.alfa.directual.com
                                            ↓
                                    ReadableStream (без буферизации)
```

**Почему не rewrites?** Next.js rewrites буферизируют весь ответ и отдают клиенту только когда upstream закроет соединение. Стриминг через rewrite **не работает**.

**Решение:** Route Handler в `app/api/good/api/v5/stream/[...path]/route.ts` пробрасывает `ReadableStream` напрямую:

```typescript
return new Response(response.body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

### Готовый метод: `fetcher.streamPrompt()`

Для структуры `streaming` / эндпоинта `stream`:

```typescript
import fetcher from '@/lib/directual/fetcher';

const result = await fetcher.streamPrompt('Привет!', {
  onData: (data: unknown) => {
    // Парсим Anthropic SSE формат
    const chunk = data as { content?: string };
    if (!chunk || typeof chunk.content !== 'string') return;

    const line = chunk.content;
    if (!line.startsWith('data: ')) return;

    const parsed = JSON.parse(line.slice(6));
    if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
      // Текст от модели — выводим посимвольно
      console.log(parsed.delta.text);
    }
  },
  onError: (error) => console.error('Ошибка:', error),
  onComplete: () => console.log('Готово'),
});

// Остановить стрим
if (result.success && result.stream) {
  result.stream.abort();
}
```

### Универсальный метод: `fetcher.stream()`

Для любой структуры/эндпоинта:

```typescript
const result = await fetcher.stream(
  'my_structure',      // структура
  'my_endpoint',       // эндпоинт
  { prompt: 'hello' }, // тело запроса
  {
    onData: (data, event) => {
      // event: 'start' | 'chunk' | 'done'
      // data — автоматически распаршен из JSON
      console.log(event, data);
    },
    onError: (error) => console.error('Ошибка:', error),
    onComplete: () => console.log('Стрим завершён'),
  },
);

// Результат содержит управление стримом
if (result.success && result.stream) {
  // Прервать стрим в любой момент
  result.stream.abort();

  // Или дождаться завершения
  await result.stream.promise;
}
```

### Добавление стрим-эндпоинта в Fetcher

```typescript
// lib/directual/fetcher.ts

async streamChat(
  payload: Record<string, unknown>,
  callbacks: StreamCallbacks,
  queryParams: Record<string, unknown> = {}
): Promise<StreamResult> {
  return this.stream('chat_messages', 'streamChat', payload, callbacks, queryParams);
}
```

### Сигнатура `fetcher.stream()`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `structure` | `string` | Название структуры Directual |
| `endpoint` | `string` | Название эндпоинта |
| `payload` | `object` | Тело POST-запроса |
| `callbacks` | `{ onData, onError?, onComplete? }` | Коллбеки для приёма данных |
| `params` | `object` | Дополнительные query-параметры (опционально) |
| `silent` | `boolean` | Не показывать алерт при ошибке (опционально) |

## User Actions — единая точка входа для действий

Паттерн **«единая точка входа»**: вместо создания отдельного эндпоинта под каждое действие, все пользовательские действия отправляются в одну структуру `user_actions`. Тип действия определяется полем `action`, а данные — полем `payload`.

Это упрощает фронт (один метод на все случаи) и бекенд (одна структура, маршрутизация через сценарии Directual по полю `action`).

### Использование

```typescript
import fetcher from '@/lib/directual/fetcher';

// Любое пользовательское действие — один метод
await fetcher.postUserAction('submit_feedback', { text: 'Всё супер', rating: 5 });
await fetcher.postUserAction('invite_user', { email: 'friend@example.com' });
await fetcher.postUserAction('change_role', { userId: '123', role: 'admin' });
```

### Структура запроса

| Поле | Тип | Описание |
|------|-----|----------|
| `action` | `string` | Название действия (например `submit_feedback`, `invite_user`) |
| `payload` | `object` | Произвольные данные действия |

### Настройка в Directual

1. Создать структуру `user_actions` с полями `action` (string) и `payload` (json/object)
2. Создать эндпоинт `postUserAction` (POST) на структуре `user_actions`
3. Создать сценарии с триггером на создание записи в `user_actions`, фильтруя по полю `action`

Например: сценарий «Обработка фидбэка» срабатывает при `action == "submit_feedback"` и делает что нужно с данными из `payload`.

## Загрузка файлов

Шаблон включает готовый механизм загрузки файлов на сервер Directual через `fetcher.uploadFile`.

### Как работает

1. Файл отправляется `multipart/form-data` на эндпоинт `file_links/uploadFiles`
2. Запрос проксируется через Next.js rewrites (обход CORS)
3. При наличии колбэка `onProgress` используется `XMLHttpRequest` для отслеживания прогресса загрузки
4. Directual возвращает `{ urlLink: string }` — URL загруженного файла

### Использование

```typescript
import fetcher from '@/lib/directual/fetcher';

// Простая загрузка
const result = await fetcher.uploadFile(file);
if (result.success && result.data) {
  console.log('URL файла:', result.data.urlLink);
}

// С отслеживанием прогресса
const result = await fetcher.uploadFile(file, (percent) => {
  console.log(`Загружено: ${Math.round(percent)}%`);
});
```

### Пример: аватарка в профиле

На странице профиля (`app/dashboard/profile/page.tsx`) реализован полный флоу загрузки аватарки:

1. Клик по аватару открывает `<input type="file" accept="image/*">`
2. Выбранный файл мгновенно показывается как локальный превью (`URL.createObjectURL`)
3. Файл загружается через `fetcher.uploadFile` с круговым прогресс-баром поверх аватара
4. Полученный URL сохраняется в локальный стейт (`pendingUserpic`), появляется кнопка «Сохранить»
5. По клику «Сохранить» URL записывается в поле `userpic` профиля вместе с остальными полями

### Настройка в Directual

Для работы загрузки нужен эндпоинт:

| Эндпоинт | Метод | Структура | Назначение |
|----------|-------|-----------|------------|
| `uploadFiles` | POST | `file_links` | Загрузка файлов (multipart/form-data) |

Также в `next.config.ts` должен быть настроен rewrite для проксирования запросов:

```
/good/api/v5/* → https://api.directual.com/good/api/v5/*
```

## WebSocket события

### Отправка с бекенда (Directual сценарий):

```javascript
// Уведомление
socket.emit('alert', {
  variant: 'default',
  title: 'Успешно!',
  description: 'Данные обновлены',
  icon: 'CheckCircle'
});

// Обновление данных
socket.emit('refresh');
```

### Прослушивание кастомных событий на клиенте:

```typescript
import { useSocketEvent } from '@/hooks/use-socket';

// Для своих кастомных событий — используйте useSocketEvent
useSocketEvent('custom_event', (payload) => {
  console.log('Получено событие:', payload);
});
```

## Деплой

### Vercel (рекомендуется для быстрого старта):

```bash
# 1. Установить Vercel CLI
npm i -g vercel

# 2. Деплой
vercel

# 3. Добавить переменные окружения в Vercel Dashboard
```

### Docker (для production):

#### Локальная сборка:

```bash
# Build образа с передачей APP_ID
docker build \
  --build-arg NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id \
  -t nextjs-directual-app .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id \
  nextjs-directual-app
```

#### Docker Compose:

```bash
# Создать .env файл
echo "NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id" > .env

# Запустить
docker-compose up -d

# Остановить
docker-compose down
```

### Деплой в облако (Docker)

Выберите облачный провайдер для хостинга Docker-контейнеров:

#### 1. Любой VPS (Россия / международный)

```bash
# 1. Арендовать VPS (Ubuntu 22.04) у любого провайдера
# 2. Подключиться по SSH
ssh root@your-server-ip

# 3. Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Склонировать репозиторий
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 5. Создать .env
nano .env
# Добавить: NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id

# 6. Запустить
docker-compose up -d

# 7. Настроить nginx reverse proxy (опционально)
```

#### 2. Railway.app (международный, карта любая)

1. Зарегистрироваться на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Выбрать ваш репозиторий
4. Railway автоматически обнаружит Dockerfile
5. Добавить переменную окружения: `NEXT_PUBLIC_DIRECTUAL_APP_ID`
6. Deploy!

**Цена:** $5/мес базовый план (500 часов работы)

#### 3. Render.com (международный)

1. Зарегистрироваться на [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Настройки:
   - Environment: Docker
   - Build Command: (автоматически)
   - Environment Variables: добавить `NEXT_PUBLIC_DIRECTUAL_APP_ID`
5. Create Web Service

**Цена:** от $7/мес за 512MB RAM

#### 4. DigitalOcean App Platform

```bash
# 1. Установить doctl CLI
brew install doctl  # macOS
# или скачать с github.com/digitalocean/doctl

# 2. Авторизоваться
doctl auth init

# 3. Создать App
doctl apps create --spec .do/app.yaml
```

Создать `.do/app.yaml`:

```yaml
name: nextjs-directual-app
services:
- name: web
  github:
    repo: your-username/your-repo
    branch: main
    deploy_on_push: true
  dockerfile_path: Dockerfile
  envs:
  - key: NEXT_PUBLIC_DIRECTUAL_APP_ID
    value: your_app_id
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs
```

**Цена:** от $5/мес

#### 5. Selectel (Россия, рубли)

Арендуете VPS, ставите Docker, деплоите через docker-compose.

**Цена:** от ~250₽/мес

#### 6. VK Cloud (Россия, рубли)

VPS с Docker или Container as a Service:

1. Создать виртуальную машину или контейнер
2. Настроить Docker
3. Задеплоить через docker-compose или загрузить образ

**Цена:** от ~400₽/мес

### GitHub Actions CI/CD

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, master]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            NEXT_PUBLIC_DIRECTUAL_APP_ID=${{ secrets.DIRECTUAL_APP_ID }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

#### Необходимые GitHub Secrets:

- `DIRECTUAL_APP_ID` — ваш Directual APP_ID
- `DEPLOY_HOST` — IP/домен сервера (если есть deploy step)
- `DEPLOY_USER` — SSH user (если есть deploy step)
- `DEPLOY_KEY` — SSH приватный ключ (если есть deploy step)

Образы будут публиковаться в GitHub Container Registry (`ghcr.io/your-username/repo-name`)

## Полезные команды

```bash
npm run dev          # Development сервер
npm run build        # Production build
npm run start        # Production сервер
npm run lint         # ESLint проверка
```

## Полезные ссылки

- [Next.js Docs](https://nextjs.org/docs)
- [Directual Docs](https://readme.directual.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## Лицензия

MIT
