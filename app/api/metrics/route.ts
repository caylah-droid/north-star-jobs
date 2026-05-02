import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)

  // All jobs for this user
  const allJobs = await prisma.job.findMany({ where: { user } })

  // Applications this week
  const appliedThisWeek = allJobs.filter(j =>
    j.appliedAt && new Date(j.appliedAt) >= weekAgo
  ).length

  // Total applied ever (for rate calculations)
  const totalApplied = allJobs.filter(j => j.stage !== 'prospect').length

  // Interviews
  const totalInterviews = allJobs.filter(j =>
    j.stage === 'interview' || j.stage === 'offer'
  ).length

  // Offers
  const totalOffers = allJobs.filter(j => j.stage === 'offer').length

  // Rejected
  const totalRejected = allJobs.filter(j => j.stage === 'rejected').length

  // Response = any movement past applied (interview + offer + rejected)
  const totalResponses = totalInterviews + totalOffers + totalRejected
  const responseRate = totalApplied > 0
    ? Math.round((totalResponses / totalApplied) * 100)
    : 0

  // Interview rate = interviews out of applied
  const interviewRate = totalApplied > 0
    ? Math.round((totalInterviews / totalApplied) * 100)
    : 0

  // Stale jobs that need follow-up
  const followUpThreshold = user === 'caylah' ? fiveDaysAgo : fourDaysAgo
  const staleJobs = allJobs.filter(j =>
    j.stage === 'applied' &&
    j.appliedAt &&
    new Date(j.appliedAt) <= followUpThreshold
  ).length

  // Days active (since first application)
  const firstApplication = allJobs
    .filter(j => j.appliedAt)
    .sort((a, b) => new Date(a.appliedAt!).getTime() - new Date(b.appliedAt!).getTime())[0]

  const daysActive = firstApplication
    ? Math.floor((now.getTime() - new Date(firstApplication.appliedAt!).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Pipeline breakdown
  const pipeline = {
    prospect: allJobs.filter(j => j.stage === 'prospect').length,
    applied: allJobs.filter(j => j.stage === 'applied').length,
    interview: totalInterviews,
    offer: totalOffers,
    rejected: totalRejected,
  }

  // Strategy flags
  const flags: string[] = []
  if (totalApplied >= 10 && responseRate < 15) {
    flags.push('Response rate below 15% — strategy needs review. Try more direct outreach before applying.')
  }
  if (staleJobs > 0) {
    flags.push(`${staleJobs} application${staleJobs > 1 ? 's' : ''} need follow-up (${user === 'caylah' ? '5' : '4'}+ days old).`)
  }
  if (pipeline.prospect > 10) {
    flags.push(`${pipeline.prospect} prospects sitting idle — prioritise moving top ones to applied.`)
  }

  return NextResponse.json({
    appliedThisWeek,
    totalApplied,
    responseRate,
    interviewRate,
    totalOffers,
    staleJobs,
    daysActive,
    pipeline,
    flags,
  })
}
