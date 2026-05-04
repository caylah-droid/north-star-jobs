import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  // Follow-up action — logs entry to notes, advances followUpDue by 7 days
  if (body.action === 'followup') {
    const job = await prisma.job.findUnique({ where: { id: params.id } })
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    const note = body.note?.trim()
      ? `[Follow-up ${timestamp}] ${body.note.trim()}`
      : `[Follow-up ${timestamp}]`

    const existingNotes = job.notes ? job.notes + '\n' + note : note
    const nextFollowUp = new Date()
    nextFollowUp.setDate(nextFollowUp.getDate() + 7)

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        notes: existingNotes,
        lastActionAt: new Date(),
        followUpDue: nextFollowUp,
      },
    })

    return NextResponse.json(updated)
  }

  // Standard stage / feedOnly update
  const updated = await prisma.job.update({
    where: { id: params.id },
    data: {
      ...(body.stage !== undefined && { stage: body.stage }),
      ...(body.feedOnly !== undefined && { feedOnly: body.feedOnly }),
      ...(body.stage === 'applied' && {
        appliedAt: new Date(),
        followUpDue: (() => {
          // Set initial follow-up due date based on user (5 days Caylah, 4 days Kyle)
          const d = new Date()
          d.setDate(d.getDate() + (body.userDays ?? 5))
          return d
        })(),
      }),
      lastActionAt: new Date(),
    },
  })

  return NextResponse.json(updated)
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