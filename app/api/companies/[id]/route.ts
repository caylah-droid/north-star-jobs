// app/api/companies/[id]/route.ts
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: body.name ?? undefined,
        website: body.website ?? undefined,
        industry: body.industry ?? undefined,
        track: body.track ?? undefined,
        tier: body.tier ?? undefined,
        notes: body.notes ?? undefined,
        linkedinUrl: body.linkedinUrl ?? undefined,
        hiringPageUrl: body.hiringPageUrl ?? undefined,
        lastChecked: body.lastChecked ? new Date(body.lastChecked) : undefined,
      },
    })

    return Response.json({ success: true, company })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.company.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}