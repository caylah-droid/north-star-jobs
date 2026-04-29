import { NextResponse } from 'next/server'

/* ───────── KEYWORDS ───────── */

const CAYLAH_KEYWORDS = [
  'revenue operations','revops','gtm operations','sales operations',
  'business operations','process operations','systems operations',
  'operations manager','operations lead','business systems',
  'workflow automation','crm operations','growth operations',
  'operational excellence','process improvement','operations specialist'
]

const KYLE_KEYWORDS = [
  'customer success','client success','account manager',
  'account executive','client relations','customer experience',
  'legal operations','legaltech','law firm',
  'client onboarding','customer onboarding',
  'client services','account management'
]

/* ───────── SAFE SCORING (NOT TOO STRICT) ───────── */

function scoreJob(title: string, description: string, user: string): number {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  let score = 0

  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 1
  }

  // light penalties only
  if (text.includes('german')) score -= 2
  if (text.includes('on-site')) score -= 1

  return score
}

/* ───────── FETCHERS ───────── */

async function fetchRemotive(user: string) {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100')
    const data = await res.json()

    return data.jobs
      .filter((job: any) => scoreJob(job.title, job.description || '', user) >= 1)
      .map((job: any) => ({
        id: `remotive-${job.id}`,
        company: job.company_name,
        role: job.title,
        platform: 'Remotive',
        url: job.url,
        salary: job.salary || null,
        postedAt: job.publication_date,
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300),
      }))
  } catch {
    return []
  }
}

async function fetchWeworkremotely(user: string) {
  try {
    const category = user === 'caylah'
      ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
      : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'

    const res = await fetch(category)
    const text = await res.text()

    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items
      .map(item => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

        return {
          id: `wwr-${link}`,
          company: title.split(' at ')[1] || '',
          role: title.split(' at ')[0] || title,
          platform: 'We Work Remotely',
          url: link,
          postedAt: pubDate ? new Date(pubDate).toISOString() : null,
          description: '',
        }
      })
      .filter(job => scoreJob(job.role, '', user) >= 1)
  } catch {
    return []
  }
}

/* ───────── NEW SAFE ADDITIONS ───────── */

async function fetchRevOps() {
  try {
    const res = await fetch('https://revopscareers.com/rss')
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      return {
        id: `revops-${link}`,
        company: 'Unknown',
        role: title,
        platform: 'RevOps Careers',
        url: link,
        postedAt: pubDate,
        description: '',
      }
    })
  } catch {
    return []
  }
}

/* ───────── MAIN ───────── */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  // ✅ SAFE parallel fetching (no total failure)
  const results = await Promise.allSettled([
    fetchRemotive(user),
    fetchWeworkremotely(user),
    fetchRevOps(),
  ])

  const [remotive, wwr, revops] = results.map(r =>
    r.status === 'fulfilled' ? r.value : []
  )

  const combined = [...remotive, ...wwr, ...revops]

  /* ───────── DEDUP ───────── */

  const seen = new Set()
  const unique = combined.filter(job => {
    const key = `${job.company}-${job.role}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  /* ───────── SORT ───────── */

  unique.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0
    return dateB - dateA
  })

  return NextResponse.json(unique.slice(0, 50))
}
