import { NextResponse } from 'next/server'

/* =============================
   KEYWORDS
============================= */

const CAYLAH_KEYWORDS = [
  'operations',
  'operations manager',
  'business operations',

  'systems',
  'business systems',
  'crm',

  'automation',
  'workflow',
  'process improvement',

  'project manager',
  'program manager',
  'implementation',

  'executive assistant',
  'operations coordinator',

  'revops',
  'revenue operations',
  'gtm operations',

  'analytics', // important addition
]

const KYLE_KEYWORDS = [
  'customer success',
  'account manager',
  'client success',
  'customer experience',
  'onboarding',
  'implementation',
  'relationship manager',
  'client partner',
  'legaltech',
  'legal operations',
]

/* =============================
   MATCHING
============================= */

function matchesUser(title: string, description: string, user: string): boolean {
  const keywords = user === 'caylah' ? CAYLAH_KEYWORDS : KYLE_KEYWORDS
  const text = `${title} ${description}`.toLowerCase()

  let score = 0
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) score++
  }

  return score >= 1
}

/* =============================
   FETCHERS
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
  } catch {
    return []
  }
}

async function fetchWeworkremotely(user: string) {
  try {
    const category = user === 'caylah'
      ? 'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss'
      : 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss'

    const res = await fetch(category, { next: { revalidate: 3600 } })
    const text = await res.text()

    const items = text.split('<item>').slice(1)

    return items
      .map(item => {
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
      })
      .filter(job => matchesUser(job.role, '', user))
  } catch {
    return []
  }
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
  } catch {
    return []
  }
}

/* =============================
   FIXED HIMALAYAS (MULTI-QUERY)
============================= */

async function fetchHimalayas(user: string) {
  try {
    const keywords = user === 'caylah'
      ? ['operations', 'analytics', 'systems', 'business']
      : ['customer-success']

    const results = await Promise.all(
      keywords.map((k) =>
        fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(k)}&limit=50`, {
          next: { revalidate: 3600 }
        })
          .then((res) => res.json())
          .catch(() => ({ jobs: [] }))
      )
    )

    const allJobs = results.flatMap((r) => r.jobs || [])

    const seen = new Set()

    return allJobs
      .filter((job: any) => {
        const key = `${job.company?.name}-${job.title}`.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .filter((job: any) =>
        matchesUser(job.title, job.description || '', user)
      )
      .map((job: any) => ({
        id: `himalayas-${job.id || job.slug}`,
        company: job.company?.name || 'Unknown',
        role: job.title,
        platform: 'Himalayas',
        url: job.url
          ? job.url
          : `https://himalayas.app/jobs?q=${encodeURIComponent(job.title)}`,
        salary: job.salary || null,
        postedAt: job.createdAt || null,
      }))
  } catch {
    return []
  }
}

/* =============================
   RSS FEEDS
============================= */

async function fetchRevOpsCareers(user: string) {
  try {
    const res = await fetch('https://revops.careers/jobs/feed/', {
      next: { revalidate: 3600 }
    })

    const text = await res.text()
    const items = text.split('<item>').slice(1)

    return items
      .map(item => {
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
      })
      .filter(job => matchesUser(job.role, '', user))
  } catch {
    return []
  }
}

async function fetchNoDesk(user: string) {
  try {
    const res = await fetch('https://nodesk.co/remote-jobs/feed/', {
      next: { revalidate: 3600 }
    })

    const text = await res.text()
    const items = text.split('<item>').slice(1)

    return items
      .map(item => {
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
      })
      .filter(job => matchesUser(job.role, '', user))
  } catch {
    return []
  }
}

/* =============================
   MAIN API
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
