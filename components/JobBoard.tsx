'use client'

import { useState, useEffect } from 'react'
import AddJobModal from './AddJobModal'

type Job = {
  id: string
  company: string
  role: string
  platform: string
  stage: string
  track: string | null
  salaryMin: number | null
  salaryMax: number | null
  isFresh: boolean
  isHighValue: boolean
  isStrongMatch: boolean
  priorityScore: number
  url: string | null
}

type Props = { activeUser: 'caylah' | 'kyle' }

const stages = [
  { id: 'prospect', label: '🔭 Prospect' },
  { id: 'applied', label: '📨 Applied' },
  { id: 'interview', label: '🎙️ Interview' },
  { id: 'offer', label: '🎉 Offer' },
  { id: 'rejected', label: '❌ Rejected' },
]

export default function JobBoard({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const [showModal, setShowModal] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const loadJobs = async () => {
    setLoading(true)
    const res = await fetch(`/api/jobs?user=${activeUser}`)
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { loadJobs() }, [activeUser])

  const topJobs = jobs.slice(0, 5)
  const jobsByStage = (stage: string) => jobs.filter((j) => j.stage === stage)

  return (
    <div>
      <div className="flex-between">
        <div>
          <div className="section-title">Opportunities</div>
          <div className="section-sub">
            {isKyle
              ? 'LegalTech CSM · Marketing Ops · Account Management'
              : 'RevOps · GTM Ops · Business Operations'}
          </div>
        </div>
        <button
          className={`btn-add ${isKyle ? 'kyle' : ''}`}
          onClick={() => setShowModal(true)}
        >
          + Add Job
        </button>
      </div>

      {/* Top 5 */}
      <div className="section-label" style={{ marginBottom: 12 }}>
        <h3>⭐ Highest Probability</h3>
        <span className="count-badge">Top 5</span>
      </div>

      {loading ? (
        <div className="top5-empty"><p>Loading...</p></div>
      ) : topJobs.length === 0 ? (
        <div className="top5-empty">
          <p>No jobs added yet.</p>
          <span>Add your first opportunity to see it ranked here.</span>
        </div>
      ) : (
        <div style={{ marginBottom: 32 }}>
          {topJobs.map((job) => (
            <div key={job.id} className="company-card" style={{ marginBottom: 10 }}>
              <div className="company-avatar">{job.company[0]}</div>
              <div className="company-info">
                <div className="company-name">
                  {job.company}
                  {job.isFresh && (
                    <span className="tier-badge" style={{ background: '#14532d', color: '#4ade80' }}>🔥 Fresh</span>
                  )}
                  {job.isHighValue && (
                    <span className="tier-badge" style={{ background: '#422006', color: '#fbbf24' }}>💰 High Value</span>
                  )}
                </div>
                <div className="company-why">{job.role} · {job.platform}</div>
                {job.salaryMin && (
                  <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                    ${job.salaryMin.toLocaleString()}/mo · R{(job.salaryMin * 18.5).toLocaleString()}/mo
                  </div>
                )}
              </div>
              <div className="company-actions">
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <button className="btn-secondary">View</button>
                  </a>
                )}
                <button className={`btn-primary ${isKyle ? 'kyle' : ''}`}>Apply</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban */}
      <div className="section-label">
        <h3>All Opportunities</h3>
        <span className="count-badge">{jobs.length} total</span>
      </div>

      <div className="kanban-grid">
        {stages.map((stage) => (
          <div key={stage.id} className="kanban-col">
            <div className="kanban-header">
              {stage.label}
              <span style={{ marginLeft: 6, color: '#475569' }}>
                {jobsByStage(stage.id).length}
              </span>
            </div>
            {jobsByStage(stage.id).length === 0 ? (
              <div className="kanban-empty">Empty</div>
            ) : (
              jobsByStage(stage.id).map((job) => (
                <div key={job.id} style={{
                  background: '#1e293b',
                  borderRadius: 8,
                  padding: '10px',
                  marginBottom: 8,
                  fontSize: 13,
                }}>
                  <div style={{ color: 'white', fontWeight: 600 }}>{job.company}</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>{job.role}</div>
                  {job.isFresh && <div style={{ color: '#4ade80', fontSize: 11, marginTop: 4 }}>🔥 Fresh</div>}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <AddJobModal
          activeUser={activeUser}
          onClose={() => setShowModal(false)}
          onSaved={loadJobs}
        />
      )}
    </div>
  )
}
