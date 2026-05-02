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

const ZAR = 18.5

export default function JobBoard({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const [showModal, setShowModal] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadJobs = async () => {
    setLoading(true)
    const res = await fetch(`/api/jobs?user=${activeUser}`)
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { loadJobs() }, [activeUser])

  const updateStage = async (jobId: string, stage: string) => {
    setUpdating(jobId)
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    await loadJobs()
    setUpdating(null)
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Remove this opportunity?')) return
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
    await loadJobs()
  }

  const topJobs = jobs.filter(j => j.stage !== 'rejected').slice(0, 5)
  const jobsByStage = (stage: string) => jobs.filter((j) => j.stage === stage)

  const nextStage: Record<string, string> = {
    prospect: 'applied',
    applied: 'interview',
    interview: 'offer',
  }

  const nextLabel: Record<string, string> = {
    prospect: 'Apply',
    applied: 'Interview',
    interview: 'Offer',
  }

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
                  <span className="tier-badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
                    {stages.find(s => s.id === job.stage)?.label}
                  </span>
                </div>
                <div className="company-why">{job.role} · {job.platform}</div>
                {job.salaryMin && (
                  <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                    ${job.salaryMin.toLocaleString()}/mo · R{(job.salaryMin * ZAR).toLocaleString()}/mo
                  </div>
                )}
              </div>
              <div className="company-actions">
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <button className="btn-secondary">View</button>
                  </a>
                )}
                {nextStage[job.stage] && (
                  <button
                    className={`btn-primary ${isKyle ? 'kyle' : ''}`}
                    onClick={() => updateStage(job.id, nextStage[job.stage])}
                    disabled={updating === job.id}
                    style={{ opacity: updating === job.id ? 0.6 : 1 }}
                  >
                    {updating === job.id ? '...' : nextLabel[job.stage]}
                  </button>
                )}
                <button
                  onClick={() => updateStage(job.id, 'rejected')}
                  style={{
                    padding: '6px 10px', background: '#1e293b',
                    color: '#ef4444', border: 'none', borderRadius: 8,
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
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
                  background: '#1e293b', borderRadius: 8,
                  padding: 10, marginBottom: 8,
                }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{job.company}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{job.role}</div>
                  {job.salaryMin && (
                    <div style={{ color: '#4ade80', fontSize: 11, marginTop: 4 }}>
                      ${job.salaryMin.toLocaleString()}/mo
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {nextStage[job.stage] && (
                      <button
                        onClick={() => updateStage(job.id, nextStage[job.stage])}
                        disabled={updating === job.id}
                        style={{
                          flex: 1, padding: '4px 0', fontSize: 11,
                          background: isKyle ? '#7c3aed' : '#2563eb',
                          color: 'white', border: 'none',
                          borderRadius: 6, cursor: 'pointer',
                        }}
                      >
                        {updating === job.id ? '...' : nextLabel[job.stage]}
                      </button>
                    )}
                    <button
                      <button
  onClick={() => updateStage(job.id, 'Rejected')}
  style={{ padding: '5px 10px', background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
>
  👎 Reject
</button>
<button
  onClick={() => deleteJob(job.id)}
  style={{ padding: '5px 10px', background: '#1e293b', color: '#475569', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}
  title="Remove from pipeline entirely"
>
  🗑️
</button>
                      style={{
                        padding: '4px 8px', fontSize: 11,
                        background: '#0f172a', color: '#ef4444',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
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
