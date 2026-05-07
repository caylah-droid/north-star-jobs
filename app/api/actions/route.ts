import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const actions = await prisma.action.findMany({
    where: {
      user,
      createdAt: { gte: todayStart },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(actions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { user, type, jobId, notes } = body

  const action = await prisma.action.create({
    data: {
      user: user || 'caylah',
      type,
      jobId: jobId || null,
      notes: notes || null,
      doneAt: new Date(),
      completed: true,
    },
  })

  // If this is a follow-up action, stamp followedUpAt on the job
  if (type === 'followup' && jobId) {
    await prisma.job.update({
      where: { id: jobId },
      data: { followedUpAt: new Date() } as any,
    })
  }

  return NextResponse.json(action)
}
