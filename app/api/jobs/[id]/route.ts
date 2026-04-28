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
      stage: body.stage,
      appliedAt: body.stage === 'applied' ? new Date() : undefined,
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
