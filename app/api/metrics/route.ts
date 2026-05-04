import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user = searchParams.get('user') || 'caylah'

  const now = new Date()

  // Time windows
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
  startOfWeek.setHours(0, 0, 0, 0)

  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)

  const allJobs = await prisma.job.findMany({ where: { user } })

  // Momentum counts
  const appliedToday = allJobs.filter(j =>
    j.appliedAt && new Date(j.appliedAt) >= startOfToday
  ).length

  const appliedThisWeek = allJobs.filter(j =>
    j.appliedAt && new Date(j.appliedAt) >= startOfWeek
  ).length

  const totalApplied = allJobs.filter(j =>
    j.stage !== 'prospect'
  ).length

  // Active pipeline = prospect + applied + interview
  const activePipeline = allJobs.filter(j =>
    ['prospect', 'applied', 'interview'].includes(j.stage)
  ).length

  // Rates (only meaningful with volume)
  const totalInterviews = allJobs.filter(j =>
    j.stage === 'interview' || j.stage === 'offer'
  ).length

  const totalOffers = allJobs.filter(j => j.stage === 'offer').length
  const totalRejected = allJobs.filter(j => j.stage === 'rejected').length
  const totalResponses = totalInterviews + totalOffers + totalRejected

  const responseRate = totalApplied > 0
    ? Math.round((totalResponses / totalApplied) * 100)
    : 0

  const interviewRate = totalApplied > 0
    ? Math.round((totalInterviews / totalApplied) * 100)
    : 0

  // Stale follow-ups
  const followUpThreshold = user === 'caylah' ? fiveDaysAgo : fourDaysAgo
  const staleJobs = allJobs.filter(j =>
    j.stage === 'applied' &&
    j.appliedAt &&
    new Date(j.appliedAt) <= followUpThreshold
  ).length

  // Days active since first application
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
    flags.push('Response rate below 15% — try more direct outreach before applying.')
  }
  if (staleJobs > 0) {
    flags.push(`${staleJobs} application${staleJobs > 1 ? 's' : ''} need follow-up (${user === 'caylah' ? '5' : '4'}+ days old).`)
  }
  if (pipeline.prospect > 10) {
    flags.push(`${pipeline.prospect} prospects sitting idle — move your top ones to applied.`)
  }

  return NextResponse.json({
    appliedToday,
    appliedThisWeek,
    totalApplied,
    activePipeline,
    responseRate,
    interviewRate,
    totalOffers,
    staleJobs,
    daysActive,
    pipeline,
    flags,
  })
}