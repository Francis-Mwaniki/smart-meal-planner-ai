# Railway Hackathon 2025 — Smart Meal Planner (Next.js + Postgres + AI)

An AI-powered meal planning app built with Next.js 14, TypeScript, Prisma, and PostgreSQL. It generates meal plans, shopping lists, and nutrition analysis using OpenRouter, with optional email notifications via Resend. Optimized for deployment on Railway with a public template and clear setup instructions.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/REPLACE_WITH_TEMPLATE_ID)

## Quick links
- Live app: `https://REPLACE_WITH_YOUR_SUBDOMAIN.railway.app`
- Railway template: `https://railway.app/template/REPLACE_WITH_TEMPLATE_ID`
- GitHub repo: `https://github.com/REPLACE_WITH_OWNER/railway-hackathon-meal-planner`

## Features
- AI meal plan generation via OpenRouter
- Personalized recipe recommendations
- Nutrition analysis
- Smart shopping lists
- Email notifications (optional via Resend)
- Authentication (NextAuth-ready)

## Stack and services (Railway)
- Web service: Next.js 14 (App Router)
- Database: PostgreSQL (Railway managed)
- AI: OpenRouter API (external)
- Email: Resend (optional)

## One-click deploy (Railway)
1. Click the Deploy button above
2. Provision PostgreSQL when prompted
3. Set environment variables (below)
4. Deploy and wait for build
5. Make project Public and Create Template (see Template section)

## Environment variables
Set these in `.env.local` for local dev and in Railway Project → Variables for production.

Required
- `DATABASE_URL` — Provided by Railway Postgres
- `NEXTAUTH_SECRET` — Strong random string
- `NEXTAUTH_URL` — Local: `http://localhost:3000` | Prod: your Railway URL

Optional
- `OPENROUTER_API_KEY` — Enables AI features
- `RESEND_API_KEY` — Enables email notifications
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Enables Google OAuth

See `SETUP.md` and `AUTH_SETUP.md` for more.

## Local development
Prereqs: Node 18+, pnpm or npm, Postgres (local or Railway connection string)

```bash
pnpm install # or npm install
npx prisma generate
npx prisma db push
pnpm dev # or npm run dev
```
Visit `http://localhost:3000`.

## API overview
- POST `/api/generate-meal-plan` — Generate AI meal plan
- POST `/api/meal-plans/generate` — Alternate generator
- GET `/api/meal-plans` — List meal plans
- POST `/api/meal-plans/[mealPlanId]/items` — Add items to a plan
- POST `/api/recipes/recommendations` — Recipe suggestions
- GET `/api/recipes/[recipeId]` — Recipe details
- POST `/api/recipes/favorites` — Manage favorites
- POST `/api/nutrition/analyze` — Nutrition analysis
- GET/POST `/api/shopping-lists` — Manage lists
- GET/DELETE `/api/shopping-lists/[id]` — List details
- POST `/api/auth/register` — Register user
- NextAuth routes under `/api/auth/[...nextauth]`

## Database (Prisma + PostgreSQL)
Common commands
```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

## Make public and create a Railway template
After first successful deploy on Railway:
1. Project → Settings → Visibility → set to Public
2. Project → Templates → Create from project
3. Fill in template metadata (name, description, tags)
4. Add variables to the template (match the Environment variables section)
5. Copy template URL and replace placeholders in this README

## Railway hackathon compliance
- Multiple services: Web (Next.js) + PostgreSQL + AI (OpenRouter) + Email (Resend)
- Modern stack: Next.js 14, TypeScript, Prisma
- Public template: One‑click deploy ready
- Written content: Publish a blog/tutorial and link it in your submission

## Submission checklist
- Project created after the hackathon start date
- Project set to Public on Railway
- Template created and shared
- README includes Deploy button, env vars, and setup
- Live demo link added
- Written content published and linked

## License
MIT
