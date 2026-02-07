# Mindshare AI - AI Visibility & Answer Engine Optimization

## Overview
A full-stack SaaS application for tracking and improving brand visibility in AI-powered answers. The app helps businesses monitor how AI assistants like ChatGPT mention or recommend their brand compared to competitors.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: In-memory storage (MemStorage)
- **AI**: OpenAI via Replit AI Integrations (gpt-4o-mini)
- **Auth**: Supabase Authentication with custom login/signup pages
- **Email**: Resend (via Replit integration) for transactional emails

## Key Features
1. **Landing Page** - ClickUp-inspired marketing site with hero, solutions, features, ROI, and pricing sections
2. **Dashboard** - Project management with left sidebar navigation showing:
   - **Overview** - Core AI visibility metrics (Score, Mentions, Recommendations, Share of Voice, Gap Opportunities)
   - **Prompts** - Organize buyer-intent questions by persona, funnel stage, country
   - **Results** - View scan results after running AI visibility scans
   - **Gap Analysis** - Identify where competitors are mentioned but you're not
   - **AEO Suggestions** - AI-generated recommendations for content improvement
3. **AI Visibility Scans** - Run prompts through ChatGPT (GPT-4o-mini) or DeepSeek, score brand visibility (0-2)
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
├── routes.ts          # API endpoints
├── storage.ts         # In-memory data storage
├── llm-client.ts      # OpenAI integration for answer generation and visibility scoring
├── email-service.ts   # Transactional email templates and send functions (Resend)
├── resend-client.ts   # Resend client with Replit integration credentials
└── webhookHandlers.ts # Stripe webhook handlers (subscription emails triggered here)

shared/
└── schema.ts          # Data models: Project, PromptSet, Prompt, Scan, ScanResult
```

## API Endpoints
- `GET/POST /api/projects` - List/create projects
- `GET /api/projects/:id/prompt-sets` - Get prompt sets with prompts
- `POST /api/projects/:id/prompt-sets` - Create prompt set
- `POST /api/prompt-sets/:id/prompts` - Add prompt to set
- `POST /api/projects/:id/scans` - Run AI visibility scan
- `GET /api/projects/:id/scans/latest` - Get latest scan results
- `GET /api/projects/:id/gaps` - Get gap analysis
- `POST /api/gaps/:promptId/suggest` - Generate AEO suggestion
- `GET /api/projects/:id/seo-readiness` - Get SEO readiness assessment
- `PATCH /api/projects/:id/seo-readiness` - Update SEO readiness checklist

## SEO Readiness Assessment
Helps businesses understand if their SEO foundation is ready for AEO. Includes:

**Checklist Items (weighted scoring):**
- hasWebsite: 20 pts
- hasBlogOrKnowledgeBase: 15 pts
- hasFaqSection: 15 pts
- hasMetaDescriptions: 10 pts
- hasStructuredHeaders: 10 pts
- hasSchemaMarkup: 10 pts
- hasContactInfo: 10 pts
- hasSocialProfiles: 10 pts

**Recommendation Levels:**
- not_ready: score < 30
- needs_work: score 30-59
- ready: score 60-84
- excellent: score >= 85

**AEO Ready Threshold:** score >= 60

**UI Behavior:**
- Shows full checklist when not ready
- Collapses to compact card with toggle when ready
- Loading skeleton during data fetch
- Guidance messages provide actionable recommendations

## AI Visibility Scoring
- **2** = Clearly recommended or strongly endorsed
- **1** = Mentioned but not the main recommendation
- **0** = Not mentioned at all

## Subscription Plans (with Backend Enforcement)
- **Starter ($29/mo)**: 1 project, 50 prompts, 1 engine (ChatGPT), 10 scans/month
- **Growth ($79/mo)**: 5 projects, 200 prompts, 2 engines (ChatGPT + Gemini), 50 scans/month, gap analysis, AEO suggestions
- **Pro ($199/mo)**: 50 projects, 1000 prompts, all 5 engines, 500 scans/month, all Growth features, priority support

Plan limits are enforced server-side via `server/plans.ts`. Stripe price ID is stored in user profile during checkout verification for accurate tier detection.

## AI Engines by Subscription Tier
- **Starter**: ChatGPT only (primary/cheapest engine)
- **Growth**: ChatGPT + Gemini (2 engines)
- **Pro**: ChatGPT, Claude, Gemini, Perplexity, DeepSeek (all 5 engines)

## AI Engine Details
- **ChatGPT** - GPT-4o-mini via OpenAI/Replit AI Integrations
- **Claude** - Claude Sonnet 4.5 via Replit AI Integrations (no API key needed)
- **Gemini** - Gemini 2.5 Flash via Replit AI Integrations (no API key needed)
- **Perplexity** - Llama 3.1 Sonar with web search (requires API key)
- **DeepSeek** - DeepSeek Chat (requires API key)

## External Hosting Configuration
The app supports two modes for AI engine configuration:

### Development Mode (Replit)
Uses Replit AI Integrations - no API keys needed for ChatGPT, Claude, Gemini.
Environment variables are auto-configured:
- `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`
- `AI_INTEGRATIONS_GEMINI_API_KEY` / `AI_INTEGRATIONS_GEMINI_BASE_URL`

### Production Mode (External Hosting - AWS, Vercel, etc.)
Set your own API keys - the app will automatically detect and use them:

| Engine | Environment Variable | Get Key From |
|--------|---------------------|--------------|
| ChatGPT | `OPENAI_API_KEY` | platform.openai.com |
| Claude | `ANTHROPIC_API_KEY` | console.anthropic.com |
| Gemini | `GOOGLE_API_KEY` | aistudio.google.com |
| Perplexity | `PERPLEXITY_API_KEY` | perplexity.ai/settings/api |
| DeepSeek | `DEEPSEEK_API_KEY` | platform.deepseek.com |

The code checks for direct API keys first, then falls back to Replit AI Integrations.
On startup, the console logs which mode each engine is using.

### Resend (Email) - External Hosting
Set these environment variables when hosting outside Replit:

| Variable | Description | Get From |
|----------|------------|----------|
| `RESEND_API_KEY` | Resend API key | resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Verified sender address | resend.com/domains (defaults to noreply@mindshare-ai.com) |

On Replit, the Resend integration handles credentials automatically. Outside Replit, the app detects `RESEND_API_KEY` and uses it directly.

## Transactional Emails (Resend)
Uses Resend via Replit integration for automated emails. All emails are fire-and-forget (non-blocking).

**Email Types:**
- **Welcome** - Sent when a new user profile is created (signup)
- **Subscription Activated** - Sent after successful Stripe payment verification
- **Plan Changed** - Sent via webhook when user upgrades/downgrades (price ID changes)
- **Cancellation** - Sent via webhook when subscription status becomes "canceled"
- **Payment Failed** - Sent via webhook when subscription status becomes "past_due"

**Architecture:**
- `server/resend-client.ts` - Fetches credentials from Replit connector, creates Resend client
- `server/email-service.ts` - HTML templates + send functions for each email type
- Emails triggered from: `server/routes.ts` (welcome, subscription activated) and `server/webhookHandlers.ts` (plan change, cancellation, payment failed)

## Running the App
The app runs on port 5000 with `npm run dev`. The frontend is served via Vite with Express backend.

## Design System
- Uses Inter font for UI
- Purple primary color (hsl 250 89% 60%)
- Success green, warning yellow, destructive red for scores
- ClickUp-inspired clean, modern layout with bold typography
