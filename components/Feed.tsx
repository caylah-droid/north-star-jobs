'use client'

import { useState, useEffect } from 'react'
import PitchModal from './PitchModal'

type FeedJob = {
  id: string
  company: string
  role: string
  platform: string
  url: string
  salary: string | null
  postedAt: string | null
  source: string
  description: string | null
}

type Props = { activeUser: 'caylah' | 'kyle' }

export default function Feed({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const [jobs, setJobs] = useState<FeedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [pitchJob, setPitchJob] = useState<FeedJob | null>(null)

  const loadFeed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?user=${activeUser}`)
      const data = await res.json()
      setJobs(data)
    } catch {
      setJobs([])
    }
    setLoading(false)
  }

  useEffect(() => { loadFeed() }, [activeUser])

  const addToPipeline = async (job: FeedJob) => {
    setAdding(job.id)
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          platform: job.platform,
          url: job.url,
          postedAt: job.postedAt,
          salaryMin: null,
          salaryMax: null,
          user: activeUser,
          track: null,
        }),
      })
      setAdded(prev => new Set(Array.from(prev).concat(job.id)))
    } catch {
      console.error('Failed to add job')
    }
    setAdding(null)
  }

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown'
    const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
    if (hours < 24) return `${Math.round(hours)}h ago`
    if (hours < 48) return 'Yesterday'
    return `${Math.round(hours / 24)}d ago`
  }

  const isFresh = (dateStr: string | null) => {
    if (!dateStr) return false
    return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60) <= 48
  }

  const accent = isKyle ? '#7c3aed' : '#2563eb'

  return (
    <div>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <div>
          <div className="section-title">Live Job Feed</div>
          <div className="section-sub">
            {isKyle
              ? 'Customer Success · LegalTech · Account Management · Marketing Ops'
              : 'Revenue Operations · GTM Ops · Business Operations · Systems'}
          </div>
        </div>
        <button
          onClick={loadFeed}
          style={{
            padding: '8px 16px', background: '#1e293b',
            color: '#94a3b8', border: 'none', borderRadius: 8,
            fontSize: 13, cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 10, padding: '10px 16px',
        display: 'flex', gap: 24, marginBottom: 20,
        fontSize: 13, flexWrap: 'wrap',
      }}>
        <span style={{ color: '#94a3b8' }}>
          <span style={{ color: 'white', fontWeight: 600 }}>{jobs.length}</span> roles found
        </span>
        <span style={{ color: '#94a3b8' }}>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>
            {jobs.filter(j => isFresh(j.postedAt)).length}
          </span> fresh (&lt;48h)
        </span>
        <span style={{ color: '#94a3b8' }}>
          Sources: <span style={{ color: 'white' }}>Remotive · We Work Remotely · Jobicy · Arbeitnow · Himalayas</span>
        </span>
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Scanning job sources...</div>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>
            Pulling from 5 sources simultaneously
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>No matching roles found right now.</div>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>Try refreshing in a few hours.</div>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: '#0f172a',
                border: `1px solid ${added.has(job.id) ? '#166534' : '#1e293b'}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: '#1e293b', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#94a3b8',
                flexShrink: 0,
              }}>
                {job.company?.[0] || '?'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
                    {job.company}
                  </span>
                  {isFresh(job.postedAt) && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#14532d', color: '#4ade80' }}>
                      🔥 Fresh
                    </span>
                  )}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#1e293b', color: '#64748b' }}>
                    {job.platform}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569', marginLeft: 'auto' }}>
                    {timeAgo(job.postedAt)}
                  </span>
                </div>

                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
                  {job.role}
                </div>

                {job.description && (
                  <div style={{ color: '#475569', fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>
                    {job.description}
                  </div>
                )}

                {job.salary && (
                  <div style={{ color: '#4ade80', fontSize: 12 }}>
                    {job.salary}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => addToPipeline(job)}
                  disabled={adding === job.id || added.has(job.id)}
                  style={{
                    padding: '7px 14px',
                    background: added.has(job.id) ? '#166534' : accent,
                    color: 'white', border: 'none',
                    borderRadius: 8, fontSize: 12,
                    fontWeight: 600, cursor: added.has(job.id) ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                    opacity: adding === job.id ? 0.7 : 1,
                  }}
                >
                  {added.has(job.id) ? '✓ Added' : adding === job.id ? '...' : '+ Pipeline'}
                </button>
                <button
                  onClick={() => setPitchJob(job)}
                  style={{
                    padding: '7px 14px',
                    background: '#1e293b',
                    color: '#94a3b8', border: 'none',
                    borderRadius: 8, fontSize: 12,
                    fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✨ Pitch
                </button>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <button style={{
                    width: '100%', padding: '7px 14px',
                    background: '#1e293b', color: '#94a3b8',
                    border: 'none', borderRadius: 8,
                    fontSize: 12, cursor: 'pointer',
                  }}>
                    View →
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pitch Modal */}
      {pitchJob && (
        <PitchModal
          activeUser={activeUser}
          company={pitchJob.company}
          role={pitchJob.role}
          description={pitchJob.description}
          platform={pitchJob.platform}
          onClose={() => setPitchJob(null)}
        />
      )}
    </div>
  )
}
