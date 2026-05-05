'use client'

import { useState, useEffect } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }
type SavedAction = { id: string; type: string }

const caylahActions = [
  { id: 'outreach', type: 'Outreach', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find the hiring manager on LinkedIn. Connect before you apply — 5× more effective.', priority: 'high' },
  { id: 'apply', type: 'Apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'Direct career page only. No Easy Apply. RevOps or GTM Ops at Series A–C SaaS.', priority: 'high' },
  { id: 'followup', type: 'Follow Up', emoji: '🔁', title: 'Follow up on 2 stale applications', description: 'No response after 5 days? Send a short, confident nudge.', priority: 'medium' },
]

const kyleActions = [
  { id: 'outreach', type: 'Outreach', emoji: '🤝', title: 'Send 3 outreach messages', description: 'Personalised LinkedIn notes referencing legal or marketing ops context.', priority: 'high' },
  { id: 'apply', type: 'Apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platforms. Direct page only.', priority: 'high' },
  { id: 'research', type: 'Research', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CS team and hiring manager name.', priority: 'high' },
  { id: 'followup', type: 'Follow Up', emoji: '🔁', title: 'Follow up on 3 conversations', description: 'Any outreach or application older than 4 days with no reply.', priority: 'medium' },
]

const caylahTargets = [
  { label: 'Outreach', actionId: 'outreach', value: 1, emoji: '🤝' },
  { label: 'Applications', actionId: 'apply', value: 5, emoji: '📨' },
  { label: 'Follow ups', actionId: 'followup', value: 2, emoji: '🔁' },
]

const kyleTargets = [
  { label: 'Outreach', actionId: 'outreach', value: 3, emoji: '🤝' },
  { label: 'Applications', actionId: 'apply', value: 5, emoji: '📨' },
  { label: 'Follow ups', actionId: 'followup', value: 3, emoji: '🔁' },
]

export default function DailyActions({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'

  const actions = isKyle ? kyleActions : caylahActions
  const targets = isKyle ? kyleTargets : caylahTargets

  const [savedActions, setSavedActions] = useState<SavedAction[]>([])
  const [appliedToday, setAppliedToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await fetch(`/api/actions?user=${activeUser}`)
    const data = await res.json()

    if (data.actions) setSavedActions(data.actions)
    if (typeof data.appliedToday === 'number') setAppliedToday(data.appliedToday)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [activeUser])

  // 🔥 COUNT instead of boolean
  const getCount = (actionId: string) => {
    if (actionId === 'apply') return appliedToday
    return savedActions.filter(a => a.type === actionId).length
  }

  const isDone = (actionId: string) => {
    const target = targets.find(t => t.actionId === actionId)?.value || 1
    return getCount(actionId) >= target
  }

  // 🔥 ALWAYS ADD (no toggle delete)
  const toggle = async (actionId: string) => {
    if (actionId === 'apply') return
    if (saving) return

    setSaving(actionId)

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: activeUser, type: actionId }),
      })

      const saved = await res.json()

      if (saved.id) {
        setSavedActions(prev => [...prev, { id: saved.id, type: saved.type }])
      }
    } catch (e) {
      console.error(e)
    }

    // 🔥 refresh applied count immediately
    await loadData()

    setSaving(null)
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{today}</div>
      </div>

      {/* TARGETS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {targets.map(t => {
          const current = getCount(t.actionId)
          return (
            <div key={t.label} style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>
                {current}/{t.value}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{t.label}</div>
            </div>
          )
        })}
      </div>

      {/* TASKS */}
      {actions.map(action => {
        const count = getCount(action.id)
        const done = isDone(action.id)
        const isSaving = saving === action.id

        return (
          <div
            key={action.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: done ? '#0a150d' : '#0f172a',
              border: `1px solid ${done ? '#166534' : '#1e293b'}`,
              borderLeft: `3px solid ${done ? '#22c55e' : accent}`,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 8,
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            <button
              onClick={() => toggle(action.id)}
              disabled={isSaving || loading || action.id === 'apply'}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `2px solid ${done ? '#22c55e' : '#334155'}`,
                background: done ? '#22c55e' : 'transparent',
                color: 'white',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {isSaving ? '…' : action.id === 'apply' ? count : count > 0 ? count : ''}
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 600 }}>
                {action.title} ({count}/{targets.find(t => t.actionId === action.id)?.value})
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {action.description}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}