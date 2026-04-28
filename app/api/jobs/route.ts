import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ZAR_RATE = 18.5

function scoreJob(job: any, user: string): number {
  let score = 0

  // Freshness — highest weight
  if (job.postedAt) {
    const hoursOld = (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60)
    if (hoursOld <= 24) score += 40
    else if (hoursOld <= 48) score += 30
    else if (hoursOld <= 72) score += 15
  }

  // High value threshold per user (monthly USD)
  const threshold = user === 'caylah' ? 5400 : 2700
  if (job.salaryMin && job.salaryMin >= threshold) score += 30

  // Platform quality
  const platformScores: Record<string, number> = {
    'Company Website': 20,
    'We Work Remotely': 15,
    'LinkedIn': 10,
    'Indeed': 8,
    'Glassdoor': 6,
    'Other': 5,
  }
  score += platformScores[job.platform] || 5

  return score
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const jobs = await prisma.job.findMany({ where: { user } })

  const threshold = user === 'caylah' ? 5400 : 2700

  const scored = await Promise.all(
    jobs.map(async (job) => {
      const score = scoreJob(job, user)
      const isFresh = job.postedAt
        ? (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60) <= 48
        : false
      const isHighValue = job.salaryMin ? job.salaryMin >= threshold : false

      await prisma.job.update({
        where: { id: job.id },
        data: { priorityScore: score, isFresh, isHighValue },
      })

      return { ...job, priorityScore: score, isFresh, isHighValue }
    })
  )

  scored.sort((a, b) => b.priorityScore - a.priorityScore)
  return NextResponse.json(scored)
}

export async function POST(request: Request) {
  const body = await request.json()

  const postedAt = body.postedAt ? new Date(body.postedAt) : null
  const isFresh = postedAt
    ? (Date.now() - postedAt.getTime()) / (1000 * 60 * 60) <= 48
    : false

  const threshold = body.user === 'caylah' ? 5400 : 2700
  const isHighValue = body.salaryMin ? parseInt(body.salaryMin) >= threshold : false

  const platformScores: Record<string, number> = {
    'Company Website': 20,
    'We Work Remotely': 15,
    'LinkedIn': 10,
    'Indeed': 8,
    'Glassdoor': 6,
    'Other': 5,
  }

  let score = 0
  if (isFresh) score += 40
  if (isHighValue) score += 30
  score += platformScores[body.platform] || 5

  const job = await prisma.job.create({
    data: {
      company: body.company,
      role: body.role,
      platform: body.platform,
      url: body.url || null,
      salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null,
      salaryMax: body.salaryMin ? parseInt(body.salaryMin) : null,
      user: body.user,
      track: body.track || null,
      stage: 'prospect',
      postedAt,
      isFresh,
      isHighValue,
      priorityScore: score,
    },
  })

  return NextResponse.json(job)
}
