import { NextResponse } from 'next/server'

/* =============================
   KEYWORDS (UNCHANGED CORE)
============================= */

const CAYLAH_KEYWORDS = [
  'revenue operations', 'revops', 'gtm operations', 'sales operations',
  'business operations', 'process operations', 'systems operations',
  'operations manager', 'operations lead', 'business systems',
  'workflow automation', 'crm operations', 'growth operations',
]

const KYLE_KEYWORDS = [
  'customer success', 'client success', 'account manager',
  'account executive', 'client relations', 'customer experience',
  'legal operations', 'legaltech', 'legal tech',
  'onboarding', 'implementation', 'relationship manager',
]

/* =============================
   MATCHING (SAFE UPGRADE)
============================= */

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  let score = 0
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) score++
  }

  return score >= 1 // SAFE (not too strict yet)
}

/* =============================
   EXISTING FETCHERS (UNCHANGED)
============================= */

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
      }))
  } catch { return [] }
}

async function fetchWeworkremotely(user: string) {
  try {
    const category = user === 'caylah'
      ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
      : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'

    const res = await fetch(category, { next: { revalidate: 3600 } })
    const text = await res.text()

    const items = text.split('<item>').slice(1)

    return items.map(item => {
      const title = item.split('<title><![CDATA[')[1]?.split(']]></title>')[0] || ''
      const link = item.split('<link>')[1]?.split('</link>')[0] || ''
      const pubDate = item.split('<pubDate>')[1]?.split('</pubDate>')[0] || ''

      const company = title.split(' at ')[1] || ''
      const role = title.split(' at ')[0] || title

      return {
        id: `wwr-${link}`,
        company,
        role,
        platform: 'We Work Remotely',
        url: link,
        salary: null,
        postedAt: pubDate,
      }
    }).filter(job => matchesUser(job.role, '', user))

  } catch { return [] }
}

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
        salary: null,
        postedAt: job.pubDate,
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
      }))
  } catch { return [] }
}

/* =============================
   NEW FEEDS (SAFE VERSION)
============================= */

async function fetchRevOpsCareers(user: string) {
  try {
    const res = await fetch('https://revops.careers/jobs/feed/', {
      next: { revalidate: 3600 }
    })

    const text = await res.text()
    const items = text.split('<item>').slice(1)

    return items.map(item => {
      const title = item.split('<title>')[1]?.split('</title>')[0] || ''
      const link = item.split('<link>')[1]?.split('</link>')[0] || ''

      return {
        id: `revops-${link}`,
        company: 'Unknown',
        role: title,
        platform: 'RevOps Careers',
        url: link,
        salary: null,
        postedAt: null,
      }
    }).filter(job => matchesUser(job.role, '', user))

  } catch { return [] }
}

async function fetchNoDesk(user: string) {
  try {
    const res = await fetch('https://nodesk.co/remote-jobs/feed/', {
      next: { revalidate: 3600 }
    })

    const text = await res.text()
    const items = text.split('<item>').slice(1)

    return items.map(item => {
      const title = item.split('<title>')[1]?.split('</title>')[0] || ''
      const link = item.split('<link>')[1]?.split('</link>')[0] || ''

      return {
        id: `nodesk-${link}`,
        company: 'Unknown',
        role: title,
        platform: 'NoDesk',
        url: link,
        salary: null,
        postedAt: null,
      }
    }).filter(job => matchesUser(job.role, '', user))

  } catch { return [] }
}

/* =============================
   MAIN
============================= */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [remotive, wwr, jobicy, himalayas, revops, nodesk] = await Promise.all([
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

  const seen = new Set()
  const unique = combined.filter(job => {
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

  return NextResponse.json(unique.slice(0, 100))
}
