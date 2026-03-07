# 🥚 SnapMacros

> Snap your food. Know your macros. Get roasted by Chip.

**SnapMacros** is an AI-powered nutrition tracker where you photograph any meal and get an instant macro breakdown. Your mascot — Chip, a tiny hatching egg — reacts emotionally to your eating habits and delivers a personalized weekly roast every Sunday.

Built in 72 hours at the AI Hackathon, March 2026.

[**Try it →**](https://snapmacros.vercel.app) | [**Watch demo**](#demo) | [**Case study**](#)

---

## What It Does

| Feature | Description |
|---|---|
| 📷 **Snap to Track** | Photograph food → Claude Vision analyzes it → macros in < 5 seconds |
| 💪 **Macro Rings** | 4 animated rings (calories, protein, carbs, fat) update in real-time |
| 🥚 **Chip the Mascot** | 8 emotional states — reacts to every meal, streak, and missed day |
| 🔥 **Weekly Roast** | Chip roasts your actual meals by name every Sunday |
| 🎯 **Goal Modes** | Bulk, Lean Bulk, Maintain, Fat Loss, Cut — targets auto-calculated |
| 📱 **PWA** | Installs on iPhone home screen via a URL, no App Store needed |

---

## Demo

[Demo GIF or screenshot here]

**Try the demo** — no sign-up required:
1. Open [snapmacros.vercel.app](https://snapmacros.vercel.app)
2. Tap "Try Demo"
3. Snap food or use demo account's pre-loaded week

---

## Tech Stack

```
Frontend:  Next.js 14 (App Router), TypeScript, Tailwind CSS
Animation: Framer Motion (all animations, Chip's 8 emotional states)
AI:        Claude claude-sonnet-4-20250514 (Vision + Text)
Backend:   Next.js API Routes (serverless)
Database:  Supabase (PostgreSQL, Auth, Storage)
Hosting:   Vercel
Testing:   Jest, Testing Library
CI/CD:     GitHub Actions
Fonts:     Bricolage Grotesque + DM Sans
```

---

## Architecture

```
User's Phone (PWA)
    ↓
Vercel Edge (Next.js 14 API routes)
    ├── /api/analyze  → Anthropic Claude (Vision)
    ├── /api/roast    → Anthropic Claude (Text)
    ├── /api/log      → Supabase Postgres
    └── /api/dashboard→ Supabase Postgres
    ↓
Supabase (Postgres + Auth + Storage)
```

**Key decisions:**
- All Claude API calls are server-side — key never exposed to client
- Supabase RLS policies enforce data isolation at the database level
- `daily_summaries` table is pre-aggregated via trigger for fast dashboard loads
- CONCURRENTLY indexes added after profiling slow queries

---

## Engineering Highlights

- **CI/CD:** GitHub Actions runs type-check + ESLint + Jest (70% coverage gate) + build verification on every PR. Deploys automatically to Vercel on `main` merge.
- **Database:** Versioned SQL migrations (001–004). Supabase RLS prevents cross-user data access.
- **Validation:** Zod schemas on all API routes — runtime type safety matching compile-time types.
- **Testing:** Unit tests for all deterministic logic (TDEE calculations, Chip state machine). Integration tests for API routes with mocked Claude.
- **Performance:** Pre-aggregated daily summaries, CONCURRENTLY indexes, 30s cache on dashboard endpoint.

---

## Getting Started

```bash
# Clone
git clone https://github.com/aabhiyann/snapmacros
cd snapmacros

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY

# Database
npx supabase db push

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Chip — The Mascot

Chip is a tiny hatching egg with 8 emotional states:

| State | Trigger |
|---|---|
| 😊 Happy | Default |
| 🎉 Hype | Protein goal hit, 3–6 day streak |
| 😱 Shocked | Single meal > 900 cal |
| 😂 Laughing | Weekly roast time |
| 😢 Sad | Missed 3+ days |
| 🔥 On Fire | 7+ day streak |
| 🤔 Thinking | AI analyzing photo |
| 😴 Sleepy | 9pm, no logs today |

---

## Project Structure

```
src/
├── app/           Next.js App Router pages + API routes
├── components/    React components (chip/, rings/, food/, layout/, ui/)
├── lib/           Types, utils, agents, validation
supabase/
├── migrations/    Versioned SQL (001–004)
└── seed/          Demo account data
docs/
├── decisions/     Architecture Decision Records
└── blog-notes/    Case study material
__tests__/         Jest unit + integration tests
```

---

## License

MIT — built at AI Hackathon 2026 by Abhiyan.

---

*Made with 🥚 by Abhiyan — [portfolio](https://abhiyansainju.com/) · [Instagram](https://www.instagram.com/abhiyan_sainju/)*
github:https://github.com/aabhiyann
LinkedIN:https://www.linkedin.com/in/abhiyansainju/
