'use client'

import { useState } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

type Action = {
  id: number
  type: string
  emoji: string
  title: string
  description: string
  priority: 'high' | 'medium'
  target: number
}

const caylahActions: Action[] = [
  { id: 1, type: 'Apply', emoji: '📨', title: 'Apply to targeted roles', description: 'RevOps or GTM Ops at SaaS companies.', priority: 'high', target: 2 },
  { id: 2, type: 'Outreach', emoji: '🤝', title: 'Send outreach', description: 'Connect with hiring manager before applying.', priority: 'high', target: 1 },
  { id: 3, type: 'Follow Up', emoji: '🔁', title: 'Follow up', description: 'Applications older than 5 days.', priority: 'medium', target: 2 },
  { id: 4, type: 'Proof of Work', emoji: '⚒️', title: 'Create proof-of-work', description: 'Loom audit or process improvement.', priority: 'medium', target: 1 },
]

const kyleActions: Action[] = [
  { id: 1, type: 'Research', emoji: '🔍', title: 'Research company', description: 'Find CSM team and decision makers.', priority: 'high', target: 1 },
  { id: 2, type: 'Apply', emoji: '📨', title: 'Apply to targeted roles', description: 'CSM or Account roles.', priority: 'high', target: 2 },
  { id: 3, type: 'Outreach', emoji: '🤝', title: 'Send outreach', description: 'LinkedIn personalised messages.', priority: 'high', target: 3 },
  { id: 4, type: 'Follow Up', emoji: '🔁', title: 'Follow up', description: 'Conversations older than 4 days.', priority: 'medium', target: 3 },
]

export default function DailyActions({ activeUser }: Props) {
  const actions = activeUser === 'caylah' ? caylahActions : kyleActions
  const isKyle = activeUser === 'kyle'

  const [progress, setProgress] = useState<Record<number, number>>({})

  const increment = (id: number, max: number) => {
    setProgress((prev) => {
      const current = prev[id] || 0
      if (current >= max) return prev
      return { ...prev, [id]: current + 1 }
    })
  }

  const totalTargets = actions.reduce((sum, a) => sum + a.target, 0)
  const totalDone = Object.values(progress).reduce((sum, v) => sum + v, 0)

  return (
    <div>
      <div className="section-title">Today's Mission</div>
      <div className="section-sub">
        {isKyle
          ? 'Revenue & relationships focus'
          : 'Systems, ops & execution focus'}
      </div>

      {/* 🔥 PROGRESS BAR */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          Progress: {totalDone}/{totalTargets}
        </div>
        <div style={{ height: 6, background: '#1e293b', borderRadius: 6 }}>
          <div
            style={{
              width: `${(totalDone / totalTargets) * 100}%`,
              height: 6,
              background: isKyle ? '#6366f1' : '#22c55e',
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      {/* ACTIONS */}
      {actions.map((action) => {
        const done = progress[action.id] || 0
        const complete = done >= action.target

        return (
          <div
            key={action.id}
            className={`action-card ${action.priority === 'medium' ? 'medium' : ''}`}
            style={{ opacity: complete ? 0.6 : 1 }}
          >
            <span className="action-emoji">{action.emoji}</span>

            <div className="action-body">
              <div>
                <span className={`action-tag ${isKyle ? 'kyle' : ''}`}>
                  {action.type}
                </span>
                {action.priority === 'high' && (
                  <span className="priority-dot">● High</span>
                )}
              </div>

              <div className="action-title">
                {action.title} ({done}/{action.target})
              </div>

              <div className="action-desc">{action.description}</div>
            </div>

            <button
              className={`done-btn ${isKyle ? 'kyle' : ''}`}
              onClick={() => increment(action.id, action.target)}
            >
              {complete ? '✔ Done' : '+1'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
