import { NextResponse } from 'next/server'

/* ───────── KEYWORDS ───────── */

const CAYLAH_KEYWORDS = [
  'revenue operations','revops','gtm operations','sales operations',
  'business operations','process operations','systems operations',
  'operations manager','operations lead','business systems',
  'workflow automation','crm operations','growth operations',
  'operational excellence','process improvement','operations specialist',
  'head of operations','director of operations','ops manager',
  'business analyst','process analyst','systems analyst',
]

const KYLE_KEYWORDS = [
  'customer success','client success','account manager',
  'account executive','client relations','customer experience',
  'legal operations','legaltech','law firm',
  'client onboarding','customer onboarding',
  'client services','account management',
  'relationship manager','client partner',
]

/* ───────── SCORING ENGINE (🔥 FIX) ───────── */

function scoreJob(title: string, description: string, user: string): number {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  let score = 0

  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 2
  }

  // bonuses
  if (text.includes('remote')) score += 1
  if (text.includes('global')) score += 1

  // penalties (kills junk)
  if (text.includes('german') || text.includes('berlin')) score -= 3
  if (text.includes('on-site') || text.includes('hybrid')) score -= 2
  if (text.includes('intern') || text.includes('junior')) score -= 2

  return score
}

/* ───────── FETCHERS ───────── */

async function fetchRemotive(user: string) {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100')
    const data = await res.json()

    return data.jobs
      .filter((job: any) => scoreJob(job.title, job.description || '', user) >= 3)
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
  } catch { return [] }
}

async function fetchWeworkremotely(user: string) {
  try {
    const res = await fetch('https://weworkremotely.com/remote-jobs.rss')
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      return {
        id: `wwr-${link}`,
        company: title.split(' at ')[1] || '',
        role: title.split(' at ')[0] || title,
        platform: 'WeWorkRemotely',
        url: link,
        postedAt: pubDate,
        description: '',
      }
    }).filter(job => scoreJob(job.role, '', user) >= 3)
  } catch { return [] }
}

async function fetchJobicy(user: string) {
  try {
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs`)
    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) => scoreJob(job.jobTitle, job.jobDescription || '', user) >= 3)
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
        description: job.jobDescription?.slice(0, 300),
      }))
  } catch { return [] }
}

async function fetchArbeitnow(user: string) {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api')
    const data = await res.json()

    return (data.data || [])
      .filter((job: any) => scoreJob(job.title, job.description || '', user) >= 3)
      .map((job: any) => ({
        id: `arbeitnow-${job.slug}`,
        company: job.company_name,
        role: job.title,
        platform: 'Arbeitnow',
        url: job.url,
        postedAt: job.created_at,
        description: job.description?.slice(0, 300),
      }))
  } catch { return [] }
}

async function fetchHimalayas(user: string) {
  try {
    const res = await fetch('https://himalayas.app/jobs/api?limit=50')
    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) => scoreJob(job.title, job.description || '', user) >= 3)
      .map((job: any) => ({
        id: `himalayas-${job.slug}`,
        company: job.company?.name || 'Unknown',
        role: job.title,
        platform: 'Himalayas',
        url: `https://himalayas.app/jobs/${job.slug}`,
        postedAt: job.createdAt,
        description: job.description?.slice(0, 300),
      }))
  } catch { return [] }
}

/* ───────── NEW SOURCES ───────── */

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
  } catch { return [] }
}

async function fetchDailyRemote(user: string) {
  try {
    const res = await fetch('https://dailyremote.com/api/jobs')
    const data = await res.json()

    return (data.jobs || [])
      .filter((job: any) => scoreJob(job.title, job.description || '', user) >= 3)
      .map((job: any) => ({
        id: `dailyremote-${job.id}`,
        company: job.company_name,
        role: job.title,
        platform: 'DailyRemote',
        url: job.url,
        postedAt: job.date_posted,
        description: job.description?.slice(0, 300),
      }))
  } catch { return [] }
}

async function fetchRemoteCo() {
  try {
    const res = await fetch('https://remote.co/rss')
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''

      return {
        id: `remoteco-${link}`,
        company: 'Unknown',
        role: title,
        platform: 'Remote.co',
        url: link,
        postedAt: null,
        description: '',
      }
    })
  } catch { return [] }
}

/* ───────── MAIN ───────── */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [
    remotive,
    wwr,
    jobicy,
    arbeitnow,
    himalayas,
    revops,
    dailyremote,
    remoteco
  ] = await Promise.all([
    fetchRemotive(user),
    fetchWeworkremotely(user),
    fetchJobicy(user),
    fetchArbeitnow(user),
    fetchHimalayas(user),
    fetchRevOps(),
    fetchDailyRemote(user),
    fetchRemoteCo(),
  ])

  const combined = [
    ...remotive,
    ...wwr,
    ...jobicy,
    ...arbeitnow,
    ...himalayas,
    ...revops,
    ...dailyremote,
    ...remoteco,
  ]

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

  return NextResponse.json(unique.slice(0, 100))
}
