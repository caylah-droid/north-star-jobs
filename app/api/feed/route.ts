import { NextResponse } from 'next/server'

/* =============================
   KEYWORDS (HIGH SIGNAL)
============================= */

const CAYLAH_KEYWORDS = [
  'revops',
  'revenue operations',
  'gtm operations',
  'sales operations',

  'hubspot',
  'salesforce',
  'crm',

  'automation',
  'workflow automation',
  'zapier',

  'pipeline',
  'go to market',

  'systems',
  'business systems',
  'growth operations',
]

const KYLE_KEYWORDS = [
  'customer success',
  'account manager',
  'client success',
  'customer experience',

  'onboarding',
  'client onboarding',
  'implementation',

  'relationship manager',
  'client partner',

  'legaltech',
  'legal operations',
]

/* =============================
   MATCHING LOGIC (IMPROVED)
============================= */

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  let score = 0
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) score++
  }

  return score >= 2
}

/* =============================
   HELPERS
============================= */

function cleanHTML(text: string) {
  return text?.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
}

/* =============================
   FETCHERS
============================= */

async function fetchRemotive(user: string) {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', {
      next: { revalidate: 3600 },
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
        description: cleanHTML(job.description),
      }))
  } catch {
    return []
  }
}

async function fetchWeworkremotely(user: string) {
  try {
    const category =
      user === 'caylah'
        ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
        : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'

    const res = await fetch(category, { next: { revalidate: 3600 } })
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items
      .map((item) => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

        const company = title.split(' at ')?.[1] || ''
        const role = title.split(' at ')?.[0] || title

        return {
          id: `wwr-${link}`,
          company,
          role,
          platform: 'We Work Remotely',
          url: link,
          salary: null,
          postedAt: pubDate ? new Date(pubDate).toISOString() : null,
          description: null,
        }
      })
      .filter((job) => matchesUser(job.role, '', user))
  } catch {
    return []
  }
}

async function fetchJobicy(user: string) {
  try {
    const tag = user === 'caylah' ? 'operations' : 'customer-success'

    const res = await fetch(
      `https://jobicy.com/api/v2/remote-jobs?tag=${tag}&count=50`,
      { next: { revalidate: 3600 } }
    )

    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) =>
        matchesUser(job.jobTitle, job.jobDescription || '', user)
      )
      .map((job: any) => ({
        id: `jobicy-${job.id}`,
        company: job.companyName,
        role: job.jobTitle,
        platform: 'Jobicy',
        url: job.url,
        salary: job.annualSalaryMin
          ? `$${job.annualSalaryMin.toLocaleString()} – $${job.annualSalaryMax?.toLocaleString()}/yr`
          : null,
        postedAt: job.pubDate,
        description: cleanHTML(job.jobDescription),
      }))
  } catch {
    return []
  }
}

async function fetchHimalayas(user: string) {
  try {
    const keyword = user === 'caylah' ? 'operations' : 'customer-success'

    const res = await fetch(
      `https://himalayas.app/jobs/api?q=${keyword}&limit=50`,
      { next: { revalidate: 3600 } }
    )

    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) =>
        matchesUser(job.title, job.description || '', user)
      )
      .map((job: any) => ({
        id: `himalayas-${job.slug}`,
        company: job.company?.name || 'Unknown',
        role: job.title,
        platform: 'Himalayas',
        url: `https://himalayas.app/jobs/${job.slug}`,
        salary: job.salary || null,
        postedAt: job.createdAt,
        description: cleanHTML(job.description),
      }))
  } catch {
    return []
  }
}

/* =============================
   NEW SOURCES
============================= */

async function fetchRevOpsCareers(user: string) {
  try {
    const res = await fetch(
      'https://revops.careers/jobs/feed/',
      { next: { revalidate: 3600 } }
    )

    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items
      .map((item) => {
        const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const desc = item.match(/<description>(.*?)<\/description>/)?.[1] || ''

        return {
          id: `revops-${link}`,
          company: 'Unknown',
          role: title,
          platform: 'RevOps Careers',
          url: link,
          salary: null,
          postedAt: null,
          description: cleanHTML(desc),
        }
      })
      .filter((job) => matchesUser(job.role, job.description || '', user))
  } catch {
    return []
  }
}

async function fetchNoDesk(user: string) {
  try {
    const res = await fetch(
      'https://nodesk.co/remote-jobs/feed/',
      { next: { revalidate: 3600 } }
    )

    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items
      .map((item) => {
        const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const desc = item.match(/<description>(.*?)<\/description>/)?.[1] || ''

        return {
          id: `nodesk-${link}`,
          company: 'Unknown',
          role: title,
          platform: 'NoDesk',
          url: link,
          salary: null,
          postedAt: null,
          description: cleanHTML(desc),
        }
      })
      .filter((job) => matchesUser(job.role, job.description || '', user))
  } catch {
    return []
  }
}

/* =============================
   MAIN HANDLER
============================= */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [remotive, wwr, jobicy, himalayas, revops, nodesk] =
    await Promise.all([
      fetchRemotive(user),
      fetchWeworkremotely(user),
      fetchJobicy(user),
      fetchHimalayas(user),
      fetchRevOpsCareers(user),
      fetchNoDesk(user),
    ])

  const combined = [
    ...remotive,
    ...wwr,
    ...jobicy,
    ...himalayas,
    ...revops,
    ...nodesk,
  ]

  // dedupe
  const seen = new Set()
  const unique = combined.filter((job) => {
    const key = `${job.company}-${job.role}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // sort newest first
  unique.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0
    return dateB - dateA
  })

  return NextResponse.json(unique.slice(0, 100))
}      }))
  } catch { return [] }
}

async function fetchArbeitnow(user: string) {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return (data.data || [])
      .filter((job: any) => matchesUser(job.title, job.description || '', user))
      .map((job: any) => ({
        id: `arbeitnow-${job.slug}`,
        company: job.company_name,
        role: job.title,
        platform: 'Arbeitnow',
        url: job.url,
        salary: null,
        postedAt: job.created_at
          ? new Date(job.created_at * 1000).toISOString()
          : null,
        source: 'arbeitnow',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
      }))
  } catch { return [] }
}

async function fetchHimalayas(user: string) {
  try {
    const keyword = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://himalayas.app/jobs/api?q=${keyword}&limit=50`, {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return (data.jobs || [])
      .filter((job: any) => matchesUser(job.title, job.description || '', user))
      .map((job: any) => ({
        id: `himalayas-${job.slug}`,
        company: job.company?.name || 'Unknown',
        role: job.title,
        platform: 'Himalayas',
        url: `https://himalayas.app/jobs/${job.slug}`,
        salary: job.salary || null,
        postedAt: job.createdAt,
        source: 'himalayas',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
      }))
  } catch { return [] }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [remotive, wwr, jobicy, arbeitnow, himalayas] = await Promise.all([
    fetchRemotive(user),
    fetchWeworkremotely(user),
    fetchJobicy(user),
    fetchArbeitnow(user),
    fetchHimalayas(user),
  ])

  const combined = [...remotive, ...wwr, ...jobicy, ...arbeitnow, ...himalayas]

  // Remove duplicates by company + role
  const seen = new Set()
  const unique = combined.filter(job => {
    const key = `${job.company}-${job.role}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort freshest first
  unique.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0
    return dateB - dateA
  })

  return NextResponse.json(unique.slice(0, 100))
}
