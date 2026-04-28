'use client'

import { useState } from 'react'

type Props = {
  activeUser: 'caylah' | 'kyle'
  limit?: number
}

type Job = {
  id: string
  company: string
  role: string
  salary: number
  stage: 'prospect' | 'applied' | 'interview' | 'offer' | 'rejected'
  postedAt: number
}

const stages = [
  { id: 'prospect', label: '🔭 Prospect' },
  { id: 'applied', label: '📨 Applied' },
  { id: 'interview', label: '🎙️ Interview' },
  { id: 'offer', label: '🎉 Offer' },
  { id: 'rejected', label: '❌ Rejected' },
]

export default function JobBoard({ activeUser, limit }: Props) {
  const isKyle = activeUser === 'kyle'

  // TEMP: replace later with DB
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      company: 'Stripe',
      role: 'Operations Manager',
      salary: 12000,
      stage: 'prospect',
      postedAt: Date.now() - 1000 * 60 * 60 * 5, // 5h ago
    },
    {
      id: '2',
      company: 'GitLab',
      role: 'RevOps Lead',
      salary: 10000,
      stage: 'prospect',
      postedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day
    },
  ])

  // 🔥 PRIORITY ENGINE
  const scoreJob = (job: Job) => {
    const hoursOld = (Date.now() - job.postedAt) / (1000 * 60 * 60)

    const freshness = hoursOld < 24 ? 1 : hoursOld < 72 ? 0.7 : 0.3
    const salaryScore = job.salary / 15000

    return freshness * 0.6 + salaryScore * 0.4
  }

  const sortedJobs = [...jobs].sort((a, b) => scoreJob(b) - scoreJob(a))
  const topJobs = limit ? sortedJobs.slice(0, limit) : sortedJobs

  // 🚀 ACTIONS
  const updateStage = (id: string, stage: Job['stage']) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, stage } : j))
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex-between">
        <div>
          <div className="section-title">Opportunities</div>
          <div className="section-sub">
            {isKyle
              ? 'Revenue · Pipeline · Growth'
              : 'Ops · Automation · Scale'}
          </div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>
          + Add Job
        </button>
      </div>

      {/* 🔥 TOP JOBS */}
      <div className="section-label" style={{ marginBottom: 12 }}>
        <h3>🔥 Highest Probability</h3>
        <span className="count-badge">Top {limit || jobs.length}</span>
      </div>

      {topJobs.length === 0 ? (
        <div className="top5-empty">
          <p>No jobs yet.</p>
        </div>
      ) : (
        <div className="top-grid">
          {topJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-title">{job.role}</div>
              <div className="job-company">{job.company}</div>
              <div className="job-meta">
                💰 ${job.salary} · 🔥 Fresh
              </div>

              <div className="job-actions">
                <button onClick={() => updateStage(job.id, 'applied')}>
                  🚀 Apply
                </button>
                <button onClick={() => updateStage(job.id, 'prospect')}>
                  👍 Save
                </button>
                <button onClick={() => updateStage(job.id, 'rejected')}>
                  👎 Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📊 PIPELINE */}
      {!limit && (
        <>
          <div className="section-label">
            <h3>Pipeline</h3>
          </div>

          <div className="kanban-grid">
            {stages.map((stage) => (
              <div key={stage.id} className="kanban-col">
                <div className="kanban-header">{stage.label}</div>

                {jobs.filter((j) => j.stage === stage.id).length === 0 ? (
                  <div className="kanban-empty">Empty</div>
                ) : (
                  jobs
                    .filter((j) => j.stage === stage.id)
                    .map((job) => (
                      <div key={job.id} className="kanban-card">
                        {job.role}
                        <div className="small">{job.company}</div>
                      </div>
                    ))
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
