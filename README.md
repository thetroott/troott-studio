# Troott Studio

### Creator portal for ministers and teachers

> **Troott** is discipleship infrastructure for ministers and teachers — the official home for messages, uploads, and studio workflows. **Troott Studio** is the creator-facing checkout of the web portal: onboarding (KYC / get-started), studio spaces, sermon upload, and analytics.

Package name today: **`@troott/web`** (shared with admin/internal/web checkouts until packages are split).

## Introduction

Ministers need:

- A place to create and manage a studio identity.
- Reliable multipart / S3-oriented sermon uploads.
- Analytics and library tools without using the listener mobile app.

**Troott Studio** focuses on creator journeys (`/studio/:studioCode`, `/get-started`, upload flows). The codebase may still include `/admin/*` routes from the combined portal.

## Technologies

- **TypeScript**
- **React 19**
- **Vite 6**
- **React Router 7**
- **TanStack Query**
- **Tailwind CSS 4**
- **Zustand**
- **Axios**
- **`@troott/ui`**
- **Uppy** (S3 upload pipeline)
- **Sentry / PostHog** (prod)

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm**
- Running **Troott API** + MongoDB
- Upload toggles / AWS-backed API as required for real uploads

### 1. Enter the app

```bash
cd troott-studio
```

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.sample .env
```

| Variable | Purpose |
| --- | --- |
| `VITE_APP_API_URL` | API origin. Sample: `http://localhost:5025` → `{origin}/api/v1` |
| `VITE_APP_ENVIRONMENT` | `development` / `prod` |
| `VITE_USE_REAL_API_UPLOAD` | Prefer `true` when testing real upload against API |
| `VITE_DEPLOYMENT_REGION` | e.g. `us-east-1` |
| `VITE_APP_PUBLIC_SENTRY_DSN` | Optional |
| `VITE_APP_PUBLIC_POSTHOG_*` | Optional |
| `VITE_TROOTT_*` | Store / desktop / web URLs for get-troott helpers |

> Align with API listen port (**5025** vs **8080**).

### 4. Develop

```bash
npm run dev
```

**http://localhost:5053**

Port is shared with other portal checkouts — run one at a time or change the Vite port.

### 5. Build, preview, test

```bash
npm run build
npm start
npm test
npm run lint
```

## Project structure

```text
troott-studio/
├── src/
│   ├── app/           # studio, sermons, get-started, auth, admin (shared), …
│   ├── api/
│   ├── components/    # includes upload shell / studio UI
│   ├── routes/
│   ├── context/
│   └── services/
├── public/
├── scripts/
├── docs/
├── Dockerfile
├── Caddyfile
├── .env.sample
└── package.json
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite on **5053** |
| `npm run build` | Production build |
| `npm start` | Preview |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Product surfaces (intent)

| Area | Notes |
| --- | --- |
| Studio home | `/studio/:studioCode` and related |
| Onboarding | `/get-started` KYC / activation |
| Uploads | Uppy + API / S3 pipeline |
| Analytics / library | Creator dashboards inside `src/app` |

Design language: dark-first charcoal + teal CTA — see `@troott/ui` `DESIGN.md` and studio hex tokens in upload UI.

## Integrations

| Integration | Notes |
| --- | --- |
| Troott API | Auth, studio, upload endpoints |
| `@troott/ui` | Buttons, forms, dialogs, tokens |
| Uppy | Multipart / S3-oriented uploads |
| Observability | Sentry / PostHog in prod |

## Contributing

Branching, PR targets, release flow, and contribution guidelines live in **[CONTRIBUTING.md](./CONTRIBUTING.md)**. PRs should target `staging`.

## Related apps

| App | Role |
| --- | --- |
| `troott-admin` | Platform ops |
| `troott-internal` | Internal umbrella portal |
| `troott-web` | Combined portal checkout |
| `troott-api` | Backend + upload pipeline |
| `troott-mobile` | Listener |
| `troott-website` | Marketing / get-troott CTAs |
| `troott-ui` | Design system |

## License

MIT (see repository `LICENSE` if present).
