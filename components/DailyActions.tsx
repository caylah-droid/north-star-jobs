'use client'

import { useState } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

const caylahActions = [
  { id: 1, type: 'Apply', emoji: '📨', title: 'Apply to 2 targeted roles', description: 'RevOps or GTM Ops at Series A–C SaaS. Direct career page only.', priority: 'high' },
  { id: 2, type: 'Outreach', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find hiring manager or ops leader on LinkedIn. Connect before applying.', priority: 'high' },
  { id: 3, type: 'Follow Up', emoji: '🔁', title: 'Follow up on 2 applications', description: 'Any application older than 5 days with no response.', priority: 'medium' },
  { id: 4, type: 'Proof of Work', emoji: '⚒️', title: 'Create 1 proof-of-work asset', description: 'Loom audit, process doc, or LinkedIn post as The Operator.', priority: 'medium' },
]

const kyleActions = [
  { id: 1, type: 'Research', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CSM team and hiring manager.', priority: 'high' },
  { id: 2, type: 'Apply', emoji: '📨', title: 'Apply to 2 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platform.', priority: 'high' },
  { id: 3, type: 'Outreach', emoji: '🤝', title: 'Send 3 outreach messages', description: 'LinkedIn connections with personalised notes referencing legal or marketing ops.', priority: 'high' },
  { id: 4, type: 'Follow Up', emoji: '🔁', title: 'Follow up on 3 conversations', description: 'Any outreach or application older than 4 days with no response.', priority: 'medium' },
]

export default function DailyActions({ activeUser }: Props) {
  const actions = activeUser === 'caylah' ? caylahActions : kyleActions
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const accentLight = isKyle ? '#a78bfa' : '#60a5fa'

  const [done, setDone] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = done.size
  const totalCount = actions.length
  const allDone = completedCount === totalCount
  const progressPct = Math.round((completedCount / totalCount) * 100)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Today's Mission</div>
        <div className="section-sub">
          {today} · {isKyle
            ? 'LegalTech & Marketing Ops — relationships, conversations'
            : 'RevOps & GTM Ops — systems, proof, outreach'}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            {allDone ? '🎯 Mission complete' : `${completedCount} of ${totalCount} tasks done`}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? '#4ade80' : accentLight }}>
            {progressPct}%
          </span>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: allDone ? '#22c55e' : accent,
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* All done state */}
      {allDone && (
        <div style={{
          background: '#0f1f14',
          border: '1px solid #166534',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>
            Mission accomplished.
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {isKyle
              ? 'Every conversation you start today compounds. Rest, then repeat tomorrow.'
              : 'Every system you build tells the story. Rest, then repeat tomorrow.'}
          </div>
        </div>
      )}

      {/* Action cards */}
      {actions.map((action) => {
        const isDone = done.has(action.id)
        return (
          <div
            key={action.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              background: isDone ? '#0a1a0f' : '#0f172a',
              border: `1px solid ${isDone ? '#166534' : '#1e293b'}`,
              borderLeft: `4px solid ${isDone ? '#22c55e' : action.priority === 'medium' ? '#eab308' : '#ef4444'}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              transition: 'all 0.2s ease',
              opacity: isDone ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{isDone ? '✅' : action.emoji}</span>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: isKyle ? '#2e1065' : '#1e3a5f',
                  color: isKyle ? '#a78bfa' : '#60a5fa',
                  marginRight: 8,
                }}>
                  {action.type}
                </span>
                {action.priority === 'high' && !isDone && (
                  <span style={{ color: '#f87171', fontSize: 12 }}>● High priority</span>
                )}
                {isDone && (
                  <span style={{ color: '#4ade80', fontSize: 12 }}>● Done</span>
                )}
              </div>

              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: isDone ? '#475569' : 'white',
                marginBottom: 4,
                textDecoration: isDone ? 'line-through' : 'none',
              }}>
                {action.title}
              </div>

              <div style={{ fontSize: 13, color: '#64748b' }}>
                {action.description}
              </div>
            </div>

            <button
              onClick={() => toggle(action.id)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: isDone ? '1px solid #166534' : 'none',
                cursor: 'pointer',
                background: isDone ? 'transparent' : accent,
                color: isDone ? '#4ade80' : 'white',
                transition: 'all 0.2s',
              }}
            >
              {isDone ? 'Undo' : 'Done'}
            </button>
          </div>
        )
      })}

      {/* Targets */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>Today's targets</div>
        <div className="targets-grid">
          {isKyle ? (
            <>
              <div className="target-item"><div className="target-number kyle">2</div><div className="target-label">Applications</div></div>
              <div className="target-item"><div className="target-number kyle">3</div><div className="target-label">Outreach</div></div>
              <div className="target-item"><div className="target-number kyle">3</div><div className="target-label">Follow ups</div></div>
            </>
          ) : (
            <>
              <div className="target-item"><div className="target-number">2</div><div className="target-label">Applications</div></div>
              <div className="target-item"><div className="target-number">1</div><div className="target-label">Outreach</div></div>
              <div className="target-item"><div className="target-number">1</div><div className="target-label">Proof of work</div></div>
            </>
          )}
        </div>
      </div>

      {/* Strategy tip */}
      <div className="tip-box" style={{ marginTop: 16 }}>
        💡 <strong>Outreach before applying</strong> = 5× higher hire rate. Direct career pages convert 7× better than Easy Apply. Speed matters — apply within 48h of posting.
      </div>
    </div>
  )
}
