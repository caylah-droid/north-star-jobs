'use client'

import { useState, useEffect } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }
type StaleJob = { id: string; company: string; role: string; appliedAt: string | null; createdAt: string; followedUpAt: string | null }

const ACTIONS_CAYLAH = [
  { id: 1, type: 'outreach', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find the hiring manager on LinkedIn. Connect before you apply.', priority: true, statKey: null },
  { id: 2, type: 'apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'Direct career page only. No Easy Apply. RevOps or GTM Ops at Series A-C SaaS.', priority: true, statKey: 'appliedToday' as const },
  { id: 3, type: 'followup', emoji: '🔁', title: 'Follow up on stale applications', description: 'No response after 5 days? Send a short confident nudge.', priority: false, statKey: null },
  { id: 4, type: 'proof', emoji: '⚒️', title: 'Create 1 proof-of-work asset', description: 'Loom audit, process doc, or LinkedIn post as The Operator.', priority: false, statKey: null },
]

const ACTIONS_KYLE = [
  { id: 1, type: 'research', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CS team and hiring manager name.', priority: true, statKey: null },
  { id: 2, type: 'apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platforms.', priority: true, statKey: 'appliedToday' as const },
  { id: 3, type: 'outreach', emoji: '🤝', title: 'Send 3 outreach messages', description: 'Personalised LinkedIn notes referencing legal or marketing ops context.', priority: true, statKey: null },
  { id: 4, type: 'followup', emoji: '🔁', title: 'Follow up on stale conversations', description: 'Any outreach or application older than 4 days with no reply.', priority: false, statKey: null },
]

const PHRASES_CAYLAH = [
  'Every system you build is proof. Proof beats polish.',
  'The operator who shows up daily becomes the operator they hire.',
  'One outreach before applying is worth ten applications after.',
  'Your track record is your pitch. Let today add to it.',
]

const PHRASES_KYLE = [
  'Relationships are the pipeline. Every message compounds.',
  'Legal clients trust consistency. Show them yours today.',
  'The best CS candidates are already in conversation. Start yours.',
  'Every follow-up is a signal: I care about this. Send it.',
]

export default function DailyActions({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const accentLight = isKyle ? '#a78bfa' : '#60a5fa'
  const staleDays = isKyle ? 4 : 5

  const actions = isKyle ? ACTIONS_KYLE : ACTIONS_CAYLAH
  const phrases = isKyle ? PHRASES_KYLE : PHRASES_CAYLAH

  const [done, setDone] = useState<Set<string>>(new Set())
  const [followedUp, setFollowedUp] = useState<Set<string>>(new Set())
  const [appliedToday, setAppliedToday] = useState(0)
  const [staleJobs, setStaleJobs] = useState<StaleJob[]>([])
  const [queueOpen, setQueueOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [outreachToday, setOutreachToday] = useState(0)

  useEffect(() => {
    setDone(new Set())
    setFollowedUp(new Set())
    loadAll()
  }, [activeUser])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [jobsRes, actionsRes] = await Promise.all([
        fetch('/api/jobs?user=' + activeUser),
        fetch('/api/actions?user=' + activeUser),
      ])
      const jobs = await jobsRes.json()
      const todayActions = await actionsRes.json()

      // Restore ticked actions from DB
      const completedTypes = new Set(todayActions.map((a: any) => a.type))
      const restoredDone = new Set<string>()
      actions.forEach(a => {
        if (completedTypes.has(a.type)) restoredDone.add(a.type)
      })
      setDone(restoredDone)

      // Restore followed up jobs from DB
      const followedUpJobIds = new Set<string>(
        todayActions.filter((a: any) => a.type === 'followup' && a.jobId).map((a: any) => a.jobId)
      )
      setFollowedUp(followedUpJobIds)

      // Applied today count
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      const applied = jobs.filter((j: any) => j.stage === 'applied' && j.appliedAt && new Date(j.appliedAt) >= todayStart).length
      setAppliedToday(applied)
      if (applied >= 5) restoredDone.add('apply')
      setDone(new Set(restoredDone))

      // Stale jobs
      const threshold = new Date(); threshold.setDate(threshold.getDate() - staleDays)
      const stale = jobs.filter((j: any) => j.stage === 'applied' && new Date(j.appliedAt || j.createdAt) <= threshold)
      setStaleJobs(stale)
    } catch {}
    setLoading(false)
  }

  const toggle = async (type: string) => {
    const next = new Set(done)
    if (next.has(type)) {
      next.delete(type)
      if (type === 'outreach') setOutreachToday(prev => Math.max(0, prev - 1))
    } else {
      next.add(type)
      // Save to DB
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: activeUser, type }),
      })
      if (type === 'outreach') setOutreachToday(prev => prev + 1)
    }
    setDone(next)
  }

  const markFollowedUp = async (job: StaleJob) => {
    const next = new Set(followedUp)
    next.add(job.id)
    setFollowedUp(next)
    // Save to DB - stamps followedUpAt on job too
    await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: activeUser, type: 'followup', jobId: job.id, notes: 'Followed up with ' + job.company }),
    })
  }

  const pendingFollowUps = staleJobs.filter(j => !followedUp.has(j.id))

  const isDone = (action: typeof actions[0]) => {
    if (action.statKey === 'appliedToday') return appliedToday >= 5
    if (action.type === 'followup' && staleJobs.length > 0) return pendingFollowUps.length === 0
    return done.has(action.type)
  }

  const completedCount = actions.filter(a => isDone(a)).length
  const progressPct = Math.round((completedCount / actions.length) * 100)
  const allDone = completedCount === actions.length
  const phrase = phrases[new Date().getDay() % phrases.length]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const daysStale = (j: StaleJob) => Math.floor((Date.now() - new Date(j.appliedAt || j.createdAt).getTime()) / 86400000)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* CONTRACT BLOCK */}
      <div style={{ background: '#0f172a', border: '1px solid ' + (allDone ? '#166534' : '#1e293b'), borderTop: '3px solid ' + (allDone ? '#22c55e' : accent), borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's contract</span>
          <span style={{ fontSize: 10, color: '#334155' }}>{today}</span>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
          {[
            { label: 'Outreach', target: isKyle ? 3 : 1, value: outreachToday, emoji: '🤝' },
            { label: 'Applied', target: 5, value: appliedToday, emoji: '📨' },
            { label: 'Follow ups', target: staleJobs.length, value: staleJobs.length - pendingFollowUps.length, emoji: '🔁' },
          ].map((t, i, arr) => {
            const hit = t.value !== null && t.target > 0 && t.value >= t.target
            const displayVal = t.value !== null ? t.value : t.target
            return (
              <div key={t.label} style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', gap: 6, paddingRight: i < arr.length - 1 ? 12 : 0, marginRight: i < arr.length - 1 ? 12 : 0, borderRight: i < arr.length - 1 ? '1px solid #1e293b' : 'none' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: hit ? '#22c55e' : accentLight, lineHeight: 1 }}>{displayVal}</div>
                  {t.value !== null && <div style={{ fontSize: 9, color: '#475569' }}>/ {t.target}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: hit ? '#4ade80' : 'white', fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{t.emoji}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: 999, height: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: allDone ? '#22c55e' : accent, borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? '#22c55e' : '#64748b', minWidth: 36, textAlign: 'right' }}>{progressPct}%</span>
        </div>
        {allDone && <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80', fontStyle: 'italic' }}>🏆 Mission accomplished. "{phrase}"</div>}
      </div>

      {/* ACTION ROWS */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
        {actions.map((action, i) => {
          const done_ = isDone(action)
          const isApply = action.statKey === 'appliedToday'
          return (
            <div
              key={action.id}
              onClick={() => !isApply && toggle(action.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < actions.length - 1 ? '1px solid #1e293b' : 'none', background: done_ ? '#0a150d' : 'transparent', cursor: isApply ? 'default' : 'pointer', transition: 'background 0.2s' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (done_ ? '#22c55e' : '#334155'), background: done_ ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: 'white', fontWeight: 700, transition: 'all 0.2s' }}>
                {done_ ? '✓' : ''}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: done_ ? '#334155' : 'white', textDecoration: done_ ? 'line-through' : 'none' }}>
                    {action.emoji} {action.title}
                  </span>
                  {isApply && <span style={{ fontSize: 10, color: appliedToday >= 5 ? '#4ade80' : '#64748b' }}>{appliedToday}/5</span>}
                  {action.type === 'followup' && staleJobs.length > 0 && !done_ && (
                    <span style={{ fontSize: 10, color: pendingFollowUps.length === 0 ? '#4ade80' : '#f59e0b' }}>
                      {staleJobs.length - pendingFollowUps.length}/{staleJobs.length}
                    </span>
                  )}
                </div>
                {!done_ && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{action.description}</div>}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: done_ ? '#14532d' : (action.priority ? accent + '33' : '#1e293b'), color: done_ ? '#4ade80' : (action.priority ? accentLight : '#64748b'), flexShrink: 0, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                {action.type}
              </span>
            </div>
          )
        })}
      </div>

      {/* FOLLOW UP QUEUE */}
      {staleJobs.length > 0 && (
        <div style={{ background: '#0f172a', border: '1px solid ' + (pendingFollowUps.length > 0 ? '#2a1a00' : '#166534'), borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <button onClick={() => setQueueOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: pendingFollowUps.length > 0 ? '#f59e0b' : '#4ade80' }}>
                {pendingFollowUps.length > 0 ? '🔔 Follow Up Queue' : '✓ All followed up today'}
              </span>
              {pendingFollowUps.length > 0 && (
                <span style={{ fontSize: 10, background: '#2a1a00', color: '#f59e0b', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>{pendingFollowUps.length} waiting</span>
              )}
            </div>
            <span style={{ color: '#475569', fontSize: 12 }}>{queueOpen ? '▲' : '▼'}</span>
          </button>

          {queueOpen && pendingFollowUps.map(job => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderTop: '1px solid #1e293b', background: '#080c12' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{job.company}</div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>{daysStale(job)} days since application</div>
              </div>
              <button
                onClick={() => markFollowedUp(job)}
                style={{ fontSize: 11, padding: '4px 12px', background: '#14532d', color: '#4ade80', border: '1px solid #166534', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
              >
                Done ✓
              </button>
            </div>
          ))}

          {queueOpen && pendingFollowUps.length === 0 && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #1e293b', fontSize: 12, color: '#4ade80', textAlign: 'center' }}>All followed up today</div>
          )}
        </div>
      )}

      {!allDone && !loading && (
        <div style={{ padding: '10px 14px', background: '#0d0d14', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11, color: '#334155', fontStyle: 'italic' }}>
          "{phrase}"
        </div>
      )}
    </div>
  )
}
