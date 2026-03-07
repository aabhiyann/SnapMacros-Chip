# SnapMacros

A premium, AI-powered nutrition tracking application. Photograph your meals and receive instantaneous macronutrient breakdowns, guided by Chip, an interactive Mascot that tracks user habits and streaks.

Built in 72 hours for the AI Hackathon, March 2026.

[Live Demo](https://snapmacros.vercel.app)

---

## Project Overview

SnapMacros aims to eliminate the friction from calorie counting by utilizing Claude Vision.

### Core Features
- **Instant Tracking**: Photograph any meal; macros are returned within seconds via Anthropic Claude.
- **Dynamic Dashboards**: Four animated Macro Rings (Calories, Protein, Carbs, Fat) track progress against daily targets in real-time.
- **Interactive Companion**: Chip, the application mascot, features 8 distinct emotional states driven by real-time user data.
- **Weekly Analytics and Roasts**: Summarizes a user's week via the Claude Text API.
- **Goal Mapping**: Dynamic targets for Bulking, Lean Bulking, Maintaining, and Cutting.
- **Progressive Web Application (PWA)**: Installable natively on iOS and Android without an App Store payload.

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **AI Integration**: Anthropic Claude (`claude-sonnet-4-20250514`) for Vision + Text
- **Backend Infrastructure**: Next.js API Routes (Serverless)
- **Database & Identity**: Supabase (PostgreSQL, Authentication, Object Storage)
- **Hosting Engine**: Vercel
- **Testing Suite**: Jest, React Testing Library
- **Design System**: Bricolage Grotesque & DM Sans

Please see `DESIGN_SYSTEM.md` for complete UI patterns, layout specifications, and animation standards.

---

## System Architecture

All AI requests are strictly server-side through Vercel Edge endpoints to prevent leakage of API keys.

1. **Client**: Next.js App Router providing cached UI states.
2. **API Layer (`/api`)**:
   - `/api/analyze`: Relays Base64 images to Anthropic Claude Vision.
   - `/api/roast`: Validates weekly SQL records and requests a summary from Claude.
   - `/api/log` & `/api/dashboard`: Mutates and queries data via the Supabase Node runtime.
3. **Database Layer**: Supabase PostgreSQL utilizing Row Level Security (RLS) to firmly isolate customer data records. A database trigger pre-aggregates the `daily_summaries` table.

## Engineering Standards

- **CI/CD Validation**: GitHub Actions trigger type-checks, ESLint linting, and Jest tests on every PR.
- **Data Validation**: End-to-end type safety mapped from the UI components through Zod schemas down into Postgres row definitions.
- **Testing Paradigms**: Independent unit tests for the TDEE targeting formula and Mascot Agent State Machine. 

---

## Local Development

### Prerequisites
- Node.js 18+
- Supabase CLI

### Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/aabhiyann/snapmacros
cd snapmacros
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```
Fill in the following variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

4. **Initialize Database**
```bash
# Deploys the local schema, RLS policies, triggers, and seed data
npx supabase init
supabase db push
```

5. **Start Development Server**
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## Documentation

- `DESIGN_SYSTEM.md`: Strict aesthetic laws and brand rules.
- `CHANGELOG.md`: History of feature additions.
- `/supabase/migrations`: Versioned SQL architecture files.

## License

MIT License. Designed and engineered by Abhiyan at the 2026 AI Hackathon.
