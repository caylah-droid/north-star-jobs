'use client'

import { useState, useEffect } from 'react'
import PitchModal from './PitchModal'

type FeedJob = {
  id: string
  dbId?: string
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

  const [pasteUrl, setPasteUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [preview, setPreview] = useState<{ company: string; role: string; platform: string; description: string; salary: string } | null>(null)
  const [previewError, setPreviewError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ company: string; role: string; description: string } | null>(null)
  const [salaryPrompt, setSalaryPrompt] = useState<{ job: FeedJob; value: string } | null>(null)

  const loadFeed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?user=${activeUser}&t=${Date.now()}`)
      const data = await res.json()
      setJobs(data)
    } catch { setJobs([]) }
    setLoading(false)
  }

  useEffect(() => { loadFeed() }, [activeUser])

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
      setPreview({ company: '', role: data.title || '', platform: data.platform || 'Other', description: data.description || '', salary: '' })
    } catch {
      setPreview({ company: '', role: '', platform: 'Other', description: '', salary: '' })
      setPreviewError('Could not fetch page — fill in manually.')
    }
    setExtracting(false)
  }

  const handleConfirm = async () => {
    if (!preview) return
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: preview.company || 'Unknown',
          role: preview.role || 'Role',
          platform: preview.platform,
          url: pasteUrl.trim(),
          postedAt: new Date().toISOString(),
          salaryMin: preview.salary ? parseInt(preview.salary.replace(/[^0-9]/g, '')) : null,
          salaryMax: preview.salary ? parseInt(preview.salary.replace(/[^0-9]/g, '')) : null,
          user: activeUser,
          track: null,
          isManual: true,
          feedOnly: true,
          description: preview.description || null,
        }),
      })
    } catch { console.error('Failed to save manual job') }
    setPasteUrl('')
    setPreview(null)
    setPreviewError('')
    await loadFeed()
  }

  const addToPipeline = async (job: FeedJob, salaryOverride?: string) => {
    if (!job.salary && !salaryOverride && !job.isManual) {
      setSalaryPrompt({ job, value: '' })
      return
    }
    setAdding(job.id)
    const salaryVal = salaryOverride || job.salary
    const salaryMin = salaryVal && salaryVal !== 'skip' ? parseInt(salaryVal.replace(/[^0-9]/g, '')) || null : null
    try {
      if (job.isManual && job.dbId) {
        await fetch(`/api/jobs/${job.dbId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedOnly: false }),
        })
      } else {
        await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: job.company,
            role: job.role,
            platform: job.platform,
            url: job.url,
            postedAt: job.postedAt,
            salaryMin: salaryMin,
            salaryMax: salaryMin,
            user: activeUser,
            track: null,
            isManual: false,
            feedOnly: false,
            description: job.description || null,
          }),
        })
      }
      setAdded(prev => new Set(Array.from(prev).concat(job.id)))
    } catch { console.error('Failed to add job') }
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

const filteredJobs = jobs

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
        <button onClick={loadFeed} style={{ padding: '8px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Browse Manually */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
          🌐 Browse manually — paste URL below to add
        </div>
        {/* Tier 1 — Not in feed, high signal */}
        <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          ⭐ Highest priority — not in feed
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { label: 'Wellfound', url: 'https://wellfound.com/jobs' },
            { label: 'LinkedIn', url: 'https://linkedin.com/jobs/' },
            { label: 'Indeed', url: 'https://za.indeed.com/' },
            { label: 'Crossover', url: 'https://crossover.com/jobs' },
            { label: 'BuiltIn', url: 'https://builtin.com/jobs/remote?city=&state=&country=USA&allLocations=true' },
            { label: 'Scale.jobs', url: 'https://scale.jobs/search' },
            { label: 'NoDesk', url: 'https://nodesk.co/remote-jobs/' },
            { label: 'Somewhere', url: 'https://somewhere.com/jobs' },
            
            
            
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#14532d', color: '#4ade80', cursor: 'pointer', border: '1px solid #166534', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {link.label} ↗
              </span>
            </a>
          ))}
        </div>
        {/* Tier 2 — Already in feed */}
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Already in feed
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'WWR', url: 'https://weworkremotely.com' },
            { label: 'Himalayas', url: 'https://himalayas.app/jobs' },
            { label: 'RemoteOK', url: 'https://remoteok.com' },
            { label: 'Remotive', url: 'https://remotive.com' },
            { label: 'Jobicy', url: 'https://jobicy.com' },
            { label: 'Working Nomads', url: 'https://www.workingnomads.com/jobs' },
            { label: '4 Day Week', url: 'https://4dayweek.io' },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#0f172a', color: '#475569', cursor: 'pointer', border: '1px solid #1e293b', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {link.label} ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* URL Paste Bar */}
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 16 }}>
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
            style={{ flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={handleExtract}
            disabled={!pasteUrl.trim() || extracting}
            style={{ padding: '10px 18px', background: accent, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: !pasteUrl.trim() || extracting ? 'not-allowed' : 'pointer', opacity: !pasteUrl.trim() || extracting ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {extracting ? '⏳ Fetching...' : 'Add →'}
          </button>
        </div>

        {preview && (
          <div style={{ marginTop: 12, background: '#1e293b', border: '1px solid #7c3aed', borderLeft: '3px solid #7c3aed', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✋ Manual — confirm details
            </div>
            {previewError && <div style={{ fontSize: 12, color: '#f87171', marginBottom: 8 }}>{previewError}</div>}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                placeholder="Company name"
                value={preview.company}
                onChange={e => setPreview(p => p ? { ...p, company: e.target.value } : p)}
                style={{ flex: 1, minWidth: 120, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
              />
              <input
                placeholder="Role / job title"
                value={preview.role}
                onChange={e => setPreview(p => p ? { ...p, role: e.target.value } : p)}
                style={{ flex: 2, minWidth: 160, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
              />
            </div>
            <textarea
              placeholder="Paste job description here (used for pitch generation)..."
              value={preview.description}
              onChange={e => setPreview(p => p ? { ...p, description: e.target.value } : p)}
              rows={4}
              style={{ width: '100%', marginBottom: 8, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                placeholder="Platform (e.g. LinkedIn)"
                value={preview.platform}
                onChange={e => setPreview(p => p ? { ...p, platform: e.target.value } : p)}
                style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
              />
              <input
                placeholder="Salary ($/mo)"
                value={preview.salary}
                onChange={e => setPreview(p => p ? { ...p, salary: e.target.value } : p)}
                style={{ width: 130, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={handleConfirm}
                style={{ padding: '8px 18px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ✓ Add to Feed
              </button>
              <button
                onClick={() => { setPreview(null); setPreviewError('') }}
                style={{ padding: '8px 12px', background: '#1e293b', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}

      {/* Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Scanning job sources...</div>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>Pulling from 5 sources simultaneously</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>No matching roles found right now.</div>
          <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>Try refreshing in a few hours.</div>
        </div>
      ) : (
        <div>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: '#0f172a',
                border: job.isManual ? '1px solid #7c3aed' : `1px solid ${added.has(job.id) ? '#166534' : '#1e293b'}`,
                borderLeft: job.isManual ? '3px solid #7c3aed' : undefined,
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 10,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: job.isManual ? '#2e1065' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: job.isManual ? '#a78bfa' : '#475569' }}>
                {job.company?.[0] || '?'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{job.company}</span>
                  {job.isManual && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#2e1065', color: '#a78bfa' }}>✋ Manual</span>
                  )}
                  {isFresh(job.postedAt) && !job.isManual && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#14532d', color: '#4ade80' }}>🔥 Fresh</span>
                  )}
                  <span style={{ fontSize: 12, color: '#475569', marginLeft: 'auto' }}>{timeAgo(job.postedAt)}</span>
                </div>

                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>{job.role}</div>

                {job.isManual && editingId === job.id && editForm ? (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input value={editForm.company} onChange={e => setEditForm(f => f ? { ...f, company: e.target.value } : f)} placeholder="Company" style={{ padding: '6px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: 'white', fontSize: 12, outline: 'none' }} />
                    <input value={editForm.role} onChange={e => setEditForm(f => f ? { ...f, role: e.target.value } : f)} placeholder="Role" style={{ padding: '6px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: 'white', fontSize: 12, outline: 'none' }} />
                    <textarea value={editForm.description} onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)} rows={3} placeholder="Job description" style={{ padding: '6px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: 'white', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setJobs(prev => prev.map(j => j.id === job.id ? { ...j, company: editForm.company, role: editForm.role, description: editForm.description } : j)); setEditingId(null); setEditForm(null) }} style={{ padding: '6px 14px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => { setEditingId(null); setEditForm(null) }} style={{ padding: '6px 10px', background: '#1e293b', color: '#64748b', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {job.description && (
                      <div style={{ color: '#475569', fontSize: 12, lineHeight: 1.5, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</div>
                    )}
                    {job.salary && (
                      <div style={{ color: '#4ade80', fontSize: 12 }}>{job.salary}</div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => addToPipeline(job)}
                  disabled={adding === job.id || added.has(job.id)}
                  style={{ padding: '7px 14px', background: added.has(job.id) ? '#166534' : accent, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: added.has(job.id) ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: adding === job.id ? 0.7 : 1 }}
                >
                  {added.has(job.id) ? '✓ Added' : adding === job.id ? '...' : '+ Pipeline'}
                </button>
                <button
                  onClick={() => setPitchJob(job)}
                  style={{ padding: '7px 14px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  ✨ Pitch
                </button>
                {job.isManual && editingId !== job.id && (
                  <button
                    onClick={() => { setEditingId(job.id); setEditForm({ company: job.company, role: job.role, description: job.description || '' }) }}
                    style={{ padding: '7px 14px', background: '#1e293b', color: '#a78bfa', border: '1px solid #7c3aed', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ✏️ Edit
                  </button>
                )}
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <button style={{ width: '100%', padding: '7px 14px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                    View →
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {salaryPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {salaryPrompt.job.company} — {salaryPrompt.job.role}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              No salary listed. Enter monthly USD if known, or skip.
            </div>
            <input
              type="text"
              placeholder="e.g. 5400 (monthly USD)"
              value={salaryPrompt.value}
              onChange={e => setSalaryPrompt(p => p ? { ...p, value: e.target.value } : p)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const job = salaryPrompt.job
                  const val = salaryPrompt.value
                  setSalaryPrompt(null)
                  addToPipeline(job, val || 'skip')
                }
              }}
              style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { const job = salaryPrompt.job; setSalaryPrompt(null); addToPipeline(job, 'skip') }}
                style={{ flex: 1, padding: '10px', background: '#1e293b', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                Skip
              </button>
              <button
                onClick={() => { const job = salaryPrompt.job; const val = salaryPrompt.value; setSalaryPrompt(null); addToPipeline(job, val || 'skip') }}
                style={{ flex: 2, padding: '10px', background: accent, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                + Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

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
