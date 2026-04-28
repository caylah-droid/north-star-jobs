'use client'

import { useState } from 'react'

type Props = {
  activeUser: 'caylah' | 'kyle'
  onClose: () => void
  onSaved: () => void
}

const caylahTracks = ['RevOps', 'GTM Ops', 'Business Operations', 'Sales Ops']
const kyleTracks = ['LegalTech CSM', 'Marketing Ops', 'Account Management', 'Legal Operations']

const platforms = ['LinkedIn', 'Indeed', 'Company Website', 'We Work Remotely', 'Glassdoor', 'Other']

export default function AddJobModal({ activeUser, onClose, onSaved }: Props) {
  const isKyle = activeUser === 'kyle'
  const tracks = isKyle ? kyleTracks : caylahTracks

  const [form, setForm] = useState({
    company: '',
    role: '',
    platform: '',
    url: '',
    salaryMin: '',
    salaryMax: '',
    track: tracks[0],
    postedAt: '',
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.company || !form.role || !form.platform) return
    setSaving(true)

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user: activeUser }),
    })

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 480,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Add Opportunity</h2>
          <button onClick={onClose} style={{ color: '#64748b', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {[
          { label: 'Company *', key: 'company', placeholder: 'e.g. Notion' },
          { label: 'Role *', key: 'role', placeholder: 'e.g. Revenue Operations Manager' },
          { label: 'Job URL', key: 'url', placeholder: 'https://...' },
          { label: 'Min Salary (USD)', key: 'salaryMin', placeholder: 'e.g. 80000' },
          { label: 'Max Salary (USD)', key: 'salaryMax', placeholder: 'e.g. 120000' },
          { label: 'Date Posted', key: 'postedAt', placeholder: '', type: 'date' },
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              {field.label}
            </label>
            <input
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 8, color: 'white', fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Platform *</label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px',
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, color: 'white', fontSize: 14,
            }}
          >
            <option value="">Select platform</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Track</label>
          <select
            value={form.track}
            onChange={(e) => setForm({ ...form, track: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px',
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, color: 'white', fontSize: 14,
            }}
          >
            {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', background: '#1e293b',
              color: '#94a3b8', border: 'none', borderRadius: 8,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1, padding: '10px',
              background: isKyle ? '#7c3aed' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Opportunity'}
          </button>
        </div>
      </div>
    </div>
  )
}
