# SnapMacros-Chip: Development & Interview Reference Guide
This document serves as a comprehensive record of the technical architecture, recently implemented features, and software engineering decisions made throughout the development of SnapMacros-Chip. It is designed to be used as a reference for technical interviews or project portfolio discussions.

---

## 1. Project Overview & Architecture
**SnapMacros-Chip** is an AI-powered, gamified macro-tracking Progressive Web App (PWA) designed to be a "Duolingo for diet tracking".

### Technology Stack
*   **Frontend Ecosystem:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
*   **Animation & UI:** Framer Motion, custom SVG components, Lucide React icons
*   **Backend & Database:** Supabase (PostgreSQL with Row Level Security), Next.js API Routes
*   **AI Integration:** Anthropic Claude Vision AI (for parsing food macros from photos)
*   **Testing & CI:** Jest, React Testing Library, Husky (Pre-commit hooks), GitHub Actions
*   **PWA features:** `next-pwa` (Service workers, manifest, install prompts)

### Core Architectural Decisions
*   **Client-Side AI Mascot (Chip):** We built a resilient state machine to control the "Chip" mascot (`Chip.tsx`). Chip reacts dynamically to the user's progress and UI interactions (e.g., getting `"sad"` when an auth error occurs, `"hype"` during successful logins, or `"on_fire"` when hitting macro goals).
*   **Separation of Concerns:** Abstracted heavy visual logic into isolated components (e.g., `MacroRings.tsx` for complex concentric SVG circles) to keep page architectures clean.
*   **Robust State Management:** Utilized complex React `useState` and Framer `AnimatePresence` to orchestrate multi-step seamless flows (like the custom Onboarding wizard) without harsh page reloads.

---

## 2. Recent Feature Implementations (The "What We Built" Story)

### 2.1 The App Launch & Authentication Flow
*   **Splash Screen (`app/page.tsx`):** Engineered a highly polished, timed animation sequence using `framer-motion`. Upon loading, we implemented a background Supabase `getSession()` check that seamlessly branches the user to `/login`, `/dashboard`, or `/onboarding` based on their auth status and database flags.
*   **Login & Signup Architectures (`app/(auth)/*`):**
    *   Built pixel-perfect, responsive form components maintaining a strict global design spec (e.g., standardized 52px input heights, orange focus rings).
    *   **UX Enhancements:** Implemented an `Eye/EyeOff` password visibility toggle and horizontal "shake" error animations.
    *   **Error Handling Mapping:** We mapped generic, technical Supabase error codes into human-readable, brand-appropriate UI messages ("Those passwords don't match. Try again.") mapped directly to Chip's facial expressions.

### 2.2 The Core PWA Experience
*   **Onboarding Engine:** Built a multi-stage data collection wizard (Goal, About, Activity levels) that calculates user Total Daily Energy Expenditure (TDEE) sequentially. Added confetti `canvas-confetti` celebrations on completion.
*   **Camera Integration:** Handled direct DOM interaction via `react-webcam` to snap photos of meals, subsequently piping the Base64 images to our Next.js API for Vision Agent processing.
*   **PWA Polish:** Injected `next-pwa` generation for caching and offline strategies, enabling the app to be installed natively on iOS/Android home screens.

---

## 3. Testing, QA, and CI/CD Workflow (Crucial for Interviews)

### 3.1 Automated Testing Strategy (Jest + React Testing Library)
To prove engineering maturity, we implemented rigorous integration tests focusing on *user behavior* rather than internal implementation details:
*   **Routing Logic Tests:** We tested the `AppLaunchPage` by mocking the Supabase client. We verified that unauthenticated users are pushed to `/login`, while authenticated users are correctly partitioned depending on their `onboarding_completed` flag in the DB.
*   **Form Interaction Tests:** For both `Login` and `Signup`, we simulated user typing (`fireEvent.change`) and form submissions.
*   **Error State Assertions:** Instead of just checking if a function fired, our tests assert that the exact human-readable text (e.g., "Password must be at least 6 characters.") is rendered in the DOM when validations fail.
*   **Mocking Complexity:** We successfully mocked `framer-motion` using a Proxy to prevent animation delays from blocking the test environment, showcasing deep understanding of testing context boundaries.

### 3.2 Git Hooks & Pipeline Enforcement
*   **Husky Pre-commit Configuration:** To prevent broken code from ever reaching the remote repository, we installed and configured `husky`.
*   **The Workflow:** Every time a developer types `git commit`, Husky intercepts the command and runs `npm run test -- --passWithNoTests`. If a single test fails, the commit is aborted. This guarantees the `main` branch remains pristine.
*   **Commit Conventions:** Adhered rigorously to Conventional Commits (e.g., `feat(auth): ...`, `test(auth): ...`) ensuring a highly readable and automated `CHANGELOG.md`.

---

## 4. Addressing Technical Debt & Deployments
*   **Vercel Debugging:** Navigated CI caching issues where Vercel served stale Next.js builds. We debugged this by isolating problematic residual artifacts (like Playwright reports) that corrupted the build pipeline.
*   **Client vs Server Component Boundaries:** Systematically resolved Next.js `use client` boundary errors during the Auth implementation to ensure hooks (`useRouter`, `useState`) didn't crash the server-side compiler.

---

### Interview Talking Points
1.  **"Tell me about a time you handled complex state or UX."**
    *   *Talk about the Chip mascot.* Explain how you tied standard form validation (success/error/loading) into an interactive SVG state machine using Framer Motion to make dull login flows feel alive.
2.  **"How do you approach automated testing on the frontend?"**
    *   *Highlight the Jest setup.* Emphasize that you mock external dependencies (Supabase, Next router) to keep tests fast, and you focus on DOM rendering (RTL) to ensure the user actually *sees* what they are supposed to see. Mention the Husky pre-commit hook as your way of "automating discipline."
3.  **"Describe your experience with modern React architectures."**
    *   *Discuss Next.js App Router.* Explain how you separated API logic (`api/analyze/route.ts`) from client-side visual components (`page.tsx` marked with `"use client"`), securely managing the boundaries between backend execution and frontend rendering.
