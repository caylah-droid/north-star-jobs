'use client'

import { useState, useEffect } from 'react'
import AddJobModal from './AddJobModal'
import PitchModal from './PitchModal'

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
  appliedAt: string | null
  createdAt: string
}

type Props = { activeUser: 'caylah' | 'kyle' }

const stages = [
  { id: 'prospect', label: 'Prospect', emoji: '🔭' },
  { id: 'applied', label: 'Applied', emoji: '📨' },
  { id: 'interview', label: 'Interview', emoji: '🎙️' },
  { id: 'offer', label: 'Offer', emoji: '🎉' },
  { id: 'rejected', label: 'Rejected', emoji: '❌' },
]

const STALE_DAYS_CAYLAH = 5
const STALE_DAYS_KYLE = 4

const stageColor: Record<string, string> = {
  prospect: '#475569',
  applied: '#2563eb',
  interview: '#f59e0b',
  offer: '#4ade80',
  rejected: '#f87171',
}

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

function checkStale(job: Job, staleDays: number): boolean {
  if (job.stage !== 'applied') return false
  const ref = job.appliedAt || job.createdAt
  if (!ref) return false
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - staleDays)
  return new Date(ref) <= threshold
}

type CardProps = {
  job: Job
  accent: string
  staleDays: number
  updating: string | null
  onStage: (id: string, stage: string) => void
  onDelete: (id: string) => void
  onPitch: (job: Job) => void
}

const JobCard = ({ job, accent, staleDays, updating, onStage, onDelete, onPitch }: CardProps) => {
  const stale = checkStale(job, staleDays)
  const hasInterview = job.stage === 'interview'
  const hasOffer = job.stage === 'offer'
  const urgent = hasInterview || hasOffer || stale
  return (
    <div style={{ padding: '7px 14px', borderBottom: '1px solid #0d1117', background: urgent ? '#0d1117' : 'transparent', borderLeft: urgent ? '3px solid ' + (stale ? '#f59e0b' : '#22c55e') : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
          {job.url ? (
            <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: accent, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>{job.company}</a>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}>{job.company}</span>
          )}
          <span style={{ fontSize: 10, color: '#334155', flexShrink: 0 }}>·</span>
          <span style={{ fontSize: 11, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</span>
          {stale && <span style={{ fontSize: 9, background: '#2a1a00', color: '#f59e0b', padding: '1px 5px', borderRadius: 20, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>⏰ Follow up</span>}
          {hasInterview && <span style={{ fontSize: 9, background: '#1a1500', color: '#fbbf24', padding: '1px 5px', borderRadius: 20, flexShrink: 0 }}>Interview</span>}
          {hasOffer && <span style={{ fontSize: 9, background: '#0f1f14', color: '#4ade80', padding: '1px 5px', borderRadius: 20, flexShrink: 0 }}>Offer</span>}
          {job.salaryMin != null && <span style={{ fontSize: 9, background: '#0f1f0a', color: '#86efac', padding: '1px 5px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>${job.salaryMin.toLocaleString()}/mo</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: stageColor[job.stage] + '22', color: stageColor[job.stage], border: '1px solid ' + stageColor[job.stage] + '33', whiteSpace: 'nowrap' }}>{job.stage}</span>
        {nextStage[job.stage] && (
          <button onClick={() => onStage(job.id, nextStage[job.stage])} disabled={updating === job.id} style={{ fontSize: 10, padding: '3px 8px', background: accent, color: 'white', border: 'none', borderRadius: 5, cursor: updating === job.id ? 'default' : 'pointer', opacity: updating === job.id ? 0.6 : 1, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {updating === job.id ? '...' : nextLabel[job.stage]}
          </button>
        )}
        <button onClick={() => onPitch(job)} style={{ fontSize: 10, padding: '3px 7px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Pitch</button>
        <button onClick={() => onStage(job.id, 'rejected')} style={{ fontSize: 10, padding: '3px 6px', background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 5, cursor: 'pointer' }}>👎</button>
        <button onClick={() => onDelete(job.id)} style={{ fontSize: 10, padding: '3px 6px', background: 'transparent', color: '#475569', border: 'none', borderRadius: 5, cursor: 'pointer' }}>🗑️</button>
      </div>
    </div>
  )
}


const KanbanChip = ({ job, accent, staleDays, updating, onStage, onPitch, onDelete }: ChipProps) => {
  const stale = checkStale(job, staleDays)
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px 10px', marginBottom: 6, borderLeft: '3px solid ' + (stale ? '#f59e0b' : stageColor[job.stage] || '#475569') }}>
      {job.url ? (
        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: accent, textDecoration: 'none' }}>
          {job.company}
        </a>
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{job.company}</div>
      )}
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
      {stale && <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 3 }}>⏰ Follow up</div>}
      <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
        {nextStage[job.stage] && (
          <button onClick={() => onStage(job.id, nextStage[job.stage])} disabled={updating === job.id} style={{ fontSize: 10, padding: '3px 8px', background: accent, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
            {updating === job.id ? '...' : nextLabel[job.stage]}
          </button>
        )}
        <button onClick={() => onPitch(job)} style={{ fontSize: 10, padding: '3px 7px', background: '#0f172a', color: '#64748b', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Pitch</button>
        <button onClick={() => onStage(job.id, 'rejected')} style={{ fontSize: 10, padding: '3px 6px', background: '#1e1a2e', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 4, cursor: 'pointer' }}>👎</button>
        <button onClick={() => onDelete(job.id)} style={{ fontSize: 10, padding: '3px 6px', background: 'transparent', color: '#475569', border: 'none', borderRadius: 4, cursor: 'pointer' }}>🗑️</button>
      </div>
    </div>
  )
}


export default function JobBoard({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const staleDays = isKyle ? STALE_DAYS_KYLE : STALE_DAYS_CAYLAH
  const [showModal, setShowModal] = useState(false)
  const [pitchJob, setPitchJob] = useState<Job | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [top5Open, setTop5Open] = useState(true)
  const [rejectedOpen, setRejectedOpen] = useState(false)

  const loadJobs = async () => {
    setLoading(true)
    const res = await fetch('/api/jobs?user=' + activeUser)
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { loadJobs() }, [activeUser])

  const updateStage = async (jobId: string, stage: string) => {
    setUpdating(jobId)
    await fetch('/api/jobs/' + jobId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    await loadJobs()
    setUpdating(null)
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Remove this job?')) return
    await fetch('/api/jobs/' + jobId, { method: 'DELETE' })
    await loadJobs()
  }

  const topJobs = jobs.filter(j => j.stage !== 'rejected').slice(0, 5)
  const jobsByStage = (stage: string) => jobs.filter(j => j.stage === stage)
  const rejectedJobs = jobsByStage('rejected')

  return (
    <div>
      <div className="flex-between">
        <div>
          <div className="section-title">Opportunities</div>
          <div className="section-sub">{isKyle ? 'LegalTech CSM · Marketing Ops · Account Management' : 'RevOps · GTM Ops · Business Operations'}</div>
        </div>
        <button className={'btn-add' + (isKyle ? ' kyle' : '')} onClick={() => setShowModal(true)}>+ Add Job</button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setTop5Open(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', border: '1px solid #1e293b', borderRadius: top5Open ? '12px 12px 0 0' : '12px', padding: '10px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>⭐ Highest Probability</span>
            <span className="count-badge">Top {Math.min(topJobs.length, 5)}</span>
            {topJobs.some(j => j.stage === 'interview' || j.stage === 'offer') && (
              <span style={{ fontSize: 11, background: '#14532d', color: '#4ade80', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>🔥 Action needed</span>
            )}
            {topJobs.some(j => checkStale(j, staleDays)) && (
              <span style={{ fontSize: 11, background: '#2a1a00', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>⏰ Follow up due</span>
            )}
          </div>
          <span style={{ color: '#64748b', fontSize: 16 }}>{top5Open ? '▲' : '▼'}</span>
        </button>

        {!top5Open && !loading && topJobs.length > 0 && (
          <div style={{ background: '#080d16', border: '1px solid #1e293b', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {topJobs.map(job => (
              <span key={job.id} style={{ fontSize: 11, background: '#1e293b', color: '#94a3b8', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageColor[job.stage] || '#475569', display: 'inline-block' }} />
                {job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>{job.company} ↗</a> : job.company}
              </span>
            ))}
          </div>
        )}

        {top5Open && (
          <div style={{ background: '#080d16', border: '1px solid #1e293b', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#475569', fontSize: 13 }}>Loading...</div>
            ) : topJobs.length === 0 ? (
              <div className="top5-empty"><p>No active opportunities yet</p><span>Add jobs from the Feed or manually above</span></div>
            ) : (
              topJobs.map(job => <JobCard key={job.id} job={job} accent={accent} staleDays={staleDays} updating={updating} onStage={updateStage} onDelete={deleteJob} onPitch={setPitchJob} />)
            )}
          </div>
        )}
      </div>

      <div className="section-label">
        <h3>All Opportunities</h3>
        <span className="count-badge">{jobs.filter(j => j.stage !== 'rejected').length} active</span>
      </div>

      <div className="kanban-grid kanban-desktop">
        {stages.map(stage => (
          <div key={stage.id} className="kanban-col" style={{ opacity: stage.id === 'rejected' ? 0.6 : 1 }}>
            <div className="kanban-header">{stage.emoji} {stage.label} <span style={{ marginLeft: 6, color: '#475569' }}>{jobsByStage(stage.id).length}</span></div>
            {jobsByStage(stage.id).length === 0
              ? <div className="kanban-empty">Empty</div>
              : jobsByStage(stage.id).map(job => (
                <div key={job.id}>
                  {stage.id === 'rejected' ? (
                    <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px 10px', marginBottom: 6, borderLeft: '3px solid #f87171' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{job.company}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
                      <button onClick={() => deleteJob(job.id)} style={{ fontSize: 10, padding: '2px 8px', background: 'transparent', color: '#475569', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 6 }}>🗑️ remove</button>
                    </div>
                  ) : (
                    <KanbanChip job={job} accent={accent} staleDays={staleDays} updating={updating} onStage={updateStage} onPitch={setPitchJob} onDelete={deleteJob} />
                  )}
                </div>
              ))
            }
          </div>
        ))}
      </div>

      <div className="kanban-mobile">
        {stages.map(stage => {
          const stageJobs = jobsByStage(stage.id)
          if (stageJobs.length === 0) return null
          return (
            <div key={stage.id} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', padding: '6px 0', borderBottom: '1px solid #1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {stage.emoji} {stage.label}
                <span style={{ fontSize: 11, background: '#1e293b', color: '#475569', padding: '1px 7px', borderRadius: 20 }}>{stageJobs.length}</span>
              </div>
              {stageJobs.map(job => <JobCard key={job.id} job={job} accent={accent} staleDays={staleDays} updating={updating} onStage={updateStage} onDelete={deleteJob} onPitch={setPitchJob} />)}
            </div>
          )
        })}
      </div>

      {showModal && <AddJobModal activeUser={activeUser} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadJobs() }} />}
      {pitchJob && <PitchModal activeUser={activeUser} company={pitchJob.company} role={pitchJob.role} description={pitchJob.role} platform={pitchJob.platform} onClose={() => setPitchJob(null)} />}
    </div>
  )
}
