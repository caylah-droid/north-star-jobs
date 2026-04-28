'use client'

import { useState } from 'react'

type Props = {
  activeUser: 'caylah' | 'kyle'
  onClose: () => void
  onSaved: () => void
}

export default function AddCompanyModal({ activeUser, onClose, onSaved }: Props) {
  const isKyle = activeUser === 'kyle'

  const [name, setName] = useState('')
  const [track, setTrack] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name) return

    setSaving(true)

    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        track,
        user: activeUser,
      }),
    })

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 18 }}>Add Company</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* NAME */}
        <input
          placeholder="Company name (e.g. Stripe)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        {/* TRACK */}
        <input
          placeholder="Track (optional)"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          style={input}
        />

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={secondary}>
            Cancel
          </button>

          <button onClick={handleSubmit} style={primary(isKyle)}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* STYLES */
const overlay = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
}

const modal = {
  background: '#0f172a',
  padding: 24,
  borderRadius: 12,
  width: '100%',
  maxWidth: 400,
}

const input = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: 12,
  background: '#1e293b',
  color: 'white',
  border: '1px solid #334155',
  borderRadius: 8,
  outline: 'none',
}

const secondary = {
  flex: 1,
  padding: '10px',
  background: '#1e293b',
  color: '#94a3b8',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
}

const primary = (isKyle: boolean) => ({
  flex: 1,
  padding: '10px',
  background: isKyle ? '#22c55e' : '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
})

const closeBtn = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontSize: 18,
  cursor: 'pointer',
}
