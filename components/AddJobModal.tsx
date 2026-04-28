'use client'

import { useState } from 'react'

type Props = {
  activeUser: 'caylah' | 'kyle'
  onClose: () => void
  onSaved: () => void
}

const platforms = ['LinkedIn', 'Indeed', 'Company Website', 'We Work Remotely', 'Glassdoor', 'Other']

export default function AddJobModal({ activeUser, onClose, onSaved }: Props) {
  const isKyle = activeUser === 'kyle'

  const [form, setForm] = useState({
    company: '',
    role: '',
    platform: '',
    url: '',
    postedAt: '',
    salaryStated: false,
    salary: '',
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.company || !form.role || !form.platform) return
    setSaving(true)

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: form.company,
        role: form.role,
        platform: form.platform,
        url: form.url,
        postedAt: form.postedAt,
        salaryMin: form.salaryStated && form.salary ? form.salary : null,
        salaryMax: form.salaryStated && form.salary ? form.salary : null,
        user: activeUser,
      }),
    })

    setSaving(false)
    onSaved()
    onClose()
  }

  const accent = isKyle ? '#7c3aed' : '#2563eb'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 440,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Add Opportunity</h2>
          <button onClick={onClose} style={{ color: '#64748b', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Company */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Company</label>
          <input
            type="text"
            placeholder="e.g. Notion"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
          />
        </div>

        {/* Role */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Role *</label>
          <input
            type="text"
            placeholder="e.g. Revenue Operations Manager"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
          />
        </div>

        {/* Platform */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Platform *</label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
          >
            <option value="">Where did you find this?</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* URL */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Job URL</label>
          <input
            type="text"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
          />
        </div>

        {/* Date Posted */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Date Posted</label>
          <input
            type="date"
            value={form.postedAt}
            onChange={(e) => setForm({ ...form, postedAt: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
          />
        </div>

        {/* Salary toggle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Salary stated in listing?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setForm({ ...form, salaryStated: true })}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: form.salaryStated ? accent : '#1e293b',
                  color: form.salaryStated ? 'white' : '#64748b',
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setForm({ ...form, salaryStated: false, salary: '' })}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: !form.salaryStated ? '#334155' : '#1e293b',
                  color: !form.salaryStated ? 'white' : '#64748b',
                }}
              >
                No
              </button>
            </div>
          </div>

          {form.salaryStated && (
            <input
              type="number"
              placeholder="e.g. 9000"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
            />
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: 10, background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.company || !form.role || !form.platform}
            style={{
              flex: 1, padding: 10, background: accent,
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: saving || !form.company || !form.role || !form.platform ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
