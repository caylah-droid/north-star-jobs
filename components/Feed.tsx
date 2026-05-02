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

  const [pasteUrl, setPasteUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [preview, setPreview] = useState<{
    company: string
    role: string
    platform: string
    description: string
  } | null>(null)
  const [previewError, setPreviewError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ company: string; role: string; description: string } | null>(null)

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
        body: JSON.stringify({ ...job, user: activeUser }),
      })
      setAdded(prev => new Set([...prev, job.id]))
    } catch {}
    setAdding(null)
  }

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown'
    const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${Math.round(hours)}h ago`
    return `${Math.round(hours / 24)}d ago`
  }

  return (
    <div>

      {/* URL INPUT */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Paste job URL..."
          value={pasteUrl}
          onChange={e => setPasteUrl(e.target.value)}
        />
        <button onClick={handleExtract}>Add →</button>
      </div>

      {/* PREVIEW */}
      {preview && (
        <div style={{ padding: 10, border: '1px solid purple', marginBottom: 20 }}>
          <input
            placeholder="Company"
            value={preview.company}
            onChange={e => setPreview(p => p ? { ...p, company: e.target.value } : p)}
          />
          <input
            placeholder="Role"
            value={preview.role}
            onChange={e => setPreview(p => p ? { ...p, role: e.target.value } : p)}
          />

          <textarea
            placeholder="Job description"
            value={preview.description}
            onChange={e => setPreview(p => p ? { ...p, description: e.target.value } : p)}
          />

          <button onClick={handleConfirm}>Add to Feed</button>
        </div>
      )}

      {/* JOB LIST */}
      {jobs.map(job => (
        <div key={job.id} style={{ marginBottom: 12, border: '1px solid #ccc', padding: 10 }}>

          <div>{job.company}</div>
          <div>{job.role}</div>
          <div>{job.description}</div>

          {/* EDIT BUTTON */}
          {job.isManual && editingId !== job.id && (
            <button
              onClick={() => {
                setEditingId(job.id)
                setEditForm({
                  company: job.company,
                  role: job.role,
                  description: job.description || ''
                })
              }}
            >
              Edit
            </button>
          )}

          {/* EDIT FORM */}
          {job.isManual && editingId === job.id && editForm && (
            <div>
              <input
                value={editForm.company}
                onChange={e => setEditForm(f => f ? { ...f, company: e.target.value } : f)}
              />
              <input
                value={editForm.role}
                onChange={e => setEditForm(f => f ? { ...f, role: e.target.value } : f)}
              />
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)}
              />

              <button
                onClick={() => {
                  setJobs(prev =>
                    prev.map(j => j.id === job.id ? { ...j, ...editForm } : j)
                  )
                  setEditingId(null)
                  setEditForm(null)
                }}
              >
                Save
              </button>

              <button onClick={() => {
                setEditingId(null)
                setEditForm(null)
              }}>
                Cancel
              </button>
            </div>
          )}

        </div>
      ))}
    </div>
  )
}
