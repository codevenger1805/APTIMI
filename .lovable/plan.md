# APTIMI — Build Plan

A clean, Linear/Stripe-style career execution platform for students, matching the uploaded screenshots (white + neutral gray + indigo, sidebar-driven dashboard).

## Phase 1 — Foundation
1. **Design system** (`src/styles.css`): white background, neutral gray scale, indigo `#4F46E5` primary. Typography: Inter. Tight radii (8px), subtle borders, no gradients. Override shadcn tokens.
2. **Landing page** (`/`): hero, "the problem", how-it-works (Goal → Assessment → Roadmap → Weekly → Focus → Applications → Dashboard flow diagram), features grid, testimonial placeholders, CTA → `/auth`.
3. **Enable Lovable Cloud** (Supabase) for auth + database.

## Phase 2 — Auth & Onboarding
4. **Auth page** (`/auth`): email/password signup + login, Google OAuth, forgot password. `/reset-password` page.
5. **Onboarding** (`/onboarding`, gated): collect name, college, academic year, target role (PM/Data Analyst), timeline. Saved to `profiles` + `career_goals`.
6. **Skill assessment** (`/onboarding/skills`): 1–5 sliders for role-specific skills, computes readiness sub-score, generates a roadmap from a template, redirects to dashboard.

## Phase 3 — App shell (under `_authenticated`)
7. **Sidebar layout**: Dashboard / Roadmap / Weekly Plan / Focus / Applications / Analytics / Settings + user chip at bottom with logout. Matches screenshots exactly.

## Phase 4 — Core pages
8. **Dashboard** — greeting, large readiness score card (with sub-scores: Skills/Roadmap/Focus/Applications/Consistency), next-best-action, KPI tiles (tasks, focus hours, applications, streak), "Up next" task list, quick-start row.
9. **Roadmap** — milestones rendered from `roadmaps` + `roadmap_milestones` with checkable tasks; progress per milestone.
10. **Weekly Planner** — week navigator, task list with complete/edit, % bar. Tasks auto-generated from roadmap milestones into `tasks` table by ISO week.
11. **Focus** — Pomodoro timer (15/25/45/60), optional task attachment, persists `focus_sessions`, recent sessions list, contributes to streak.
12. **Applications** — kanban-style columns (Saved/Applied/Assessment/Interview/Offer/Rejected), add-application form, drag-or-dropdown status changes.
13. **Analytics** — KPI row, focus minutes last-7-days bar chart, weekly task completion line chart, application funnel, score breakdown with weights (Recharts).
14. **Settings** — profile edit (name, college), re-runnable skill self-assessment (recomputes readiness).

## Phase 5 — Backend
15. **Migrations** for: `profiles`, `career_goals`, `skill_assessments`, `roadmaps`, `roadmap_milestones`, `tasks`, `focus_sessions`, `applications`, `career_scores`. RLS scoped to `auth.uid()`. GRANTs included. Profile auto-created on signup via trigger.
16. **Roadmap templates** for PM and Data Analyst hard-coded in `src/lib/roadmap-templates.ts` (no paid AI). Server function `generateRoadmap(role)` seeds milestones + tasks on first onboarding completion.
17. **Readiness score** computed server-side from sub-scores with weights (Skills 30 / Roadmap 30 / Focus 15 / Apps 15 / Consistency 10), stored in `career_scores`, refreshed on relevant mutations.

## Technical notes
- TanStack Start + TanStack Query default read pattern.
- All protected routes under `src/routes/_authenticated/` (integration-managed gate).
- Google OAuth via `lovable.auth.signInWithOAuth` + `configure_social_auth`.
- Charts: Recharts (already in shadcn).
- No light/dark toggle; light theme only per screenshots.

## Out of scope (per PRD)
Notes, whiteboard, social/chat, rewards, music, community.

## Deliverable
A working, navigable app where a new user can sign up → onboard → get a roadmap → execute weekly tasks → run focus sessions → track applications → see analytics. Production-ready scaffold; further roles beyond PM/Data Analyst can plug into the template registry.

Reply "go" (or with edits) and I'll start building Phase 1.
