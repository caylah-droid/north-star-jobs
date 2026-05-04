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
- components/Feed.tsx — Live feed + URL paste + manual cards + source filter + browse links
- components/JobBoard.tsx — Pipeline (collapsible Top 5 + responsive Kanban)
- components/AddJobModal.tsx — Manual job entry form
- components/PitchModal.tsx — Cover letter + LinkedIn outreach
- components/DailyActions.tsx — Today's contract (scoreboard-first layout)
- components/CompanyTargets.tsx — Target companies (non-functional)
- components/Metrics.tsx — Pipeline metrics (scoreboard-first, live data)
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
- ✅ Phase 10: Language filter — English only
- ✅ Phase 11: Reject vs Delete — 👎 Reject / 🗑️ Delete
- ✅ Phase 12: Pipeline UI — collapsible Top 5, responsive kanban
- ✅ Phase 13: Today page — contract-first layout, progress bar, quotes
- ✅ Phase 14: Live metrics — wired to real DB data
- ✅ Phase 15: Metrics redesign — scoreboard-first, strategy health, flags
- ✅ Phase 16: Feed browse links — tiered (not in feed vs already in feed)
- ✅ Phase 17: Expanded keywords — executive ops track, enablement, Kyle expanded

## Tab Order (app/page.tsx)
📊 Metrics → ⚡ Today → 🔭 Feed → 🎯 Pipeline → 🏢 Companies

## Feed Sources (in API)
Remotive, We Work Remotely, Jobicy, Arbeitnow, Himalayas, RemoteOK, Working Nomads, 4 Day Week

## Feed Browse Links (manual, tiered)
⭐ High priority (not in feed): Wellfound, Crossover, Somewhere, NoDesk, Scale.jobs, Deel Jobs
Already in feed (dimmed): WWR, Himalayas, RemoteOK, Remotive, Jobicy, Working Nomads, 4 Day Week

## Keyword Strategy
**Caylah:** Senior RevOps track + Entry/execution track (chief of staff, founder associate, ops coordinator etc) + Expanded (ai trainer, sales enablement)
**Kyle:** CSM/LegalTech core + onboarding specialist, client trainer

## Feed Logic
- Keywords match title + description
- Freshness filter: jobs older than 3 days excluded
- Language filter: non-English keywords excluded
- Deduplication: company-role key
- Sort: newest first
- Manual jobs: isManual=true, feedOnly=true → appear at top of feed
- "+ Pipeline" flips feedOnly=false → moves to pipeline tab
- Limit: 100 live + all manual feedOnly jobs

## Pitch Generator
- Model: gemini-3-flash-preview
- Input: role, company, description, platform, user profile
- Output: cover letter + LinkedIn outreach
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
- 🔲 Pitch on pipeline jobs — ✨ Pitch button missing from JobBoard cards
- 🔲 Company tab — Research and Outreach buttons functional
- 🔲 Next.js security upgrade
- 🔲 Himalayas URL — verify slug fix in production

## UI Rules
- Dark mode always (#0a0a0f background)
- No Tailwind utilities in components — CSS classes from globals.css only
- Inline styles for dynamic/conditional values
- Caylah = blue (#2563eb), Kyle = purple (#7c3aed)
- Manual cards = purple border
- kanban-desktop / kanban-mobile classes control responsive kanban (breakpoint: 700px)
- All pages: scoreboard/contract block first, details below

## UI Design Principles
- Contract-first: show the score before the tasks
- Numbers punch — 26–32px not 48px+
- One rotating quote per page — identity-anchored
- Descriptions collapse on completion
- Flags only render when there's a problem

## Coding Rules
1. One file at a time
2. Confirm NEXT between steps
3. Complete file replacements only
4. Check Network tab before assuming API issues
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
| 2026-05-03 | Today + Metrics redesign — scoreboard-first | Complete |
| 2026-05-04 | Browse links, keyword expansion, filter fix, Himalayas URL fix | Complete |