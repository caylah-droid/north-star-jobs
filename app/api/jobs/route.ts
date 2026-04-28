function scoreJob(job: any, user: string): number {
  let score = 0

  // Stage — highest weight
  const stageScores: Record<string, number> = {
    offer: 80,
    interview: 50,
    applied: 20,
    prospect: 0,
    rejected: -100,
  }
  score += stageScores[job.stage] || 0

  // Freshness
  if (job.postedAt) {
    const hoursOld = (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60)
    if (hoursOld <= 24) score += 40
    else if (hoursOld <= 48) score += 30
    else if (hoursOld <= 72) score += 15
  }

  // High value threshold per user (monthly USD)
  const threshold = user === 'caylah' ? 5400 : 2700
  if (job.salaryMin && job.salaryMin >= threshold) score += 30

  // Platform quality
  const platformScores: Record<string, number> = {
    'Company Website': 20,
    'We Work Remotely': 15,
    'LinkedIn': 10,
    'Indeed': 8,
    'Glassdoor': 6,
    'Other': 5,
  }
  score += platformScores[job.platform] || 5

  return score
}
