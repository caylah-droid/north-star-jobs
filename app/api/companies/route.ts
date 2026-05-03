// app/api/companies/route.ts
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const user = searchParams.get('user') || 'caylah'

  const companies = await prisma.company.findMany({
    where: { targetUser: user },
    orderBy: [{ tier: 'asc' }, { createdAt: 'desc' }],
  })

  return Response.json(companies)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const company = await prisma.company.create({
      data: {
        name: body.name,
        website: body.website || null,
        industry: body.industry || null,
        track: body.track || null,
        tier: body.tier ? parseInt(body.tier) : 2,
        notes: body.notes || null,
        linkedinUrl: body.linkedinUrl || null,
        hiringPageUrl: body.hiringPageUrl || null,
        targetUser: body.targetUser || 'caylah',
      },
    })

    return Response.json({ success: true, company })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}