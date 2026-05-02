// components/Feed.tsx
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
  isManual?: boolean
}

type Props = { activeUser: 'caylah' | 'kyle' }

export default function Feed({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'

  const [jobs, setJobs] = useState<FeedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [pitchJob, setPitchJob] = useState<FeedJob | null>(null)

  // --- URL paste state ---
  const [pasteUrl, setPasteUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [preview, setPreview] = useState<{
    company: string
    role: string
    platform: string
    description: string
  } | null>(null)
  const [previewError, setPreviewError] = useState('')

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

  // --- Extract from URL ---
  const handleExtract = async () => {
    if (!pasteUrl.trim()) return
    setExtracting(true)
    setPreview(null)
    setPreviewError('')
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pasteUrl.trim() }),
      })
      const data = await res.json()
      setPreview({
        company: '',
        role: data.title || '',
        platform: data.platform || 'Other',
        description: data.description || '',
      })
    } catch {
      setPreview({ company: '', role: '', platform: 'Other', description: '' })
      setPreviewError('Could not fetch page — fill in manually below.')
    }
    setExtracting(false)
  }

  // --- Confirm manual card → prepend to feed ---
  const handleConfirm = () => {
    if (!preview) return
    const id = `manual-${Date.now()}`
    const card: FeedJob = {
      id,
      company: preview.company || 'Unknown',
      role: preview.role || 'Role',
      platform: preview.platform,
      url: pasteUrl.trim(),
      salary: null,
      postedAt: new Date().toISOString(),
      source: 'manual',
      description: preview.description || null,
      isManual: true,
    }
    setJobs(prev => [card, ...prev])
    setPasteUrl('')
    setPreview(null)
    setPreviewError('')
  }

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
          isManual: job.isManual ?? false,
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
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${Math.round(hours)}h ago`
    if (hours < 48) return 'Yesterday'
    return `${Math.round(hours / 24)}d ago`
  }

  const isFresh = (dateStr: string | null) => {
    if (!dateStr) return false
    return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60) <= 48
  }

  return (
    <div>
      {/* ── Header ── */}
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

      {/* ── URL Paste Bar ── */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          🔗 Found a job elsewhere?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Paste any job URL — Indeed, LinkedIn, company site..."
            value={pasteUrl}
            onChange={e => setPasteUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !extracting && pasteUrl && handleExtract()}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: 'white',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            onClick={handleExtract}
            disabled={!pasteUrl.trim() || extracting}
            style={{
              padding: '10px 18px',
              background: accent,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: pasteUrl.trim() && !extracting ? 'pointer' : 'not-allowed',
              opacity: !pasteUrl.trim() || extracting ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {extracting ? '⏳ Fetching...' : 'Add →'}
          </button>
        </div>

        {/* Preview / edit card */}
        {preview && (
          <div style={{
            marginTop: 12,
            background: '#1e293b',
            border: '1px solid #7c3aed',
            borderLeft: '3px solid #7c3aed',
            borderRadius: 10,
            padding: 14,
          }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✋ Manual — confirm details
            </div>
            {previewError && (
              <div style={{ fontSize: 12, color: '#f87171', marginBottom: 8 }}>{previewError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                placeholder="Company name"
                value={preview.company}
                onChange={e => setPreview(p => p ? { ...p, company: e.target.value } : p)}
                style={{
                  flex: 1, minWidth: 120,
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <input
                placeholder="Role / job title"
                value={preview.role}
                onChange={e => setPreview(p => p ? { ...p, role: e.target.value } : p)}
                style={{
                  flex: 2, minWidth: 160,
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                placeholder="Platform (e.g. LinkedIn)"
                value={preview.platform}
                onChange={e => setPreview(p => p ? { ...p, platform: e.target.value } : p)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleConfirm}
                disabled={!preview.company && !preview.role}
                style={{
                  padding: '8px 18px',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ✓ Add to Feed
              </button>
              <button
                onClick={() => { setPreview(null); setPreviewError('') }}
                style={{
                  padding: '8px 12px',
                  background: '#1e293b',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Bar ── */}
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
          <span style={{ color: '#a78bfa', fontWeight: 600 }}>
            {jobs.filter(j => j.isManual).length}
          </span> manual
        </span>
        <span style={{ color: '#94a3b8' }}>
          Sources: <span style={{ color: 'white' }}>Remotive · We Work Remotely · Jobicy · Arbeitnow · Himalayas</span>
        </span>
      </div>

      {/* ── Feed ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Scanning job sources...</div>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>Pulling from 5 sources simultaneously</div>
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
                border: job.isManual
                  ? '1px solid #7c3aed'
                  : `1px solid ${added.has(job.id) ? '#166534' : '#1e293b'}`,
                borderLeft: job.isManual ? '3px solid #7c3aed' : undefined,
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 10,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Company initial */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: job.isManual ? '#2e1065' : '#1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: job.isManual ? '#a78bfa' : '#475569',
              }}>
                {job.company?.[0] || '?'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
                    {job.company}
                  </span>

                  {/* Badges */}
                  {job.isManual && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#2e1065', color: '#a78bfa' }}>
                      ✋ Manual
                    </span>
                  )}
                  {isFresh(job.postedAt) && !job.isManual && (
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
                  <div style={{ color: '#4ade80', fontSize: 12 }}>{job.salary}</div>
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
