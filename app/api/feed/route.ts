import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* =========================
   KEYWORDS
   ========================= */

const CAYLAH_KEYWORDS = [
  'operations', 'business operations', 'operations manager',
  'operations coordinator', 'operations specialist', 'ops',
  'systems', 'business systems', 'process improvement',
  'process optimisation', 'workflow', 'automation', 'crm', 'execution',
  'revops', 'revenue operations', 'gtm operations',
  'sales operations', 'growth operations', 'implementation',
  'project manager', 'program manager',
  'business analyst', 'analytics', 'data',
  'chief of staff', 'executive assistant', 'coordinator', 'partnership'
]

const KYLE_KEYWORDS = [
  'customer success', 'client success', 'account manager',
  'account executive', 'customer experience',
  'client relations', 'onboarding manager',
  'customer onboarding', 'client onboarding',
  'relationship manager', 'customer support',
  'client services', 'marketing operations'
]

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
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', { next: { revalidate: 3600 } })
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
        source: 'remotive',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300),
        isManual: false,
      }))
  } catch { return [] }
}

/* =========================
   FETCH: WWR
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
        company, role,
        platform: 'WeWorkRemotely',
        url: link,
        salary: null,
        postedAt: pubDate ? new Date(pubDate).toISOString() : null,
        source: 'wwr',
        description: null,
        isManual: false,
      }
    }).filter(job => matchesUser(job.role, '', user))
  } catch { return [] }
}

/* =========================
   FETCH: JOBICY
   ========================= */

async function fetchJobicy(user: string) {
  try {
    const tag = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?tag=${tag}&count=50`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return (data.jobs || [])
      .filter((job: any) => matchesUser(job.jobTitle, job.jobDescription || '', user))
      .map((job: any) => ({
        id: `jobicy-${job.id}`,
        company: job.companyName,
        role: job.jobTitle,
        platform: 'Jobicy',
        url: job.url,
        salary: job.annualSalaryMin ? `$${job.annualSalaryMin}–${job.annualSalaryMax}` : null,
        postedAt: job.pubDate,
        source: 'jobicy',
        description: job.jobDescription?.replace(/<[^>]*>/g, '').slice(0, 300),
        isManual: false,
      }))
  } catch { return [] }
}

/* =========================
   FETCH: HIMALAYAS
   ========================= */

async function fetchHimalayas(user: string) {
  try {
    const keywords = user === 'caylah' ? ['operations', 'analytics', 'systems'] : ['customer-success']
    const all = await Promise.all(
      keywords.map(async (k) => {
        const res = await fetch(`https://himalayas.app/jobs/api?q=${k}&limit=40`, { next: { revalidate: 3600 } })
        const data = await res.json()
        return (data.jobs || []).map((job: any) => ({
          id: `himalayas-${job.id}`,
          company: job.company?.name || 'Unknown',
          role: job.title,
          platform: 'Himalayas',
          url: `https://himalayas.app/companies/${job.company?.slug}/jobs/${job.slug}`,
          salary: job.salary || null,
          postedAt: job.createdAt,
          source: 'himalayas',
          description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300),
          isManual: false,
        }))
      })
    )
    return all.flat().filter(job => matchesUser(job.role, job.description || '', user))
  } catch { return [] }
}

/* =========================
   MAIN ROUTE
   ========================= */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  // Fetch live feed + manual jobs in parallel
  const [remotive, wwr, jobicy, himalayas, dbManual] = await Promise.all([
    fetchRemotive(user),
    fetchWWR(user),
    fetchJobicy(user),
    fetchHimalayas(user),
    prisma.job.findMany({
      where: { user, isManual: true } as any,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  const manualJobs = dbManual.map((j: any) => ({
    id: `manual-${j.id}`,
    company: j.company,
    role: j.role,
    platform: j.platform,
    url: j.url || '',
    salary: j.salaryMin ? `$${j.salaryMin.toLocaleString()}/mo` : null,
    postedAt: j.postedAt?.toISOString() || j.createdAt.toISOString(),
    source: 'manual',
    description: j.description || null,
    isManual: true,
  }))

  const combined = [...remotive, ...wwr, ...jobicy, ...himalayas]

  const THREE_DAYS = 1000 * 60 * 60 * 24 * 3
  const fresh = combined.filter(job => {
    if (!job.postedAt) return false
    return Date.now() - new Date(job.postedAt).getTime() <= THREE_DAYS
  })

  const seen = new Set()
  const unique = fresh.filter(job => {
    const key = `${job.company}-${job.role}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  unique.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0
    return dateB - dateA
  })

  // Manual jobs always at top, then live feed
  return NextResponse.json([...manualJobs, ...unique.slice(0, 100)])
}
