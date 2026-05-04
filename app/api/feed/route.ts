import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CAYLAH_KEYWORDS = [
  // Senior / RevOps track
  'revenue operations', 'revops', 'gtm operations', 'sales operations',
  'business operations', 'process operations', 'systems operations',
  'operations manager', 'operations lead', 'business systems',
  'workflow automation', 'crm operations', 'growth operations',
  'operational excellence', 'process improvement', 'operations specialist',
  'head of operations', 'director of operations', 'ops manager',
  'business analyst', 'process analyst', 'systems analyst',
  // Entry / execution track
  'chief of staff', 'founder associate', 'executive assistant',
  'executive operations', 'executive coordinator',
  'operations associate', 'operations coordinator',
  'strategy associate', 'program coordinator',
  'project coordinator', 'implementation manager',
  'team operations', 'startup operations',
  // Expanded
  'ai trainer', 'data trainer', 'sales enablement', 'enablement',
]

const KYLE_KEYWORDS = [
  // Core CSM / Account Management
  'customer success', 'client success', 'account manager',
  'account executive', 'customer experience', 'success manager',
  'client manager', 'account management', 'client partner',

  // LegalTech / Legal ops
  'legal operations', 'legaltech', 'legal tech', 'law firm',
  'legal coordinator', 'legal assistant', 'legal administrator',
  'paralegal operations', 'legal project manager',

  // Onboarding / Implementation
  'onboarding manager', 'onboarding specialist', 'client onboarding',
  'customer onboarding', 'client implementation', 'implementation specialist',
  'client trainer', 'training coordinator', 'product trainer',

  // Relationship / BD
  'relationship manager', 'client relations', 'customer relations',
  'client services', 'business development representative',
  'partnership manager', 'partnerships coordinator',
  'sales development', 'community manager',

  // Support / Ops (entry friendly)
  'customer support manager', 'support operations', 'customer operations',
  'helpdesk manager', 'service delivery', 'client coordinator',
  'operations coordinator', 'project coordinator',

  // Marketing ops (secondary)
  'marketing operations', 'agency operations', 'campaign coordinator',
  'marketing coordinator', 'crm manager', 'hubspot',
]

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()
  return keywords.some(keyword => text.includes(keyword.toLowerCase()))
}

const NON_ENGLISH = [
  'stellenangebot', 'wir suchen', 'deutschkenntnisse', 'deutsch', 'vollzeit', 'teilzeit',
  'befristet', 'unbefristet', 'gehalt', 'kenntnisse', 'erfahrung', 'anforderungen',
  'nous recherchons', 'nous sommes', 'vous êtes', 'français', 'francais', 'cdi', 'cdd',
  'expérience', 'competences', 'compétences', 'poste', 'rejoindre',
  'wij zoeken', 'nederlands', 'vacature',
  'estamos buscando', 'experiencia', 'requisitos', 'incorporar',
  'cerchiamo', 'italiano', 'esperienza',
]

function isEnglish(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return !NON_ENGLISH.some(word => text.includes(word))
}

async function fetchRemotive(user: string) {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', { cache: 'no-store' })
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
        isManual: false,
      }))
  } catch { return [] }
}

async function fetchWeworkremotely(user: string) {
  try {
    const category = user === 'caylah'
      ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
      : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'
    const res = await fetch(category, { cache: 'no-store' })
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
        company, role,
        platform: 'We Work Remotely',
        url: link,
        salary: null,
        postedAt: pubDate ? new Date(pubDate).toISOString() : null,
        source: 'weworkremotely',
        description: null,
        isManual: false,
      }
    }).filter(job => matchesUser(job.role, '', user))
  } catch { return [] }
}

async function fetchJobicy(user: string) {
  try {
    const tag = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?tag=${tag}&count=50`, { cache: 'no-store' })
    const data = await res.json()
    return (data.jobs || [])
      .filter((job: any) => matchesUser(job.jobTitle, job.jobDescription || '', user))
      .map((job: any) => ({
        id: `jobicy-${job.id}`,
        company: job.companyName,
        role: job.jobTitle,
        platform: 'Jobicy',
        url: job.url,
        salary: job.annualSalaryMin ? `$${job.annualSalaryMin.toLocaleString()} – $${job.annualSalaryMax?.toLocaleString()}/yr` : null,
        postedAt: job.pubDate,
        source: 'jobicy',
        description: job.jobDescription?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
        isManual: false,
      }))
  } catch { return [] }
}

async function fetchArbeitnow(user: string) {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { cache: 'no-store' })
    const data = await res.json()
    return (data.data || [])
      .filter((job: any) => matchesUser(job.title, job.description || '', user) && isEnglish(job.title, job.description || ''))
      .map((job: any) => ({
        id: `arbeitnow-${job.slug}`,
        company: job.company_name,
        role: job.title,
        platform: 'Arbeitnow',
        url: job.url,
        salary: null,
        postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
        source: 'arbeitnow',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
        isManual: false,
      }))
  } catch { return [] }
}

async function fetchHimalayas(user: string) {
  try {
    const keyword = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://himalayas.app/jobs/api?q=${keyword}&limit=50`, { cache: 'no-store' })
    const data = await res.json()
    return (data.jobs || [])
      .filter((job: any) => matchesUser(job.title, job.description || '', user))
      .map((job: any) => {
        const companySlug = job.company?.slug || ''
        const jobSlug = job.slug || ''
        const url = companySlug && jobSlug
          ? `https://himalayas.app/companies/${companySlug}/jobs/${jobSlug}`
          : jobSlug
          ? `https://himalayas.app/jobs/${jobSlug}`
          : job.url || 'https://himalayas.app/jobs'
        return {
          id: `himalayas-${jobSlug || job.id}`,
          company: job.company?.name || job.companyName || job.organization || 'Unknown',
          role: job.title,
          platform: 'Himalayas',
          url,
          salary: job.salary || null,
          postedAt: job.createdAt || null,
          source: 'himalayas',
          description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
          isManual: false,
        }
      })
  } catch { return [] }
}

async function fetchRemoteOK(user: string) {
  try {
    const tag = user === 'caylah' ? 'operations' : 'customer-success'
    const res = await fetch(`https://remoteok.com/api?tag=${tag}`, {
      headers: { 'User-Agent': 'NorthStarJobsApp/1.0' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    return (data || [])
      .filter((job: any) => job.position && matchesUser(job.position, job.description || '', user) && isEnglish(job.position, job.description || ''))
      .map((job: any) => ({
        id: `remoteok-${job.id}`,
        company: job.company || 'Unknown',
        role: job.position,
        platform: 'RemoteOK',
        url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        salary: job.salary_min ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}/yr` : null,
        postedAt: job.date ? new Date(job.date).toISOString() : null,
        source: 'remoteok',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
        isManual: false,
      }))
  } catch { return [] }
}

async function fetchWorkingNomads(user: string) {
  try {
    const category = user === 'caylah' ? 'business' : 'sales'
    const res = await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${category}`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    return (data || [])
      .filter((job: any) => matchesUser(job.title, job.description || '', user) && isEnglish(job.title, job.description || ''))
      .map((job: any) => ({
        id: `workingnomads-${job.id}`,
        company: job.company_name || 'Unknown',
        role: job.title,
        platform: 'Working Nomads',
        url: job.url,
        salary: null,
        postedAt: job.pub_date || null,
        source: 'workingnomads',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
        isManual: false,
      }))
  } catch { return [] }
}

async function fetch4DayWeek(user: string) {
  try {
    const res = await fetch('https://4dayweek.io/feed.xml', { cache: 'no-store' })
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || ''
      const company = title.split(' at ')?.[1] || ''
      const role = title.split(' at ')?.[0] || title
      return {
        id: `4dayweek-${link}`,
        company, role,
        platform: '4 Day Week',
        url: link,
        salary: null,
        postedAt: pubDate ? new Date(pubDate).toISOString() : null,
        source: '4dayweek',
        description: desc.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
        isManual: false,
      }
    }).filter(job => matchesUser(job.role, job.description || '', user) && isEnglish(job.role, job.description || ''))
  } catch { return [] }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const [remotive, wwr, jobicy, arbeitnow, himalayas, remoteok, workingnomads, fourday, dbManual] = await Promise.all([
    fetchRemotive(user),
    fetchWeworkremotely(user),
    fetchJobicy(user),
    fetchArbeitnow(user),
    fetchHimalayas(user),
    fetchRemoteOK(user),
    fetchWorkingNomads(user),
    fetch4DayWeek(user),
    prisma.job.findMany({
      where: { user, isManual: true, feedOnly: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  const manualJobs = dbManual.map((j: any) => ({
    id: `manual-${j.id}`,
    dbId: j.id,
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

  const combined = [...remotive, ...wwr, ...jobicy, ...arbeitnow, ...himalayas, ...remoteok, ...workingnomads, ...fourday]

  const seen = new Set()
  const unique = combined.filter(job => {
    if (!isEnglish(job.role, job.description || '')) return false
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

  return NextResponse.json([...manualJobs, ...unique.slice(0, 100)])
}