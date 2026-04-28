import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const jobs = await prisma.job.findMany({
    where: { user },
    orderBy: { priorityScore: 'desc' },
  })

  return NextResponse.json(jobs)
}

export async function POST(request: Request) {
  const body = await request.json()

  const job = await prisma.job.create({
    data: {
      company: body.company,
      role: body.role,
      platform: body.platform,
      url: body.url || null,
      salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null,
      salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null,
      user: body.user,
      track: body.track || null,
      stage: 'prospect',
      postedAt: body.postedAt ? new Date(body.postedAt) : null,
      isFresh: body.postedAt
        ? new Date(body.postedAt) > new Date(Date.now() - 48 * 60 * 60 * 1000)
        : false,
      isHighValue: body.salaryMin ? parseInt(body.salaryMin) >= 80000 : false,
      priorityScore: 0,
    },
  })

  return NextResponse.json(job)
}
