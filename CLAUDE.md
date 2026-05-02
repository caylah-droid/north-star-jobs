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
- app/globals.css — All CSS classes (no Tailwind utilities in components)
- app/api/jobs/route.ts — GET and POST jobs
- app/api/jobs/[id]/route.ts — PATCH and DELETE job
- app/api/feed/route.ts — Live job feed (5 sources, keyword matching, freshness filter, dedup, sort)
- app/api/pitch/route.ts — Gemini pitch generator (cover letter + LinkedIn outreach)
- app/api/extract/route.ts — URL extraction (OG tags, platform detection, meta description)
- components/Header.tsx — User toggle (Caylah / Kyle)
- components/Feed.tsx — Live feed display + add to pipeline + pitch modal trigger
- components/JobBoard.tsx — Pipeline (Top 5 priority + Kanban stages)
- components/AddJobModal.tsx — Manual job entry form
- components/PitchModal.tsx — Cover letter + LinkedIn outreach display
- components/DailyActions.tsx — Today's prioritised actions per user
- components/CompanyTargets.tsx — Target companies (Research/Outreach — currently non-functional)
- components/Metrics.tsx — Pipeline metrics (currently static placeholders)
- lib/prisma.ts — Prisma client singleton
- prisma/schema.prisma — Database schema

## Database Tables
Job, Outreach, Action, Company
Extra column added: isManual BOOLEAN DEFAULT false

## Phases Complete
- ✅ Phase 0: Scaffold, GitHub, Vercel deployment
- ✅ Phase 1: Neon DB, Prisma schema, 4 tables
- ✅ Phase 2: Full dashboard UI — Header, tabs, DailyActions, JobBoard, CompanyTargets, Metrics
- ✅ Phase 3: Database connected, Add Job modal, jobs save and display
- ✅ Phase 4: Priority scoring engine (stage + freshness + salary + platform)
- ✅ Phase 5: Stage updates — Apply/Interview/Offer/Reject buttons working
- ✅ Phase 6: Live feed — Remotive, We Work Remotely, Jobicy, Arbeitnow, Himalayas
- ✅ Phase 7: Pitch generator — Gemini API generating cover letter + LinkedIn outreach per job

## Feed Details (Phase 6)

### Sources
| Source | Method | Notes |
|--------|--------|-------|
| Remotive | REST API | 100 jobs, keyword filtered |
| We Work Remotely | RSS parse | Category-specific RSS per user |
| Jobicy | REST API | tag= param per user |
| Arbeitnow | REST API | Broad pull, keyword filtered |
| Himalayas | REST API | Multi-keyword, slug-based URL fix applied |

### Feed Logic
- Keywords: CAYLAH_KEYWORDS and KYLE_KEYWORDS arrays match against title + description
- Freshness filter: jobs older than 3 days are excluded
- Deduplication: `company-role` key (lowercase) removes cross-source duplicates
- Sort: newest first (postedAt descending)
- Limit: 100 jobs returned max
- Caching: `next: { revalidate: 3600 }` on all fetches (1hr)
- Himalayas URL: fixed to `/companies/{company.slug}/jobs/{job.slug}` (was `/jobs/undefined`)

### Keyword Arrays
**Caylah:** operations, business operations, ops, systems, process improvement, workflow, automation, crm, revops, revenue operations, gtm operations, sales operations, growth operations, implementation, project manager, program manager, business analyst, analytics, data, chief of staff, coordinator, partnership

**Kyle:** customer success, client success, account manager, account executive, customer experience, client relations, onboarding manager, customer onboarding, relationship manager, customer support, client services, marketing operations

### Feed UI
- Stats bar: total roles found, fresh (<48h) count, source list
- Each card: role, company, platform badge, freshness tag, salary if available, description excerpt
- Actions per card: "Add to Pipeline" (POST to /api/jobs) + "Generate Pitch" (opens PitchModal)
- Added state tracked in-memory (Set) — green border on added cards
- Refresh button reloads feed

## Pitch Generator Details (Phase 7)

### API Route: /api/pitch
- Model: gemini-3-flash-preview (free tier)
- Input: job object (role, company, description, platform, salary) + activeUser
- Output: { coverLetter, linkedinOutreach }
- Parsing: text split on `COVER LETTER:` and `LINKEDIN:` markers (no JSON dependency)
- Fallback: if model ignores format, full text used as coverLetter

### User Profiles Injected into Prompt
**Caylah:** RevOps/GTM Ops/Business Operations. Zoho One CRM implementation, platform migrations, multi-country ops, process design, systems thinking. Equity shareholder: FundaGlobal (SA), Advoc8se LLC (USA). FundaMedical .NET migration. Target: $5,400/mo USD.

**Kyle:** CSM/Account Management/LegalTech. Law firm relationship management, legal client culture, team leadership, business development. Target: $2,700/mo USD.

### URL Extraction Route: /api/extract (POST)
- Input: { url }
- Fetches HTML with browser User-Agent
- Extracts: `<title>`, OG title, OG description, meta description, og:site_name
- Detects platform from URL pattern (LinkedIn, Indeed, Glassdoor, WWR, Remotive)
- Returns: { title, description, platform, detected }
- Used for Feed URL paste feature (still to be wired into UI)

## Metrics (Current State)
- Component exists: components/Metrics.tsx
- All values currently static/placeholder (0, 0%, "No data yet")
- Grid shows: Applications, Response Rate, Interview Rate, Outreach Replies
- Strategy Health panel: Response rate, Outreach conversion, Days since first application
- Tip box: flags if response rate drops below 15%
- **Still to do:** wire to real DB data via /api/jobs GET

## Still To Build
- 🔲 Feed URL paste — paste any URL → creates feed card → generate pitch → push to pipeline (extract route exists, UI not wired)
- 🔲 Language filter — English only, filter out German/French/other language listings
- 🔲 Additional feed sources — RevOps Careers, NoDesk, DailyRemote, Remote.co RSS, 4dayweek.io
- 🔲 Company tab — Research and Outreach buttons non-functional
- 🔲 Live metrics — wire Metrics.tsx to real DB data (applications count, response rate, interview rate)
- 🔲 Manual job cards — purple border to distinguish from feed jobs
- 🔲 Pitch generator on pipeline jobs — currently only on feed cards
- 🔲 Top 5 layout — compact/collapsible view (takes too much vertical space)
- 🔲 Feed source filter — filter by source (Remotive only, Jobicy only etc)
- 🔲 Next.js security update — upgrade from 14.2.3 to patched version

## Scoring Engine
- Offer: +80, Interview: +50, Applied: +20
- Fresh <24h: +40, <48h: +30, <72h: +15
- High value (Caylah ≥$5,400/mo, Kyle ≥$2,700/mo): +30
- Company Website: +20, WWR: +15, LinkedIn: +10, Indeed: +8

## Users
- Caylah: RevOps/GTM Ops, B2B SaaS, $5,400/mo target, blue #2563eb
- Kyle: LegalTech CSM/Marketing Ops, $2,700/mo target, purple #7c3aed

## UI Rules
- Dark mode always (#0a0a0f background)
- No Tailwind utilities in components — use CSS classes from globals.css
- Inline styles for dynamic/conditional values only
- Caylah = blue (#2563eb), Kyle = purple (#7c3aed)
- Manual job entries = purple border to distinguish from feed jobs

## Coding Rules
1. One file at a time
2. Confirm NEXT between steps
3. Complete file replacements only — no partial snippets
4. Check Network tab Response before assuming API issues
5. Prisma schema changes = SQL ALTER TABLE in Neon directly (no terminal)
6. Environment variable changes require manual redeploy in Vercel
7. Never use localStorage or sessionStorage
8. CSS classes in globals.css, inline styles for dynamic only
9. Test API routes at /api/[route] in browser before debugging frontend

## Session Log
| Date | Feature | Status |
|------|---------|--------|
| 2026-04-28 | Full build phases 0–7 | Complete |
| 2026-04-29 | Pitch generator debug | Complete |
| 2026-05-02 | CLAUDE.md feed + metrics update | Complete |
