# NORTH STAR — PROJECT CONTEXT
*Updated after each build session*

## Live URL
north-star-rosy.vercel.app

## GitHub
github.com/caylah-droid/north-star-jobs

## Stack
Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, Neon Postgres, Vercel

## Environment Variables
- DATABASE_URL — Neon northstar database
- GEMINI_API_KEY — Gemini API (model: gemini-3-flash-preview)

## File Structure
- app/page.tsx — Main page, tab navigation
- app/globals.css — All CSS classes (no Tailwind utilities in components)
- app/api/jobs/route.ts — GET and POST jobs
- app/api/jobs/[id]/route.ts — PATCH and DELETE job
- app/api/feed/route.ts — Live job feed (8 sources)
- app/api/pitch/route.ts — Gemini pitch generator
- app/api/extract/route.ts — URL extraction (OG tags, platform detection)
- app/api/metrics/route.ts — Live metrics (pipeline counts, rates, flags)
- components/Header.tsx — User toggle (Caylah / Kyle)
- components/Feed.tsx — Live feed + URL paste + manual cards + source filter
- components/JobBoard.tsx — Pipeline (collapsible Top 5 + responsive Kanban)
- components/AddJobModal.tsx — Manual job entry form
- components/PitchModal.tsx — Cover letter + LinkedIn outreach
- components/DailyActions.tsx — Today's contract (scoreboard-first layout)
- components/CompanyTargets.tsx — Target companies (non-functional)
- components/Metrics.tsx — Pipeline metrics (scoreboard-first layout, live data)
- lib/prisma.ts — Prisma client singleton
- prisma/schema.prisma — Database schema

## Database Schema (Job model)
id, createdAt, updatedAt, company, role, platform, url, salaryMin, salaryMax,
currency, location, remote, user, track, stage, priorityScore, isFresh,
isHighValue, isStrongMatch, isManual, feedOnly, description, postedAt,
appliedAt, lastActionAt, followUpDue, notes, positioningNote

## Phases Complete
- ✅ Phase 0: Scaffold, GitHub, Vercel deployment
- ✅ Phase 1: Neon DB, Prisma schema, 4 tables
- ✅ Phase 2: Full dashboard UI
- ✅ Phase 3: Database connected, Add Job modal
- ✅ Phase 4: Priority scoring engine
- ✅ Phase 5: Stage updates — Apply/Interview/Offer/Reject/Delete
- ✅ Phase 6: Live feed — 8 sources
- ✅ Phase 7: Pitch generator — Gemini API
- ✅ Phase 8: Manual feed cards — URL paste → feedOnly → pitch → pipeline
- ✅ Phase 9: Feed source filter — filter by source buttons
- ✅ Phase 10: Language filter — English only (non-English keyword detection)
- ✅ Phase 11: Reject vs Delete — 👎 Reject moves to rejected stage, 🗑️ permanently deletes
- ✅ Phase 12: Pipeline UI — collapsible Top 5, responsive kanban (list view on narrow screens)
- ✅ Phase 13: Today page redesign — contract-first layout, circle checkboxes, progress bar, identity-anchored quotes
- ✅ Phase 14: Metrics redesign — scoreboard-first, pipeline bar, strategy health rows, flags

## Tab Order (app/page.tsx)
📊 Metrics → ⚡ Today → 🔭 Feed → 🎯 Pipeline → 🏢 Companies

## Feed Sources
| Source | Method | User |
|--------|--------|------|
| Remotive | REST API | Both |
| We Work Remotely | RSS | Both |
| Jobicy | REST API | Both |
| Arbeitnow | REST API | Both |
| Himalayas | REST API | Both |
| RemoteOK | REST API | Both |
| Working Nomads | REST API | Both |
| 4 Day Week | RSS | Both |

## Feed Logic
- Keywords: CAYLAH_KEYWORDS and KYLE_KEYWORDS match title + description
- Freshness filter: jobs older than 3 days excluded
- Language filter: non-English keywords detected and excluded
- Deduplication: company-role key (lowercase)
- Sort: newest first
- Manual jobs: saved to DB with isManual=true, feedOnly=true — appear at top of feed
- feedOnly=false: job moves to pipeline (via PATCH on "+ Pipeline" click)
- Limit: 100 live jobs + all manual feedOnly jobs

## Pitch Generator
- Model: gemini-3-flash-preview
- Input: role, company, description, platform, user profile
- Output: cover letter + LinkedIn outreach message
- Available on: Feed cards and manual feed cards

## Scoring Engine
- Offer: +80, Interview: +50, Applied: +20
- Fresh <24h: +40, <48h: +30, <72h: +15
- High value (Caylah ≥$5,400/mo, Kyle ≥$2,700/mo): +30
- Company Website: +20, WWR: +15, LinkedIn: +10, Indeed: +8

## Users
- Caylah: RevOps/GTM Ops, B2B SaaS, $5,400/mo, blue #2563eb
- Kyle: LegalTech CSM/Marketing Ops, $2,700/mo, purple #7c3aed

## Still To Build
- 🔲 Pitch generator on pipeline jobs — ✨ Pitch button missing from JobBoard cards
- 🔲 Company tab — Research and Outreach buttons functional
- 🔲 Next.js security upgrade — 14.2.3 → patched version
- 🔲 Himalayas URL — verify slug fix working in production

## UI Rules
- Dark mode always (#0a0a0f background)
- No Tailwind utilities in components — CSS classes from globals.css only
- Inline styles for dynamic/conditional values
- Caylah = blue (#2563eb), Kyle = purple (#7c3aed)
- Manual cards = purple border
- kanban-desktop / kanban-mobile classes in globals.css control responsive kanban layout (breakpoint: 700px)
- All pages: scoreboard/contract block first, details below — everything readable in one screen

## UI Design Principles
- Contract-first layout: show the score before the tasks
- Numbers should punch, not consume — 26–32px not 48px+
- One rotating quote per page — identity-anchored, not cheerleader-positive
- Descriptions collapse on completion — page quiets as progress builds
- Flags only render when there's a problem — no noise when on track

## Coding Rules
1. One file at a time
2. Confirm NEXT between steps
3. Complete file replacements only
4. Check Network tab Response before assuming API issues
5. Prisma schema changes = SQL in Neon directly
6. Env var changes = manual redeploy in Vercel
7. Never use localStorage or sessionStorage
8. CSS classes in globals.css, inline styles for dynamic only

## Session Log
| Date | Feature | Status |
|------|---------|--------|
| 2026-04-28 | Full build phases 0–7 | Complete |
| 2026-04-29 | Pitch generator debug | Complete |
| 2026-05-02 | Feed URL paste, feedOnly flow, language filter | Complete |
| 2026-05-03 | Reject vs Delete, source filter, 3 new feed sources | Complete |
| 2026-05-03 | Pipeline UI — collapsible Top 5, responsive kanban | Complete |
| 2026-05-03 | Today + Metrics redesign — scoreboard-first layout | Complete |