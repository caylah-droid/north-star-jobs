import { NextResponse } from 'next/server'

const CAYLAH_KEYWORDS = [
  'revenue operations', 'revops', 'gtm operations', 'sales operations',
  'business operations', 'process operations', 'systems operations',
  'operations manager', 'operations lead', 'business systems',
  'workflow automation', 'crm operations', 'growth operations',
  'operational excellence', 'process improvement', 'operations specialist',
  'head of operations', 'director of operations', 'ops manager',
  'business analyst', 'process analyst', 'systems analyst',
]

const KYLE_KEYWORDS = [
  'customer success', 'client success', 'account manager',
  'account executive', 'client relations', 'customer experience',
  'legal operations', 'legaltech', 'legal tech', 'law firm',
  'client implementation', 'onboarding manager', 'partnership manager',
  'marketing operations', 'agency operations', 'client onboarding',
  'customer onboarding', 'client services', 'account management',
  'customer support manager', 'client manager', 'success manager',
  'relationship manager', 'client partner', 'customer relations',
]

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()
  return keywords.some(keyword => text.includes(keyword.toLowerCase()))
}

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
        source: 'remotive',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
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
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.map(item => {
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
        source: 'weworkremotely',
        description: null,
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
        salary: job.annualSalaryMin
          ? `$${job.annualSalaryMin.toLocaleString()} – $${job.annualSalaryMax?.toLocaleString()}/yr`
          : null,
        postedAt: job.pubDate,
        source: 'jobicy',
        description: job.jobDescription?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
      }))
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
