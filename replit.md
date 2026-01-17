# AEO Dashboard - AI Visibility & Answer Engine Optimization

## Overview
A full-stack SaaS application for tracking and improving brand visibility in AI-powered answers. The app helps businesses monitor how AI assistants like ChatGPT mention or recommend their brand compared to competitors.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: In-memory storage (MemStorage)
- **AI**: OpenAI via Replit AI Integrations (gpt-4o-mini)
- **Auth**: Supabase Authentication with custom login/signup pages

## Key Features
1. **Landing Page** - ClickUp-inspired marketing site with hero, solutions, features, ROI, and pricing sections
2. **Dashboard** - Project management with sidebar navigation
3. **Prompt Sets** - Organize buyer-intent questions by persona, funnel stage, country
4. **AI Visibility Scans** - Run prompts through LLM, score brand visibility (0-2)
5. **Gap Analysis** - Identify where competitors are mentioned but you're not
6. **AEO Suggestions** - AI-generated recommendations for content improvement

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
└── llm-client.ts      # OpenAI integration for answer generation and visibility scoring

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

## AI Visibility Scoring
- **2** = Clearly recommended or strongly endorsed
- **1** = Mentioned but not the main recommendation
- **0** = Not mentioned at all

## Running the App
The app runs on port 5000 with `npm run dev`. The frontend is served via Vite with Express backend.

## Design System
- Uses Inter font for UI
- Purple primary color (hsl 250 89% 60%)
- Success green, warning yellow, destructive red for scores
- ClickUp-inspired clean, modern layout with bold typography
