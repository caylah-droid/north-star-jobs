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
  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const [showModal, setShowModal] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [top5Open, setTop5Open] = useState(true)

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
    if (!confirm('Permanently remove this job from your pipeline?')) return
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

  const stageColor: Record<string, string> = {
    prospect: '#475569',
    applied: '#2563eb',
    interview: '#f59e0b',
    offer: '#4ade80',
    rejected: '#f87171',
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
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`} onClick={() => setShowModal(true)}>
          + Add Job
        </button>
      </div>

      {/* ── Top 5: collapsible ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Header row — always visible */}
        <button
          onClick={() => setTop5Open(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: top5Open ? '12px 12px 0 0' : 12,
            padding: '10px 16px',
            cursor: 'pointer',
            marginBottom: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>⭐ Highest Probability</span>
            <span className="count-badge">Top {Math.min(topJobs.length, 5)}</span>
            {topJobs.some(j => j.stage === 'interview' || j.stage === 'offer') && (
              <span style={{ fontSize: 11, background: '#14532d', color: '#4ade80', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                🔥 Action needed
              </span>
            )}
          </div>
          <span style={{ color: '#64748b', fontSize: 16, lineHeight: 1 }}>
            {top5Open ? '▲' : '▼'}
          </span>
        </button>

        {/* Collapsed summary strip */}
        {!top5Open && !loading && topJobs.length > 0 && (
          <div style={{
            background: '#080d16',
            border: '1px solid #1e293b',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '8px 12px',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}>
            {topJobs.map(job => (
              <span key={job.id} style={{
                fontSize: 11,
                background: '#1e293b',
                color: '#94a3b8',
                padding: '3px 10px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageColor[job.stage] || '#475569', display: 'inline-block' }} />
                {job.company}
              </span>
            ))}
          </div>
        )}

        {/* Expanded card list */}
        {top5Open && (
          <div style={{
            background: '#080d16',
            border: '1px solid #1e293b',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>Loading…</div>
            ) : topJobs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 14 }}>No jobs added yet.</p>
                <span style={{ color: '#334155', fontSize: 12, display: 'block', marginTop: 4 }}>
                  Add your first opportunity to see it ranked here.
                </span>
              </div>
            ) : (
              topJobs.map((job, i) => (
                <div
                  key={job.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderBottom: i < topJobs.length - 1 ? '1px solid #1e293b' : 'none',
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: i === 0 ? accent : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? 'white' : '#64748b',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  {/* Company + role */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'white', whiteSpace: 'nowrap' }}>{job.company}</span>
                      {job.isFresh && <span style={{ fontSize: 10, background: '#14532d', color: '#4ade80', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>🔥</span>}
                      {job.isHighValue && <span style={{ fontSize: 10, background: '#422006', color: '#fbbf24', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>💰</span>}
                      <span style={{
                        fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 600,
                        background: '#1e293b', color: stageColor[job.stage] || '#94a3b8',
                      }}>
                        {stages.find(s => s.id === job.stage)?.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.role}
                      {job.salaryMin ? (
                        <span style={{ color: '#4ade80', marginLeft: 8 }}>${job.salaryMin.toLocaleString()}/mo</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>View</button>
                      </a>
                    )}
                    {nextStage[job.stage] && (
                      <button
                        className={`btn-primary ${isKyle ? 'kyle' : ''}`}
                        onClick={() => updateStage(job.id, nextStage[job.stage])}
                        disabled={updating === job.id}
                        style={{ fontSize: 11, padding: '4px 10px', opacity: updating === job.id ? 0.6 : 1 }}
                      >
                        {updating === job.id ? '…' : nextLabel[job.stage]}
                      </button>
                    )}
                    <button
                      onClick={() => updateStage(job.id, 'rejected')}
                      style={{ padding: '4px 8px', background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                    >
                      👎
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      style={{ padding: '4px 8px', background: '#0f172a', color: '#475569', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                      title="Permanently remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Kanban (responsive: grid on wide, list on narrow) ── */}
      <div className="section-label">
        <h3>All Opportunities</h3>
        <span className="count-badge">{jobs.length} total</span>
      </div>

      {/* Wide screen: grid */}
      <div className="kanban-grid kanban-desktop">
        {stages.map((stage) => (
          <div key={stage.id} className="kanban-col">
            <div className="kanban-header">
              {stage.label}
              <span style={{ marginLeft: 6, color: '#475569' }}>{jobsByStage(stage.id).length}</span>
            </div>
            {jobsByStage(stage.id).length === 0 ? (
              <div className="kanban-empty">Empty</div>
            ) : (
              jobsByStage(stage.id).map((job) => (
                <div key={job.id} style={{ background: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{job.company}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{job.role}</div>
                  {job.salaryMin && (
                    <div style={{ color: '#4ade80', fontSize: 11, marginTop: 4 }}>
                      ${job.salaryMin.toLocaleString()}/mo
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {nextStage[job.stage] && (
                      <button
                        onClick={() => updateStage(job.id, nextStage[job.stage])}
                        disabled={updating === job.id}
                        style={{ flex: 1, padding: '4px 0', fontSize: 11, background: accent, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        {updating === job.id ? '…' : nextLabel[job.stage]}
                      </button>
                    )}
                    <button
                      onClick={() => updateStage(job.id, 'rejected')}
                      style={{ padding: '4px 7px', fontSize: 11, background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                      title="Mark as rejected"
                    >
                      👎
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      style={{ padding: '4px 7px', fontSize: 11, background: '#0f172a', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      title="Permanently remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Narrow screen: list grouped by stage */}
      <div className="kanban-list kanban-mobile">
        {stages.map((stage) => {
          const stageJobs = jobsByStage(stage.id)
          return (
            <div key={stage.id} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#64748b',
                padding: '6px 0', borderBottom: '1px solid #1e293b',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {stage.label}
                <span style={{
                  fontSize: 11, background: '#1e293b', color: '#475569',
                  padding: '1px 7px', borderRadius: 20,
                }}>
                  {stageJobs.length}
                </span>
              </div>
              {stageJobs.length === 0 ? (
                <div style={{ fontSize: 12, color: '#334155', padding: '8px 0' }}>Empty</div>
              ) : (
                stageJobs.map(job => (
                  <div key={job.id} style={{
                    background: '#0f172a', border: '1px solid #1e293b',
                    borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{job.company}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
                      {job.salaryMin && (
                        <div style={{ color: '#4ade80', fontSize: 11, marginTop: 3 }}>${job.salaryMin.toLocaleString()}/mo</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      {nextStage[job.stage] && (
                        <button
                          onClick={() => updateStage(job.id, nextStage[job.stage])}
                          disabled={updating === job.id}
                          style={{ padding: '5px 10px', fontSize: 11, background: accent, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                        >
                          {updating === job.id ? '…' : nextLabel[job.stage]}
                        </button>
                      )}
                      <button
                        onClick={() => updateStage(job.id, 'rejected')}
                        style={{ padding: '5px 7px', fontSize: 11, background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 6, cursor: 'pointer' }}
                      >
                        👎
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        style={{ padding: '5px 7px', fontSize: 11, background: '#1e293b', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
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
