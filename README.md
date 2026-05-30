# Math Stars ⭐

A distraction-free, gamified math practice platform for teachers and students (elementary–middle school). Teachers manage classes and track progress; students log in with a class code and practice math facts with streaks, points, and leaderboards.

## Tech Stack

| Layer      | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router, TypeScript)     |
| Database   | Supabase (PostgreSQL + Realtime + Auth) |
| ORM        | Drizzle ORM                             |
| Styling    | Tailwind CSS 4                          |
| Animation  | Framer Motion                           |
| State      | Zustand                                 |
| Deployment | Vercel                                  |

## Features

- **4 math skills** — addition, subtraction, multiplication, division
- **5 difficulty levels** per skill with seeded question generation
- **Gamification** — points, streaks, badges, Web Audio jingles
- **Real-time leaderboard** via Supabase Realtime
- **Teacher tools** — class management, join codes, student progress
- **Student auth** — class code + username (no email, COPPA friendly)
- **Accessibility** — WCAG 2.2 AA, keyboard nav, reduced motion support

## Local Development

### Prerequisites

- Node.js 20+
- Supabase project (free tier at supabase.com)
- `.npmrc` with your npm registry (gitignored)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase values (see Environment Variables below)

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The database requires network access to Supabase (`*.supabase.co` on port 5432). If your network blocks this, use a phone hotspot or run `supabase start` with Docker for a local Supabase instance.

### Environment Variables

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → Data API → `publishable_key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → Data API → `service_role` (reveal secret) |
| `DATABASE_URL` | Supabase → Project Settings → Database → Direct connection string (port 5432) |
| `SESSION_SECRET` | Any 32-byte random string: `openssl rand -base64 32` |
| `CRON_SECRET` | Any 32-byte random string: `openssl rand -base64 32` |

## Database

Schema managed with Drizzle ORM. Migrations live in `supabase/migrations/` and are applied automatically via the Supabase GitHub integration on push to `main`.

```bash
# Generate a new migration after schema changes
npm run db:generate

# Seed skill levels (run once after first migration)
npm run db:seed

# Open Drizzle Studio (requires DATABASE_URL)
npm run db:studio
```

## Deployment

Deployed on Vercel. Connect the GitHub repo and add the 6 environment variables in **Project Settings → Environment Variables**.

The `vercel.json` cron runs `/api/leaderboard/refresh` daily at midnight to aggregate leaderboard scores.
