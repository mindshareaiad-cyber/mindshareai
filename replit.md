# Mindshare AI - AI Visibility & Answer Engine Optimization

## Overview
A full-stack SaaS application for tracking and improving brand visibility in AI-powered answers. The app helps businesses monitor how AI assistants like ChatGPT mention or recommend their brand compared to competitors. Deployed on Render with PostgreSQL.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Render)
- **AI**: OpenAI, Anthropic, Google Gemini, Perplexity, DeepSeek (direct API keys)
- **Auth**: Supabase Authentication with custom login/signup pages
- **Email**: Resend for transactional emails
- **Payments**: Stripe (webhooks via Stripe Dashboard)
- **Hosting**: Render

## Key Features
1. **Landing Page** - ClickUp-inspired marketing site with hero, solutions, features, ROI, and pricing sections
2. **Dashboard** - Project management with left sidebar navigation showing:
   - **Overview** - Core AI visibility metrics (Score, Mentions, Recommendations, Share of Voice, Gap Opportunities)
   - **Prompts** - Organize buyer-intent questions by persona, funnel stage, country
   - **Results** - View scan results after running AI visibility scans
   - **Gap Analysis** - Identify where competitors are mentioned but you're not
   - **AEO Suggestions** - AI-generated recommendations for content improvement
3. **AI Visibility Scans** - Run prompts through 5 AI engines, score brand visibility (0-2)
4. **Competitor Share of Voice** - Compare your visibility against competitors
5. **Prompt-Level Performance** - Per-prompt table with filters (Gaps, Winning, Mentioned, Invisible)

## Project Structure
```
client/src/
├── components/
│   ├── landing/       # Hero, Solutions, Features, ROI, Pricing, Header, Footer
│   ├── dashboard/     # AppSidebar, DashboardHeader, Tabs (Overview, Prompts, Results, Suggestions)
│   └── ui/            # shadcn components
├── contexts/
│   └── auth-context.tsx  # Supabase auth context provider
├── lib/
│   └── supabase.ts    # Supabase client configuration
├── pages/
│   ├── landing.tsx    # Marketing landing page
│   ├── login.tsx      # Custom login page
│   ├── signup.tsx     # Custom signup page
│   └── dashboard.tsx  # Main app dashboard (protected)
└── App.tsx            # Router setup with auth

server/
├── index.ts           # Server entry point with database auto-init
├── routes.ts          # API endpoints
├── storage.ts         # PostgreSQL data storage via Drizzle ORM
├── db.ts              # Database connection pool
├── llm-client.ts      # Multi-engine AI client (OpenAI, Anthropic, Gemini, Perplexity, DeepSeek)
├── email-service.ts   # Transactional email templates and send functions
├── resend-client.ts   # Resend client (direct API key)
├── stripeClient.ts    # Stripe client (direct API key)
├── webhookHandlers.ts # Stripe webhook handlers with native Stripe event processing
├── auth-middleware.ts # Supabase JWT verification middleware
├── plans.ts           # Subscription plan limits and enforcement
├── seo-readiness.ts   # SEO readiness scoring logic
└── static.ts          # Production static file serving

shared/
└── schema.ts          # Drizzle ORM schema: UserProfile, Project, PromptSet, Prompt, Scan, ScanResult, SeoReadiness

script/
└── build-external.ts  # Production build script (Vite client + esbuild server)
```

## API Authentication
All user-specific endpoints require a valid Supabase JWT token in the `Authorization: Bearer <token>` header. The backend verifies the token with Supabase and checks ownership (user can only access their own data). Sensitive fields (Stripe customer/subscription IDs) are stripped from all profile responses.

**Public endpoints (no auth required):** `/api/plans`, `/api/engines`, `/api/stripe/publishable-key`, `/api/contact`
**Protected endpoints (auth required):** All user profile, project, scan, prompt, gap, and subscription endpoints

## API Endpoints
- `GET/POST /api/projects` - List/create projects (auth required)
- `GET /api/projects/:id/prompt-sets` - Get prompt sets with prompts
- `POST /api/projects/:id/prompt-sets` - Create prompt set
- `POST /api/prompt-sets/:id/prompts` - Add prompt to set
- `POST /api/projects/:id/scans` - Run AI visibility scan
- `GET /api/projects/:id/scans/latest` - Get latest scan results
- `GET /api/projects/:id/gaps` - Get gap analysis
- `POST /api/gaps/:promptId/suggest` - Generate AEO suggestion
- `GET /api/projects/:id/seo-readiness` - Get SEO readiness assessment
- `PATCH /api/projects/:id/seo-readiness` - Update SEO readiness checklist

## AI Visibility Scoring
- **2** = Clearly recommended or strongly endorsed
- **1** = Mentioned but not the main recommendation
- **0** = Not mentioned at all

## Subscription Plans (with Backend Enforcement)
- **Starter ($29/mo)**: 1 project, 50 prompts, 1 engine (ChatGPT), 10 scans/month
- **Growth ($79/mo)**: 5 projects, 200 prompts, 2 engines (ChatGPT + Gemini), 50 scans/month, gap analysis, AEO suggestions
- **Pro ($199/mo)**: 50 projects, 1000 prompts, all 5 engines, 500 scans/month, all Growth features, priority support

Plan limits are enforced server-side via `server/plans.ts`. Stripe price ID is stored in user profile during checkout verification for accurate tier detection.

## AI Engines
- **ChatGPT** - GPT-4o-mini via OpenAI (`OPENAI_API_KEY`)
- **Claude** - Claude Sonnet 4.5 via Anthropic (`ANTHROPIC_API_KEY`)
- **Gemini** - Gemini 2.5 Flash via Google (`GOOGLE_API_KEY`)
- **Perplexity** - Llama 3.1 Sonar with web search (`PERPLEXITY_API_KEY`)
- **DeepSeek** - DeepSeek Chat (`DEEPSEEK_API_KEY`)

## AI Engines by Subscription Tier
- **Starter**: ChatGPT only
- **Growth**: ChatGPT + Gemini
- **Pro**: All 5 engines

## Transactional Emails (Resend)
Uses Resend for automated emails. All emails are fire-and-forget (non-blocking).

**Email Types:**
- **Welcome** - Sent when a new user profile is created (signup)
- **Subscription Activated** - Sent after successful Stripe payment verification
- **Plan Changed** - Sent via webhook when user upgrades/downgrades
- **Cancellation** - Sent via webhook when subscription is canceled
- **Payment Failed** - Sent via webhook when payment fails

## Stripe Webhooks
Webhooks are processed directly using Stripe's native event verification (no stripe-replit-sync). Configure your webhook endpoint in the Stripe Dashboard pointing to `https://your-domain/api/stripe/webhook`.

Events handled:
- `customer.subscription.created` / `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Render Deployment
- **Build Command:** `npm install && npx tsx script/build-external.ts`
- **Start Command:** `NODE_ENV=production node dist/index.mjs`
- **Health Check Path:** `/api/plans`
- Database tables are auto-created on first startup

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (Render internal URL)
- `APP_URL` - Your Render URL (e.g., https://mindshare-ai.onrender.com)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` - Supabase auth
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - Stripe payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SESSION_SECRET` - Express session secret
- `OPENAI_API_KEY` - ChatGPT engine
- `ANTHROPIC_API_KEY` - Claude engine
- `GOOGLE_API_KEY` - Gemini engine
- `PERPLEXITY_API_KEY` - Perplexity engine
- `DEEPSEEK_API_KEY` - DeepSeek engine
- `RESEND_API_KEY` - Transactional emails
- `RESEND_FROM_EMAIL` - Sender address (default: noreply@mindshare-ai.com)

## Running the App
The app runs on port 5000 with `npm run dev`. The frontend is served via Vite with Express backend.

## Design System
- Uses Inter font for UI
- Purple primary color (hsl 250 89% 60%)
- Success green, warning yellow, destructive red for scores
- ClickUp-inspired clean, modern layout with bold typography
