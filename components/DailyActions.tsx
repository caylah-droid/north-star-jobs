'use client'

import { useState, useEffect } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

type StaleJob = { id: string; company: string; role: string; appliedAt: string | null; createdAt: string }

type TodayStats = {
  appliedToday: number
  staleCount: number
  staleJobs: StaleJob[]
}

const ACTIONS_CAYLAH = [
  { id: 1, type: 'APPLY', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'Direct career page only. No Easy Apply. RevOps or GTM Ops at Series A-C SaaS.', priority: true, target: 5, statKey: 'appliedToday' as const },
  { id: 2, type: 'OUTREACH', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find the hiring manager on LinkedIn. Connect before you apply.', priority: true, target: 1, statKey: null },
  { id: 3, type: 'FOLLOW UP', emoji: '🔁', title: 'Follow up on stale applications', description: 'No response after 5 days? Send a short confident nudge.', priority: false, target: 2, statKey: null },
  { id: 4, type: 'PROOF', emoji: '⚒️', title: 'Create 1 proof-of-work asset', description: 'Loom audit, process doc, or LinkedIn post as The Operator.', priority: false, target: 1, statKey: null },
]

const ACTIONS_KYLE = [
  { id: 1, type: 'RESEARCH', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CS team and hiring manager name.', priority: true, target: 1, statKey: null },
  { id: 2, type: 'APPLY', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platforms.', priority: true, target: 5, statKey: 'appliedToday' as const },
  { id: 3, type: 'OUTREACH', emoji: '🤝', title: 'Send 3 outreach messages', description: 'Personalised LinkedIn notes referencing legal or marketing ops context.', priority: true, target: 3, statKey: null },
  { id: 4, type: 'FOLLOW UP', emoji: '🔁', title: 'Follow up on stale conversations', description: 'Any outreach or application older than 4 days with no reply.', priority: false, target: 3, statKey: null },
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

  const [done, setDone] = useState<Set<number>>(new Set())
  const [followedUp, setFollowedUp] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<TodayStats>({ appliedToday: 0, staleCount: 0, staleJobs: [] })
  const [queueOpen, setQueueOpen] = useState(true)

  useEffect(() => {
    setDone(new Set())
    setFollowedUp(new Set())
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/jobs?user=' + activeUser)
        const jobs = await res.json()
        const todayStart = new Date(); todayStart.setHours(0,0,0,0)
        const threshold = new Date(); threshold.setDate(threshold.getDate() - staleDays)
        const appliedToday = jobs.filter((j: any) => j.stage === 'applied' && j.appliedAt && new Date(j.appliedAt) >= todayStart).length
        const staleJobs = jobs.filter((j: any) => j.stage === 'applied' && new Date(j.appliedAt || j.createdAt) <= threshold)
        setStats({ appliedToday, staleCount: staleJobs.length, staleJobs })
        if (appliedToday >= 5) setDone(prev => { const n = new Set(prev); n.add(isKyle ? 2 : 1); return n })
      } catch {}
    }
    fetch_()
  }, [activeUser])

  const toggle = (id: number) => setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const markDone = (jobId: string) => setFollowedUp(prev => { const n = new Set(prev); n.add(jobId); return n })

  const isDone = (action: typeof actions[0]) => {
    if (action.statKey === 'appliedToday') return stats.appliedToday >= action.target
    return done.has(action.id)
  }

  const completedCount = actions.filter(a => isDone(a)).length
  const progressPct = Math.round((completedCount / actions.length) * 100)
  const allDone = completedCount === actions.length
  const phrase = phrases[new Date().getDay() % phrases.length]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const pendingFollowUps = stats.staleJobs.filter(j => !followedUp.has(j.id))
  const daysStale = (j: StaleJob) => Math.floor((Date.now() - new Date(j.appliedAt || j.createdAt).getTime()) / 86400000)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* CONTRACT BLOCK */}
      <div style={{ background: '#0f172a', border: '1px solid ' + (allDone ? '#166534' : '#1e293b'), borderTop: '3px solid ' + (allDone ? '#22c55e' : accent), borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's contract</span>
          <span style={{ fontSize: 10, color: '#334155' }}>{today}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: allDone ? '#22c55e' : accent, borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? '#22c55e' : '#64748b', minWidth: 36, textAlign: 'right' }}>{completedCount}/{actions.length}</span>
        </div>
        {allDone && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80', fontStyle: 'italic' }}>🏆 Mission accomplished. "{phrase}"</div>
        )}
      </div>

      {/* ACTION ROWS - compact */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
        {actions.map((action, i) => {
          const done_ = isDone(action)
          const isApply = action.statKey === 'appliedToday'
          return (
            <div
              key={action.id}
              onClick={() => !isApply && toggle(action.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < actions.length - 1 ? '1px solid #1e293b' : 'none', background: done_ ? '#0a150d' : 'transparent', cursor: isApply ? 'default' : 'pointer', transition: 'background 0.2s' }}
            >
              {/* Tick */}
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (done_ ? '#22c55e' : '#334155'), background: done_ ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: 'white', fontWeight: 700 }}>
                {done_ ? '✓' : ''}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: done_ ? '#334155' : 'white', textDecoration: done_ ? 'line-through' : 'none' }}>
                    {action.emoji} {action.title}
                  </span>
                  {isApply && !done_ && (
                    <span style={{ fontSize: 10, color: '#64748b' }}>{stats.appliedToday}/5</span>
                  )}
                  {action.id === 3 && stats.staleCount > 0 && !done_ && (
                    <span style={{ fontSize: 10, color: '#f59e0b' }}>({stats.staleCount} waiting)</span>
                  )}
                </div>
                {!done_ && (
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{action.description}</div>
                )}
              </div>

              {/* Type badge */}
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: done_ ? '#14532d' : (action.priority ? accent + '33' : '#1e293b'), color: done_ ? '#4ade80' : (action.priority ? accentLight : '#64748b'), flexShrink: 0, whiteSpace: 'nowrap' }}>
                {action.type}
              </span>
            </div>
          )
        })}
      </div>

      {/* FOLLOW UP QUEUE */}
      {stats.staleJobs.length > 0 && (
        <div style={{ background: '#0f172a', border: '1px solid #2a1a00', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <button
            onClick={() => setQueueOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>⏰ Follow Up Queue</span>
              <span style={{ fontSize: 10, background: pendingFollowUps.length > 0 ? '#2a1a00' : '#14532d', color: pendingFollowUps.length > 0 ? '#f59e0b' : '#4ade80', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>
                {pendingFollowUps.length > 0 ? pendingFollowUps.length + ' waiting' : 'All done'}
              </span>
            </div>
            <span style={{ color: '#475569', fontSize: 12 }}>{queueOpen ? '▲' : '▼'}</span>
          </button>

          {queueOpen && pendingFollowUps.map((job, i) => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderTop: '1px solid #1e293b', background: '#080c12' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{job.company}</div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>{daysStale(job)} days waiting</div>
              </div>
              <button
                onClick={() => markDone(job.id)}
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

      {/* QUOTE */}
      {!allDone && (
        <div style={{ padding: '10px 14px', background: '#0d0d14', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11, color: '#334155', fontStyle: 'italic' }}>
          "{phrase}"
        </div>
      )}
    </div>
  )
}
