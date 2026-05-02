import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const job = await prisma.job.update({
    where: { id: params.id },
    data: {
      ...(body.stage !== undefined && { stage: body.stage }),
      ...(body.feedOnly !== undefined && { feedOnly: body.feedOnly }),
      ...(body.stage === 'applied' && { appliedAt: new Date() }),
      lastActionAt: new Date(),
    },
  })

  return NextResponse.json(job)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.job.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}