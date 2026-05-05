import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user = searchParams.get('user') || 'caylah'

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  try {
    // Today's completed daily actions (outreach, followup, research)
    const actions = await prisma.action.findMany({
      where: {
        user,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { id: true, type: true },
      orderBy: { createdAt: 'desc' },
    })

    // Today's actual applications from pipeline
    const appliedToday = await prisma.job.count({
      where: {
        user,
        stage: 'applied',
        appliedAt: { gte: startOfDay, lte: endOfDay },
      },
    })

    return NextResponse.json({ actions, appliedToday })
  } catch (err) {
    console.error('GET /api/actions error:', err)
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user, type, note } = body

    if (!user || !type) {
      return NextResponse.json({ error: 'user and type required' }, { status: 400 })
    }

    const action = await prisma.action.create({
      data: {
        user,
        type,
        note: note || null,
        completed: true,
      },
    })

    return NextResponse.json(action)
  } catch (err) {
    console.error('POST /api/actions error:', err)
    return NextResponse.json({ error: 'Failed to save action' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.action.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/actions error:', err)
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 })
  }
}