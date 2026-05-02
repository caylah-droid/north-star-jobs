# NORTH STAR — PROJECT CONTEXT
*Updated after each build session*

## Live URL
north-star-rosy.vercel.app

## Stack
Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, Neon Postgres, Vercel

## Environment Variables
- DATABASE_URL — Neon northstar database
- GEMINI_API_KEY — Gemini API (model: gemini-3-flash-preview)

## File Structure
- app/page.tsx — Main page, tab navigation
- app/api/jobs/route.ts — GET and POST jobs
- app/api/jobs/[id]/route.ts — PATCH and DELETE job
- app/api/feed/route.ts — Live job feed (5 sources)
- app/api/pitch/route.ts — Gemini pitch generator
- app/api/extract/route.ts — URL extraction
- components/Header.tsx — User toggle
- components/Feed.tsx — Live feed + URL paste
- components/JobBoard.tsx — Pipeline + Top 5
- components/AddJobModal.tsx — Manual job entry
- components/PitchModal.tsx — Cover letter generator
- components/DailyActions.tsx — Today's actions
- components/CompanyTargets.tsx — Target companies
- components/Metrics.tsx — Pipeline metrics
- components/globals.css — All CSS classes
- lib/prisma.ts — Prisma client
- prisma/schema.prisma — Database schema

## Database Tables
Job, Outreach, Action, Company
Extra column added: isManual BOOLEAN DEFAULT false

## Phases Complete
- Phase 0: Scaffold, GitHub, Vercel
- Phase 1: Neon DB, Prisma schema, 4 tables
- Phase 2: Full dashboard UI
- Phase 3: Database connected, Add Job modal
- Phase 4: Priority scoring engine
- Phase 5: Stage updates (Apply/Interview/Offer/Reject)
- Phase 6: Live feed (Remotive, WWR, Jobicy, Arbeitnow, Himalayas)
- Phase 7: Pitch generator (Gemini API)

## Still To Build
- Feed URL paste → creates feed card → pitch → pipeline
- Language filter (English only)
- Additional sources (DailyRemote, Remote.co, 4dayweek.io)
- Himalayas URL fix (/jobs/undefined)
- Company tab functional
- Live metrics wired to real data
- Broken buttons fixed
- Manual job cards purple border
- Pitch on pipeline jobs
- Top 5 compact/collapsible
- Feed source filter buttons
- Next.js security upgrade

## Scoring Engine
- Offer: +80, Interview: +50, Applied: +20
- Fresh <24h: +40, <48h: +30, <72h: +15
- High value (Caylah ≥$5,400/mo, Kyle ≥$2,700/mo): +30
- Company Website: +20, WWR: +15, LinkedIn: +10, Indeed: +8

## Users
- Caylah: RevOps/GTM Ops, B2B SaaS, $5,400/mo target, blue #2563eb
- Kyle: LegalTech CSM/Marketing Ops, $2,700/mo target, purple #7c3aed

## Coding Rules
1. One file at a time
2. Confirm NEXT between steps
3. Complete file replacements only
4. Check Network tab before assuming API issues
5. Prisma changes = SQL in Neon directly
6. No localStorage or sessionStorage
7. CSS classes in globals.css, inline styles for dynamic

## Session Log
| Date | Feature | Status |
|------|---------|--------|
| 2026-04-28 | Full build phases 0-7 | Complete |
| 2026-04-29 | Pitch generator debug | In progress |
