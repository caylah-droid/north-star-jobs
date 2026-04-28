'use client'

import { useState } from 'react'

type Props = {
activeUser: 'caylah' | 'kyle'
onClose: () => void
onSaved: () => void
}

export default function AddJobModal({ activeUser, onClose, onSaved }: Props) {
const isKyle = activeUser === 'kyle'

const [form, setForm] = useState({
company: '',
role: '',
url: '',
salary: '',
})

const [saving, setSaving] = useState(false)

const handleSubmit = async () => {
if (!form.company || !form.role) return

```
setSaving(true)

await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...form,
    user: activeUser,
  }),
})

setSaving(false)
onSaved()
onClose()
```

}

return (
<div style={{
position: 'fixed',
inset: 0,
background: 'rgba(0,0,0,0.6)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
zIndex: 50,
padding: 16,
}}>
<div style={{
background: '#0f172a',
border: '1px solid #1e293b',
borderRadius: 16,
padding: 24,
width: '100%',
maxWidth: 420,
}}>
{/* HEADER */}
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
<h2 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
Add Opportunity </h2>
<button onClick={onClose} style={{
background: 'none',
border: 'none',
color: '#64748b',
fontSize: 20,
cursor: 'pointer'
}}>
✕ </button> </div>

```
    {/* COMPANY */}
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#94a3b8' }}>Company *</label>
      <input
        placeholder="e.g. Stripe"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
        style={inputStyle}
      />
    </div>

    {/* ROLE */}
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#94a3b8' }}>Role *</label>
      <input
        placeholder="e.g. RevOps Manager"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        style={inputStyle}
      />
    </div>

    {/* URL */}
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#94a3b8' }}>Job URL</label>
      <input
        placeholder="https://..."
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        style={inputStyle}
      />
    </div>

    {/* SALARY */}
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, color: '#94a3b8' }}>Salary (optional)</label>
      <input
        placeholder="e.g. 120000"
        value={form.salary}
        onChange={(e) => setForm({ ...form, salary: e.target.value })}
        style={inputStyle}
      />
    </div>

    {/* ACTIONS */}
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={onClose}
        style={{
          flex: 1,
          padding: '10px',
          background: '#1e293b',
          color: '#94a3b8',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          flex: 1,
          padding: '10px',
          background: isKyle ? '#22c55e' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>
</div>
```

)
}

const inputStyle = {
width: '100%',
padding: '8px 12px',
marginTop: 4,
background: '#1e293b',
border: '1px solid #334155',
borderRadius: 8,
color: 'white',
fontSize: 14,
outline: 'none',
}
