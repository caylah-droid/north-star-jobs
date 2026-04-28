'use client'

import { useState } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

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

export default function JobBoard({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'

  // TEMP DATA (replace later)
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      company: 'Stripe',
      role: 'Operations Manager',
      salary: 12000,
      stage: 'prospect',
      postedAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: '2',
      company: 'GitLab',
      role: 'RevOps Lead',
      salary: 10000,
      stage: 'prospect',
      postedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
  ])

  // 🔥 PRIORITY LOGIC
  const scoreJob = (job: Job) => {
    const hoursOld = (Date.now() - job.postedAt) / (1000 * 60 * 60)
    const freshness = hoursOld < 24 ? 1 : hoursOld < 72 ? 0.7 : 0.3
    const salaryScore = job.salary / 15000
    return freshness * 0.6 + salaryScore * 0.4
  }

  const sortedJobs = [...jobs].sort((a, b) => scoreJob(b) - scoreJob(a))
  const topJobs = sortedJobs.slice(0, 5)

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
              ? 'LegalTech CSM · Marketing Ops · Account Management'
              : 'RevOps · GTM Ops · Business Operations'}
          </div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>
          + Add Job
        </button>
      </div>

      {/* 🎯 TOP 5 */}
      <div className="section-label" style={{ marginBottom: 12 }}>
        <h3>🎯 Focus Now</h3>
        <span className="count-badge">Top 5</span>
      </div>

      {topJobs.length === 0 ? (
        <div className="top5-empty">
          <p>No jobs added yet.</p>
          <span>Add your first opportunity to see it ranked here.</span>
        </div>
      ) : (
        topJobs.map((job) => (
          <div key={job.id} className="card">
            <div style={{ fontWeight: 600 }}>{job.role}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {job.company}
            </div>

            <div style={{ fontSize: 13, marginTop: 6 }}>
              💰 ${job.salary.toLocaleString()}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button
                className={`btn-primary ${isKyle ? 'kyle' : ''}`}
                onClick={() => updateStage(job.id, 'applied')}
              >
                Apply
              </button>

              <button
                className="btn-secondary"
                onClick={() => updateStage(job.id, 'prospect')}
              >
                Save
              </button>

              <button
                className="btn-secondary"
                onClick={() => updateStage(job.id, 'rejected')}
              >
                Skip
              </button>
            </div>
          </div>
        ))
      )}

      {/* 📊 PIPELINE */}
      <div className="section-label">
        <h3>All Opportunities</h3>
      </div>

      <div className="kanban-grid">
        {stages.map((stage) => {
          const stageJobs = jobs.filter((j) => j.stage === stage.id)

          return (
            <div key={stage.id} className="kanban-col">
              <div className="kanban-header">{stage.label}</div>

              {stageJobs.length === 0 ? (
                <div className="kanban-empty">Empty</div>
              ) : (
                stageJobs.map((job) => (
                  <div key={job.id} className="card" style={{ padding: 10 }}>
                    <div style={{ fontSize: 13 }}>{job.role}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {job.company}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
