'use client'

import { useState } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

const caylahActions = [
  { id: 1, type: 'Apply', emoji: '📨', title: 'Apply to 2 targeted roles', description: 'Direct career page only. No Easy Apply. RevOps or GTM Ops at Series A–C SaaS.', priority: 'high' },
  { id: 2, type: 'Outreach', emoji: '🤝', title: 'Send 1 warm outreach', description: 'Find the hiring manager on LinkedIn. Connect before you apply — 5× more effective.', priority: 'high' },
  { id: 3, type: 'Follow Up', emoji: '🔁', title: 'Follow up on 2 stale applications', description: 'No response after 5 days? Send a short, confident nudge.', priority: 'medium' },
  { id: 4, type: 'Proof of Work', emoji: '⚒️', title: 'Create 1 proof-of-work asset', description: 'Loom audit, process doc, or LinkedIn post as The Operator.', priority: 'medium' },
]

const kyleActions = [
  { id: 1, type: 'Research', emoji: '🔍', title: 'Research 1 target company', description: 'LegalTech or Marketing Ops. Find the CS team and hiring manager name.', priority: 'high' },
  { id: 2, type: 'Apply', emoji: '📨', title: 'Apply to 2 targeted roles', description: 'CSM or Account Manager at LegalTech or Marketing platforms. Direct page only.', priority: 'high' },
  { id: 3, type: 'Outreach', emoji: '🤝', title: 'Send 3 outreach messages', description: 'Personalised LinkedIn notes referencing legal or marketing ops context.', priority: 'high' },
  { id: 4, type: 'Follow Up', emoji: '🔁', title: 'Follow up on 3 conversations', description: 'Any outreach or application older than 4 days with no reply.', priority: 'medium' },
]

const caylahTargets = [
  { label: 'Applications', value: 2, emoji: '📨' },
  { label: 'Outreach', value: 1, emoji: '🤝' },
  { label: 'Proof of work', value: 1, emoji: '⚒️' },
]

const kyleTargets = [
  { label: 'Applications', value: 2, emoji: '📨' },
  { label: 'Outreach', value: 3, emoji: '🤝' },
  { label: 'Follow ups', value: 3, emoji: '🔁' },
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

  const actions = isKyle ? kyleActions : caylahActions
  const targets = isKyle ? kyleTargets : caylahTargets
  const phrases = isKyle ? kylePhrases : caylahPhrases

  const [done, setDone] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setDone(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const completedCount = done.size
  const totalCount = actions.length
  const allDone = completedCount === totalCount
  const progressPct = Math.round((completedCount / totalCount) * 100)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const phrase = phrases[new Date().getDay() % phrases.length]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* CONTRACT BLOCK — compact, everything visible */}
      <div style={{
        background: '#0f172a',
        border: `1px solid ${allDone ? '#166534' : '#1e293b'}`,
        borderTop: `3px solid ${allDone ? '#22c55e' : accent}`,
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 16,
      }}>
        {/* Top row: label + date + progress % */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Today's contract
          </span>
          <span style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {today}
          </span>
        </div>

        {/* Targets row — compact numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${targets.length}, 1fr)`, marginBottom: 14 }}>
          {targets.map((t, i) => (
            <div
              key={t.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingRight: i < targets.length - 1 ? 16 : 0,
                marginRight: i < targets.length - 1 ? 16 : 0,
                borderRight: i < targets.length - 1 ? '1px solid #1e293b' : 'none',
              }}
            >
              <div style={{
                fontSize: 32,
                fontWeight: 800,
                color: allDone ? '#22c55e' : accentLight,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                minWidth: 28,
              }}>
                {t.value}
              </div>
              <div>
                <div style={{ fontSize: 13, color: allDone ? '#4ade80' : 'white', fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#334155', marginTop: 1 }}>{t.emoji}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: 999, height: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: allDone ? '#22c55e' : accent,
              borderRadius: 999,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? '#22c55e' : '#475569', minWidth: 28, textAlign: 'right' }}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* ALL DONE */}
      {allDone && (
        <div style={{
          background: '#0f1f14',
          border: '1px solid #166534',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>Mission accomplished.</div>
            <div style={{ fontSize: 12, color: '#4ade80', opacity: 0.6, fontStyle: 'italic', marginTop: 2 }}>"{phrase}"</div>
          </div>
        </div>
      )}

      {/* TASK CARDS */}
      {actions.map((action) => {
        const isDone = done.has(action.id)
        const isHigh = action.priority === 'high'

        return (
          <div
            key={action.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: isDone ? '#0a150d' : '#0f172a',
              border: `1px solid ${isDone ? '#166534' : '#1e293b'}`,
              borderLeft: `3px solid ${isDone ? '#22c55e' : isHigh ? accent : '#eab308'}`,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 8,
              transition: 'all 0.25s ease',
            }}
          >
            {/* Circle checkbox */}
            <button
              onClick={() => toggle(action.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `2px solid ${isDone ? '#22c55e' : '#334155'}`,
                background: isDone ? '#22c55e' : 'transparent',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {isDone ? '✓' : ''}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 20,
                  background: isDone ? '#14532d' : accentBg,
                  color: isDone ? '#4ade80' : accentLight,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {action.type}
                </span>
                {!isDone && isHigh && (
                  <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>● Priority</span>
                )}
              </div>

              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: isDone ? '#334155' : 'white',
                textDecoration: isDone ? 'line-through' : 'none',
                marginBottom: isDone ? 0 : 2,
              }}>
                {action.emoji} {action.title}
              </div>

              {!isDone && (
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                  {action.description}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* DAILY INSIGHT */}
      {!allDone && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#0d0d14',
          border: '1px solid #1e293b',
          borderRadius: 10,
          fontSize: 11,
          color: '#334155',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          "{phrase}"
        </div>
      )}

    </div>
  )
}
