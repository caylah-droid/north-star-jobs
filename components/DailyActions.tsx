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
  { label: 'Outreach', actionId: 'outreach', value: 1, emoji: '🤝', isLive: false },
  { label: 'Applications', actionId: 'apply', value: 5, emoji: '📨', isLive: true },
  { label: 'Follow ups', actionId: 'followup', value: 2, emoji: '🔁', isLive: false },
]

const kyleTargets = [
  { label: 'Outreach', actionId: 'outreach', value: 3, emoji: '🤝', isLive: false },
  { label: 'Applications', actionId: 'apply', value: 5, emoji: '📨', isLive: true },
  { label: 'Follow ups', actionId: 'followup', value: 3, emoji: '🔁', isLive: false },
]

const caylahPhrases = [
  'Every system you build is proof. Proof beats polish.',
  'The operator who shows up daily becomes the operator they hire.',
  'One outreach before applying is worth ten applications after.',
  'Your track record is your pitch. Let today add to it.',
]

const kylePhrases = [
  'Relationships are the pipeline. Every message compounds.',
  'Legal clients trust consistency. Show them yours today.',
  'The best CS candidates are already in conversation. Start yours.',
  'Every follow-up is a signal: I care about this. Send it.',
]

export default function DailyActions({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const accentLight = isKyle ? '#a78bfa' : '#60a5fa'

  const actions = isKyle ? kyleActions : caylahActions
  const targets = isKyle ? kyleTargets : caylahTargets
  const phrases = isKyle ? kylePhrases : caylahPhrases

  const [savedActions, setSavedActions] = useState<SavedAction[]>([])
  const [appliedToday, setAppliedToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [activeUser])

  const loadData = async () => {
    setLoading(true)
    const res = await fetch(`/api/actions?user=${activeUser}`)
    const data = await res.json()

    if (data.actions && Array.isArray(data.actions)) {
      setSavedActions(data.actions)
    }

    if (typeof data.appliedToday === 'number') {
      setAppliedToday(data.appliedToday)
    }

    setLoading(false)
  }

  // ✅ COUNT (instead of boolean)
  const getCount = (actionId: string) => {
    if (actionId === 'apply') return appliedToday
    return savedActions.filter(a => a.type === actionId).length
  }

  const isDone = (actionId: string) => {
    const target = targets.find(t => t.actionId === actionId)?.value || 1
    return getCount(actionId) >= target
  }

  const getSavedId = (actionId: string) =>
    savedActions.find(a => a.type === actionId)?.id

  // ✅ FIXED: always add (no delete toggle)
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

    // ✅ refresh metrics immediately
    await loadData()

    setSaving(null)
  }

  // progress logic (unchanged)
  const applyTarget = 5
  const applyDone = appliedToday >= applyTarget
  const nonApplyActions = actions.filter(a => a.id !== 'apply')
  const nonApplyDone = nonApplyActions.filter(a => isDone(a.id)).length
  const completedCount = (applyDone ? 1 : 0) + nonApplyDone
  const totalCount = actions.length
  const allDone = completedCount === totalCount
  const progressPct = loading ? 0 : Math.round((completedCount / totalCount) * 100)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const phrase = phrases[new Date().getDay() % phrases.length]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* CONTRACT BLOCK */}
      <div style={{
        background: '#0f172a',
        border: `1px solid ${allDone ? '#166534' : '#1e293b'}`,
        borderTop: `3px solid ${allDone ? '#22c55e' : accent}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Today's contract
          </span>
          <span style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {today}
          </span>
        </div>

        {/* Targets */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
          {targets.map((t, i) => {
            const isApply = t.actionId === 'apply'
            const current = getCount(t.actionId)
            const done = current >= t.value

            const displayValue = isApply
              ? loading ? '…' : `${current}/${t.value}`
              : done ? '✓' : `${current}/${t.value}`

            return (
              <div key={t.label} style={{ flex: 1 }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: done ? '#22c55e' : accentLight,
                }}>
                  {displayValue}
                </div>
                <div style={{ fontSize: 12, color: done ? '#4ade80' : 'white' }}>
                  {t.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: 999, height: 5 }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: allDone ? '#22c55e' : accent,
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#475569' }}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* TASK CARDS */}
      {actions.map((action) => {
        const done = isDone(action.id)
        const isApply = action.id === 'apply'
        const isSaving = saving === action.id
        const count = getCount(action.id)

        return (
          <div key={action.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: done ? '#0a150d' : '#0f172a',
            border: `1px solid ${done ? '#166534' : '#1e293b'}`,
            borderLeft: `3px solid ${done ? '#22c55e' : accent}`,
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 8,
          }}>
            <button
              onClick={() => toggle(action.id)}
              disabled={isSaving || loading || isApply}
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
              {isSaving ? '…' : isApply ? count : count > 0 ? count : ''}
            </button>

            <div>
              <div style={{ color: 'white', fontWeight: 600 }}>
                {action.title}
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