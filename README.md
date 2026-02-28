# Anthem Academy

Multi-org education and operations platform for youth programs — MVP through V1.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Validation | Zod |
| Package Manager | pnpm (monorepo) |
| Hosting | Vercel |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |

## Repo Structure

```
Anthem-Academy/
├── apps/
│   └── web/          # Next.js 15 application
├── supabase/
│   ├── migrations/   # SQL migration files
│   └── config.toml   # Local dev config
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/
    └── runbooks/     # Operational runbooks
```

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Supabase CLI (`brew install supabase/tap/supabase` or see [docs](https://supabase.com/docs/guides/cli))
- Docker (for local Supabase)

### 1. Clone & Install

```bash
git clone https://github.com/Anthem-nation/Anthem-Academy.git
cd Anthem-Academy
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example apps/web/.env.local
# Fill in your Supabase project URL and anon key
```

### 3. Start Local Supabase

```bash
pnpm supabase:start
# Supabase Studio: http://localhost:54323
# API URL:         http://localhost:54321
```

### 4. Run Migrations

```bash
pnpm db:migrate
```

### 5. Start the Dev Server

```bash
pnpm dev
# App: http://localhost:3000
```

## Branch Strategy

```
feature/* ──► main (staging auto-deploy)
                └──► production (prod deploy — nishanth1104 only)
```

| Branch | Environment | Who can merge |
|---|---|---|
| `main` | Staging | Any team member (CI must pass + 1 approval) |
| `production` | Production | nishanth1104 only (CODEOWNERS + CI must pass) |
| `feature/*` | Local | PRs target `main` |

## Environment Variables

See [`.env.example`](.env.example) for the full list of required variables.

### GitHub Secrets Required for CI/CD

| Secret | Description |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase account access token |
| `SUPABASE_STAGING_PROJECT_ID` | Staging Supabase project ref |
| `SUPABASE_PRODUCTION_PROJECT_ID` | Production Supabase project ref |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_STAGING_PROJECT_ID` | Vercel staging project ID |
| `VERCEL_PRODUCTION_PROJECT_ID` | Vercel production project ID |

## Scripts

```bash
pnpm dev             # Start dev server
pnpm build           # Build for production
pnpm type-check      # TypeScript check
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm test:unit       # Vitest unit tests
pnpm test:e2e        # Playwright E2E tests
pnpm supabase:start  # Start local Supabase
pnpm supabase:stop   # Stop local Supabase
pnpm db:migrate      # Push migrations
pnpm db:reset        # Reset local DB
```

## Team

| Role | GitHub |
|---|---|
| Platform Lead | @nishanth1104 |
