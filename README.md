# Papel Edu-Care Quiz Platform

Next.js + Supabase quiz platform for Papel Edu-Care.

## Features

- Student direct entry
- Admin login
- Quiz create/edit
- Quiz schedule start/end
- MCQ question management
- CSV bulk upload
- One-attempt quiz rule
- Timer-based quiz page
- Result card PNG download with watermark
- Leaderboard, results, and students pages

## Local Setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor.
3. Optional: run [supabase/sample_seed.sql](supabase/sample_seed.sql).
4. Copy `.env.example` to `.env.local` and fill the values.
5. Install dependencies and run locally:

```bash
npm install
npm run dev
```

Admin URL: `/admin/login`

## Environment Variables

Add these values locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_USER=admin@example.com
ADMIN_PASS=change-this-admin-password
ADMIN_SESSION_TOKEN=change-this-to-a-long-random-string
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Important: never commit `.env.local` or real Supabase service role keys.

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the GitHub repository in Vercel.
3. Add all environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Deploy.

## Supabase

- Use [supabase/schema.sql](supabase/schema.sql) to create tables and policies.
- Use [supabase/sample_seed.sql](supabase/sample_seed.sql) only for demo data.

## Build Checks

```bash
npm run lint
npm run build
```
