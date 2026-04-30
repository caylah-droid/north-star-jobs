import { NextResponse } from 'next/server'

/* =========================
   KEYWORDS (BALANCED)
   ========================= */

const CAYLAH_KEYWORDS = [
  // Core ops
  'operations', 'business operations', 'operations manager',
  'operations coordinator', 'operations specialist', 'ops',

  // Systems / execution
  'systems', 'business systems', 'process improvement',
  'process optimisation', 'workflow', 'automation', 'crm',

  // Strategy / growth
  'revops', 'revenue operations', 'gtm operations',
  'sales operations', 'growth operations',

  // Broader roles (to increase volume)
  'project manager', 'program manager',
  'business analyst', 'analytics', 'data',
  'chief of staff', 'executive assistant'
]

const KYLE_KEYWORDS = [
  'customer success', 'client success', 'account manager',
  'account executive', 'customer experience',
  'client relations', 'onboarding manager',
  'customer onboarding', 'client onboarding',
  'relationship manager', 'customer support',
  'client services', 'marketing operations'
]

/* =========================
   MATCH LOGIC (SMARTER)
   ========================= */

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  return keywords.some(k => text.includes(k))
}

/* =========================
   FETCH: REMOTIVE
   ========================= */

async function fetchRemotive(user: string) {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()

    return data.jobs
      .filter((job: any) => matchesUser(job.title, job.description || '', user))
      .map((job: any) => ({
        id: `remotive-${job.id}`,
        company: job.company_name,
        role: job.title,
        platform: 'Remotive',
        url: job.url,
        salary: job.salary || null,
        postedAt: job.publication_date,
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300)
      }))
  } catch {
    return []
  }
}

/* =========================
   FETCH: WWR (RSS)
   ========================= */

async function fetchWWR(user: string) {
  try {
    const url = user === 'caylah'
      ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
      : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'

    const res = await fetch(url, { next: { revalidate: 3600 } })
    const text = await res.text()

    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      const company = title.split(' at ')[1] || ''
      const role = title.split(' at ')[0] || title

      return {
        id: `wwr-${link}`,
        company,
        role,
        platform: 'WeWorkRemotely',
        url: link,
        salary: null,
        postedAt: pubDate ? new Date(pubDate).toISOString() : null,
        description: null
      }
    }).filter(job => matchesUser(job.role, '', user))
  } catch {
    return []
  }
}

/* =========================
   FETCH: JOBICY
   ========================= */

async function fetchJobicy(user: string) {
  try {
    const tag = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?tag=${tag}&count=50`, {
      next: { revalidate: 3600 }
    })
    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) => matchesUser(job.jobTitle, job.jobDescription || '', user))
      .map((job: any) => ({
        id: `jobicy-${job.id}`,
        company: job.companyName,
        role: job.jobTitle,
        platform: 'Jobicy',
        url: job.url,
        salary: job.annualSalaryMin
          ? `$${job.annualSalaryMin}–${job.annualSalaryMax}`
          : null,
        postedAt: job.pubDate,
        description: job.jobDescription?.replace(/<[^>]*>/g, '').slice(0, 300)
      }))
  } catch {
    return []
  }
}

/* =========================
   FETCH: HIMALAYAS (FIXED LINKS)
   ========================= */

async function fetchHimalayas(user: string) {
  try {
    const keywords = user === 'caylah'
      ? ['operations', 'analytics', 'systems']
      : ['customer-success']

    const all = await Promise.all(
      keywords.map(async (k) => {
        const res = await fetch(`https://himalayas.app/jobs/api?q=${k}&limit=40`, {
          next: { revalidate: 3600 }
        })
        const data = await res.json()

        return (data.jobs || []).map((job: any) => ({
          id: `himalayas-${job.id}`,
          company: job.company?.name || 'Unknown',
          role: job.title,
          platform: 'Himalayas',
          url: `https://himalayas.app/companies/${job.company?.slug}/jobs/${job.slug}`, // FIXED
          salary: job.salary || null,
          postedAt: job.createdAt,
          description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300)
        }))
      })
    )

    return all.flat().filter(job => matchesUser(job.role, job.description || '', user))
  } catch {
    return []
  }
}

/* =========================
   MAIN ROUTE
   ========================= */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [remotive, wwr, jobicy, himalayas] = await Promise.all([
    fetchRemotive(user),
    fetchWWR(user),
    fetchJobicy(user),
    fetchHimalayas(user)
  ])

  const combined = [...remotive, ...wwr, ...jobicy, ...himalayas]

  /* =========================
     🔥 FRESHNESS FILTER (3 DAYS)
     ========================= */

  const THREE_DAYS = 1000 * 60 * 60 * 24 * 3

  const fresh = combined.filter(job => {
    if (!job.postedAt) return false
    const jobDate = new Date(job.postedAt).getTime()
    return Date.now() - jobDate <= THREE_DAYS
  })

  /* =========================
     REMOVE DUPLICATES
     ========================= */

  const seen = new Set()

  const unique = fresh.filter(job => {
    const key = `${job.company}-${job.role}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  /* =========================
     SORT NEWEST FIRST
     ========================= */

  unique.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0
    return dateB - dateA
  })

  return NextResponse.json(unique.slice(0, 100))
}
