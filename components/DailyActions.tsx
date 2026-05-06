'use client'

import { useState, useEffect } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

type TodayStats = {
  appliedToday: number
  staleCount: number
  staleJobs: { id: string; company: string; role: string; appliedAt: string | null; createdAt: string }[]
}

const caylahActions = [
  { id: 1, type: 'Apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'Direct career page only. No Easy Apply. RevOps or GTM Ops at Series A-C SaaS.', priority: 'high', target: 5, statKey: 'appliedToday' },
  { id: 2, type: 'Outreach', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find the hiring manager on LinkedIn. Connect before you apply - 5x more effective.', priority: 'high', target: 1, statKey: null },
  { id: 3, type: 'Follow Up', emoji: '🔁', title: 'Follow up on stale applications', description: 'No response after 5 days? Send a short, confident nudge.', priority: 'medium', target: 2, statKey: 'staleCount' },
  { id: 4, type: 'Proof of Work', emoji: '⚒️', title: 'Create 1 proof-of-work asset', description: 'Loom audit, process doc, or LinkedIn post as The Operator.', priority: 'medium', target: 1, statKey: null },
]

const kyleActions = [
  { id: 1, type: 'Research', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CS team and hiring manager name.', priority: 'high', target: 1, statKey: null },
  { id: 2, type: 'Apply', emoji: '📨', title: 'Apply to 5 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platforms. Direct page only.', priority: 'high', target: 5, statKey: 'appliedToday' },
  { id: 3, type: 'Outreach', emoji: '🤝', title: 'Send 3 outreach messages', description: 'Personalised LinkedIn notes referencing legal or marketing ops context.', priority: 'high', target: 3, statKey: null },
  { id: 4, type: 'Follow Up', emoji: '🔁', title: 'Follow up on stale conversations', description: 'Any outreach or application older than 4 days with no reply.', priority: 'medium', target: 3, statKey: 'staleCount' },
]

const caylahTargets = [
  { label: 'Outreach', value: 1, emoji: '🤝', statKey: null },
  { label: 'Applied', value: 5, emoji: '📨', statKey: 'appliedToday' },
  { label: 'Follow ups', value: 2, emoji: '🔁', statKey: 'staleCount' },
]

const kyleTargets = [
  { label: 'Outreach', value: 3, emoji: '🤝', statKey: null },
  { label: 'Applied', value: 5, emoji: '📨', statKey: 'appliedToday' },
  { label: 'Follow ups', value: 3, emoji: '🔁', statKey: 'staleCount' },
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
  const accentBg = isKyle ? '#2e1065' : '#1e3a5f'
  const staleDays = isKyle ? 4 : 5

  const actions = isKyle ? kyleActions : caylahActions
  const targets = isKyle ? kyleTargets : caylahTargets
  const phrases = isKyle ? kylePhrases : caylahPhrases

  const [done, setDone] = useState<Set<number>>(new Set())
  const [followedUp, setFollowedUp] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<TodayStats>({ appliedToday: 0, staleCount: 0, staleJobs: [] })

  useEffect(() => {
    setDone(new Set())
    setFollowedUp(new Set())

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/jobs?user=' + activeUser)
        const jobs = await res.json()

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const staleThreshold = new Date()
        staleThreshold.setDate(staleThreshold.getDate() - staleDays)

        const appliedToday = jobs.filter((j: any) =>
          j.stage === 'applied' && j.appliedAt && new Date(j.appliedAt) >= todayStart
        ).length

        const staleJobs = jobs.filter((j: any) =>
          j.stage === 'applied' &&
          new Date(j.appliedAt || j.createdAt) <= staleThreshold
        )

        setStats({ appliedToday, staleCount: staleJobs.length, staleJobs })

        if (appliedToday >= 5) {
          setDone(prev => { const n = new Set(prev); n.add(isKyle ? 2 : 1); return n })
        }
      } catch {}
    }

    fetchStats()
  }, [activeUser])

  const toggle = (id: number) => {
    setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const markFollowedUp = (jobId: string) => {
    setFollowedUp(prev => { const n = new Set(prev); n.add(jobId); return n })
  }

  const getStatValue = (statKey: string | null): number => {
    if (!statKey) return 0
    return stats[statKey as keyof TodayStats] as number || 0
  }

  const isAutoComplete = (action: typeof caylahActions[0]): boolean => {
    if (!action.statKey) return false
    return getStatValue(action.statKey) >= action.target
  }

  const completedCount = actions.filter(a => done.has(a.id) || isAutoComplete(a)).length
  const totalCount = actions.length
  const allDone = completedCount === totalCount
  const progressPct = Math.round((completedCount / totalCount) * 100)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const phrase = phrases[new Date().getDay() % phrases.length]

  const pendingFollowUps = stats.staleJobs.filter(j => !followedUp.has(j.id))
  const daysStale = (job: { appliedAt: string | null; createdAt: string }) => {
    const ref = job.appliedAt || job.createdAt
    const diff = Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      <div style={{ background: '#0f172a', border: '1px solid ' + (allDone ? '#166534' : '#1e293b'), borderTop: '3px solid ' + (allDone ? '#22c55e' : accent), borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's contract</span>
          <span style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{today}</span>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
          {targets.map((t, i) => {
            const actual = t.statKey ? getStatValue(t.statKey) : null
            const hit = actual !== null && actual >= t.value
            return (
              <div key={t.label} style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', gap: 6, paddingRight: i < targets.length - 1 ? 12 : 0, marginRight: i < targets.length - 1 ? 12 : 0, borderRight: i < targets.length - 1 ? '1px solid #1e293b' : 'none', minWidth: 0 }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: hit ? '#22c55e' : accentLight, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {actual !== null ? actual : t.value}
                  </div>
                  {actual !== null && <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>/ {t.value}</div>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: hit ? '#4ade80' : 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#334155', marginTop: 1 }}>{t.emoji}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: 999, height: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: allDone ? '#22c55e' : accent, borderRadius: 999, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? '#22c55e' : '#475569', minWidth: 30, textAlign: 'right' }}>{progressPct}%</span>
        </div>
      </div>

      {allDone && (
        <div style={{ background: '#0f1f14', border: '1px solid #166534', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🏆</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>Mission accomplished.</div>
            <div style={{ fontSize: 11, color: '#4ade80', opacity: 0.6, fontStyle: 'italic', marginTop: 2 }}>"{phrase}"</div>
          </div>
        </div>
      )}

      {actions.map(action => {
        const autoComplete = isAutoComplete(action)
        const isDone = done.has(action.id) || autoComplete
        const isHigh = action.priority === 'high'
        const statVal = action.statKey ? getStatValue(action.statKey) : null

        return (
          <div key={action.id} onClick={() => toggle(action.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: isDone ? '#0a150d' : '#0f172a', border: '1px solid ' + (isDone ? '#166534' : '#1e293b'), borderLeft: '3px solid ' + (isDone ? '#22c55e' : isHigh ? accent : '#eab308'), borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid ' + (isDone ? '#22c55e' : '#334155'), background: isDone ? '#22c55e' : 'transparent', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginTop: 1 }}>
              {isDone ? '✓' : ''}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: isDone ? '#14532d' : accentBg, color: isDone ? '#4ade80' : accentLight, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{action.type}</span>
                {!isDone && isHigh && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>● Priority</span>}
                {statVal !== null && !autoComplete && <span style={{ fontSize: 10, color: '#64748b' }}>{statVal}/{action.target}</span>}
                {autoComplete && <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600 }}>✓ Target hit</span>}
                {action.statKey === 'staleCount' && stats.staleCount > 0 && !isDone && (
                  <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 500 }}>({stats.staleCount} waiting)</span>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? '#334155' : 'white', textDecoration: isDone ? 'line-through' : 'none', marginBottom: isDone ? 0 : 2 }}>
                {action.emoji} {action.title}
              </div>
              {!isDone && <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{action.description}</div>}
            </div>
          </div>
        )
      })}

      {pendingFollowUps.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⏰ Follow Up Queue
            <span style={{ fontSize: 10, background: '#2a1a00', color: '#f59e0b', padding: '1px 8px', borderRadius: 20 }}>{pendingFollowUps.length} waiting</span>
          </div>
          {pendingFollowUps.map(job => (
            <div key={job.id} style={{ background: '#0f172a', border: '1px solid #2a1a00', borderLeft: '3px solid #f59e0b', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{job.company}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</div>
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 3 }}>{daysStale(job)} days since application</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); markFollowedUp(job.id) }}
                style={{ fontSize: 11, padding: '5px 12px', background: '#14532d', color: '#4ade80', border: '1px solid #166534', borderRadius: 6, cursor: 'pointer', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                Done ✓
              </button>
            </div>
          ))}
        </div>
      )}

      {!allDone && (
        <div style={{ marginTop: 16, padding: '12px 14px', background: '#0d0d14', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11, color: '#334155', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{phrase}"
        </div>
      )}
    </div>
  )
}
