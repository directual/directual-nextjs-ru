# Next.js + Directual Starter Template

A starter template with authentication (magic link, password reset), dashboard, WebSocket connection, and SSE streaming to Directual.

More details on how Directual works with Next.js: https://readme.directual.com/directual-react-js/directual-+-nextjs#pattern-raboty-s-directual

![nextjs + directual template](https://api.directual.com/fileUploaded/nextjs/250c0951-c4e8-458f-8018-8dc481d788a0.jpg)

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Directual** — Backend-as-a-Service platform
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** — Components built on Radix UI
- **Socket.IO** — Real-time WebSocket connection
- **SSE (Server-Sent Events)** — Unbuffered streaming of AI responses
- **TypeScript** — Static typing

## Quick Start

```bash
# 1. Clone the repository

# 2. Install dependencies
npm install

# 3. Create .env.local (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Branding

Replace the placeholder logos and icons with your own:

- **`components/ui/logo.tsx`** — App SVG logo (used in sidebar and auth pages). Contains variants: full, small, and extra small (for collapsed sidebar)
- **`public/icon.png`** — Favicon
- **`public/icon-192.png`** — PWA icon 192x192
- **`public/icon-512.png`** — PWA icon 512x512
- **`public/apple-icon.png`** — Apple Touch Icon 180x180
- **`public/opengraph-image.png`** — OG image for social media (1200x630)
- **`public/manifest.json`** — PWA name and description

## Environment Variables

Create `.env.local`:

```env
# Directual API
NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id_here
```

`your_app_id_here` — go to your Directual app => API => API Keys, copy (or create) the `APP_ID`

## Directual Setup Checklist

### Required Endpoints

All template features (auth, profile, file uploads) work through Directual API endpoints. The template uses the following endpoints (see `lib/directual/fetcher.ts`):

| Endpoint | Method | Structure | Purpose |
|----------|--------|-----------|---------|
| `magicLinkRequest` | POST | `magic_link_link_request` | Request a magic link by email |
| `resetPass` | POST | `ResetPasswordRequest` | Request a password reset link |
| `resetPassword` | POST | `reset_password_inputs` | Set a new password (with token) |
| `profile` | GET/POST | `WebUser` | Read/update profile |
| `postUserAction` | POST | `user_actions` | Single entry point for user actions |
| `uploadFiles` | POST | `file_links` | File uploads |

> **In the new base Directual app template (after February 7, 2026) all required endpoints are already created.** If you created your app on the current template — everything works out of the box, just set the APP_ID.
>
> If you're working with an older app — make sure all listed endpoints exist and are configured. Without a required endpoint, the corresponding feature won't work.

### Get APP_ID

1. Log in to [Directual](https://my.directual.com)
2. Open your app → **API** → **API Keys**
3. Copy the **APP_ID** into `.env.local`

### Create the First User

Users are stored in the system structure **App Users** (`WebUser`). After adding the APP_ID, you can manually create the first user:

1. In Directual, open the **App Users** structure (a.k.a. `WebUser`)
2. Create a new object:
   - **id** — user email (e.g. `admin@example.com`)
   - **password** — password. **Make sure to click the Encrypt button** next to the field, since passwords are stored encrypted
3. Save the object

You can now log in to the app with this email and password.

> If you don't click Encrypt — the password will be saved as a plain string, and authentication won't work: Directual compares hashes, not plain text.

### Set Up Email Sending

For **magic link** (sign in via email link) and **password reset** to work, you need to configure email sending in your Directual app:

1. **Connect an email gateway** — one of the options:
   - **SMTP** plugin in Directual (Plugins → SMTP) — connect your mail server or service (Gmail, Yandex, SendGrid, Mailgun, etc.)
   - Any other email gateway supported by Directual

2. **Set up email sending scenarios:**

#### Magic Link:
1. Create a scenario in Directual
2. Trigger: record creation in `magic_link_link_request`
3. Action: send email with link `https://your-app.com/auth/magic/${token}`

#### Reset Password:
1. Create a scenario in Directual
2. Trigger: record creation in `ResetPasswordRequest`
3. Action: send email with link `https://your-app.com/auth/new-password/${token}`

> Without email configured, magic link and password reset won't work — emails simply won't be sent.

### Set Up WebSocket

1. In Directual → **Plugins** → **Socket.IO**
2. In scenarios you can send events via the PUSH notification step:
   ```javascript
   // Example: sending a notification to a user
   user: "*", // * for broadcast, or specify user ID
   event: 'alert', 
   message: // valid JSON
    {
      "variant": "default",
      "title": "Success",
      "description": "Project \"{{payload.title}}\" created successfully",
      "icon": "CheckCircle"
    }
   ```

Built-in events (handled automatically in `SocketListener`):
- **`alert`** — show a notification (via `window.__showGlobalAlert`)
- **`refresh`** — refresh data (via `window.__refreshData` → `refreshAll()` in DataProvider)

**You can add any custom events** — register a handler in `SocketListener` or use the `useSocketEvent` hook (see below).

> **Important:** don't subscribe to `alert` and `refresh` via `useSocketEvent` — they're already handled in `SocketListener`. Double subscription will cause duplicate calls.

## Project Structure

```
app/
├── api/
│   ├── auth/          # Auth API routes
│   └── good/api/v5/stream/[...path]/  # SSE streaming proxy (unbuffered)
├── auth/              # Auth pages (login, magic, reset)
├── dashboard/         # Protected dashboard pages
│   ├── page.tsx       # Home with streaming test form
│   ├── profile/       # User profile
│   └── settings/      # Settings
├── layout.tsx         # Root layout with providers
└── globals.css        # Global styles (Tailwind + shadcn/ui)

components/
├── ui/                # shadcn/ui components
├── dashboard/         # Dashboard components (sidebar, etc.)
├── auth/              # Auth forms
├── socket-listener.tsx # WebSocket event listener
└── global-alerts.tsx  # Global notifications

context/
├── auth-provider.tsx  # Auth context
├── data-provider.tsx  # Data context (profile)
└── theme-provider.tsx # Theme context (light/dark)

lib/
├── directual/         # Directual API integration
│   ├── client.ts      # API client (apiHost + streamApiHost)
│   ├── fetcher.ts     # Wrapper with methods (get/post/stream/upload)
│   └── socket.ts      # Socket.IO connection
└── utils.ts           # Utilities

types/
└── index.ts           # TypeScript types
```

## Adding New Pages

### Public page:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

### Protected page:

```tsx
// app/dashboard/my-page/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';

export default function MyPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

Add a menu item in `config/dashboard-menu.json`:

```json
{
  "topItems": [
    {
      "id": "my-page",
      "label": "My Page",
      "icon": "Star",
      "type": "route",
      "route": "/dashboard/my-page"
    }
  ]
}
```

## Adding New Endpoints to the Fetcher

```typescript
// lib/directual/fetcher.ts

// GET request
async getMyData(queryParams: Record<string, unknown> = {}): Promise<GetResponse> {
  return this.get('my_structure', 'getMyData', queryParams);
}

// POST request
async postMyAction(payload: Record<string, unknown> = {}): Promise<PostResponse> {
  return this.post('my_actions', 'postMyAction', payload);
}
```

Usage:

```typescript
import { fetcher } from '@/lib/directual/fetcher';

const result = await fetcher.getMyData({ page: 1 });
if (result.success) {
  console.log(result.data);
}
```

## Streaming (SSE)

The template supports real-time streaming via Server-Sent Events. Under the hood: a Route Handler proxies requests to `api.alfa.directual.com` without buffering.

### Streaming Architecture

```
Browser → /api/good/api/v5/stream/* → Route Handler → api.alfa.directual.com
                                            ↓
                                    ReadableStream (unbuffered)
```

**Why not rewrites?** Next.js rewrites buffer the entire response and deliver it to the client only when upstream closes the connection. Streaming via rewrite **does not work**.

**Solution:** Route Handler in `app/api/good/api/v5/stream/[...path]/route.ts` passes through the `ReadableStream` directly:

```typescript
return new Response(response.body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

### Ready-made Method: `fetcher.streamPrompt()`

For the `streaming` structure / `stream` endpoint:

```typescript
import fetcher from '@/lib/directual/fetcher';

const result = await fetcher.streamPrompt('Hello!', {
  onData: (data: unknown) => {
    // Parse Anthropic SSE format
    const chunk = data as { content?: string };
    if (!chunk || typeof chunk.content !== 'string') return;

    const line = chunk.content;
    if (!line.startsWith('data: ')) return;

    const parsed = JSON.parse(line.slice(6));
    if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
      // Text from the model — output character by character
      console.log(parsed.delta.text);
    }
  },
  onError: (error) => console.error('Error:', error),
  onComplete: () => console.log('Done'),
});

// Stop the stream
if (result.success && result.stream) {
  result.stream.abort();
}
```

### Universal Method: `fetcher.stream()`

For any structure/endpoint:

```typescript
const result = await fetcher.stream(
  'my_structure',      // structure
  'my_endpoint',       // endpoint
  { prompt: 'hello' }, // request body
  {
    onData: (data, event) => {
      // event: 'start' | 'chunk' | 'done'
      // data — automatically parsed from JSON
      console.log(event, data);
    },
    onError: (error) => console.error('Error:', error),
    onComplete: () => console.log('Stream finished'),
  },
);

// Result contains stream control
if (result.success && result.stream) {
  // Abort the stream at any time
  result.stream.abort();

  // Or wait for completion
  await result.stream.promise;
}
```

### Adding a Stream Endpoint to the Fetcher

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

### `fetcher.stream()` Signature

| Parameter | Type | Description |
|-----------|------|-------------|
| `structure` | `string` | Directual structure name |
| `endpoint` | `string` | Endpoint name |
| `payload` | `object` | POST request body |
| `callbacks` | `{ onData, onError?, onComplete? }` | Callbacks for receiving data |
| `params` | `object` | Additional query parameters (optional) |
| `silent` | `boolean` | Don't show alert on error (optional) |

## User Actions — Single Entry Point for Actions

The **"single entry point"** pattern: instead of creating a separate endpoint for each action, all user actions are sent to a single `user_actions` structure. The action type is determined by the `action` field, and the data by the `payload` field.

This simplifies the frontend (one method for everything) and backend (one structure, routing via Directual scenarios by the `action` field).

### Usage

```typescript
import fetcher from '@/lib/directual/fetcher';

// Any user action — one method
await fetcher.postUserAction('submit_feedback', { text: 'Great stuff', rating: 5 });
await fetcher.postUserAction('invite_user', { email: 'friend@example.com' });
await fetcher.postUserAction('change_role', { userId: '123', role: 'admin' });
```

### Request Structure

| Field | Type | Description |
|-------|------|-------------|
| `action` | `string` | Action name (e.g. `submit_feedback`, `invite_user`) |
| `payload` | `object` | Arbitrary action data |

### Directual Setup

1. Create a `user_actions` structure with `action` (string) and `payload` (json/object) fields
2. Create a `postUserAction` endpoint (POST) on the `user_actions` structure
3. Create scenarios triggered on record creation in `user_actions`, filtering by the `action` field

For example: a "Handle Feedback" scenario triggers when `action == "submit_feedback"` and processes the data from `payload`.

## File Uploads

The template includes a ready-made file upload mechanism to Directual via `fetcher.uploadFile`.

### How It Works

1. The file is sent as `multipart/form-data` to the `file_links/uploadFiles` endpoint
2. The request is proxied through Next.js rewrites (bypassing CORS)
3. When an `onProgress` callback is provided, `XMLHttpRequest` is used to track upload progress
4. Directual returns `{ urlLink: string }` — the URL of the uploaded file

### Usage

```typescript
import fetcher from '@/lib/directual/fetcher';

// Simple upload
const result = await fetcher.uploadFile(file);
if (result.success && result.data) {
  console.log('File URL:', result.data.urlLink);
}

// With progress tracking
const result = await fetcher.uploadFile(file, (percent) => {
  console.log(`Uploaded: ${Math.round(percent)}%`);
});
```

### Example: Profile Avatar

The profile page (`app/dashboard/profile/page.tsx`) implements a full avatar upload flow:

1. Clicking the avatar opens `<input type="file" accept="image/*">`
2. The selected file is instantly shown as a local preview (`URL.createObjectURL`)
3. The file is uploaded via `fetcher.uploadFile` with a circular progress bar over the avatar
4. The resulting URL is saved to local state (`pendingUserpic`), a "Save" button appears
5. On "Save" click, the URL is written to the `userpic` profile field along with other fields

### Directual Setup

For file uploads to work, you need the following endpoint:

| Endpoint | Method | Structure | Purpose |
|----------|--------|-----------|---------|
| `uploadFiles` | POST | `file_links` | File uploads (multipart/form-data) |

Also, `next.config.ts` must have a rewrite configured to proxy requests:

```
/good/api/v5/* → https://api.directual.com/good/api/v5/*
```

## WebSocket Events

### Sending from the Backend (Directual Scenario):

```javascript
// Notification
socket.emit('alert', {
  variant: 'default',
  title: 'Success!',
  description: 'Data updated',
  icon: 'CheckCircle'
});

// Refresh data
socket.emit('refresh');
```

### Listening to Custom Events on the Client:

```typescript
import { useSocketEvent } from '@/hooks/use-socket';

// For your custom events — use useSocketEvent
useSocketEvent('custom_event', (payload) => {
  console.log('Event received:', payload);
});
```

## Deployment

### Vercel (recommended for quick start):

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel Dashboard
```

### Docker (for production):

#### Local build:

```bash
# Build image with APP_ID
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
# Create .env file
echo "NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id" > .env

# Start
docker-compose up -d

# Stop
docker-compose down
```

### Cloud Deployment (Docker)

Choose a cloud provider for hosting Docker containers:

#### 1. Any VPS

```bash
# 1. Rent a VPS (Ubuntu 22.04) from any provider
# 2. Connect via SSH
ssh root@your-server-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 5. Create .env
nano .env
# Add: NEXT_PUBLIC_DIRECTUAL_APP_ID=your_app_id

# 6. Start
docker-compose up -d

# 7. Set up nginx reverse proxy (optional)
```

#### 2. Railway.app

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select your repository
4. Railway will automatically detect the Dockerfile
5. Add environment variable: `NEXT_PUBLIC_DIRECTUAL_APP_ID`
6. Deploy!

**Price:** $5/mo base plan (500 hours of runtime)

#### 3. Render.com

1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Environment: Docker
   - Build Command: (automatic)
   - Environment Variables: add `NEXT_PUBLIC_DIRECTUAL_APP_ID`
5. Create Web Service

**Price:** from $7/mo for 512MB RAM

#### 4. DigitalOcean App Platform

```bash
# 1. Install doctl CLI
brew install doctl  # macOS
# or download from github.com/digitalocean/doctl

# 2. Authenticate
doctl auth init

# 3. Create App
doctl apps create --spec .do/app.yaml
```

Create `.do/app.yaml`:

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

**Price:** from $5/mo

### GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

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

#### Required GitHub Secrets:

- `DIRECTUAL_APP_ID` — your Directual APP_ID
- `DEPLOY_HOST` — server IP/domain (if using deploy step)
- `DEPLOY_USER` — SSH user (if using deploy step)
- `DEPLOY_KEY` — SSH private key (if using deploy step)

Images will be published to GitHub Container Registry (`ghcr.io/your-username/repo-name`)

## Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Directual Docs](https://readme.directual.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## License

MIT
