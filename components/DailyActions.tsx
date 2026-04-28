'use client'

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

  return (
    <div>
      <div className="section-title">Today's Mission</div>
      <div className="section-sub">
        {isKyle
          ? 'LegalTech & Marketing Ops targeting — relationships, conversations'
          : 'RevOps & GTM Ops targeting — systems, proof, outreach'}
      </div>

      {actions.map((action) => (
        <div key={action.id} className={`action-card ${action.priority === 'medium' ? 'medium' : ''}`}>
          <span className="action-emoji">{action.emoji}</span>
          <div className="action-body">
            <div>
              <span className={`action-tag ${isKyle ? 'kyle' : ''}`}>{action.type}</span>
              {action.priority === 'high' && <span className="priority-dot">● High priority</span>}
            </div>
            <div className="action-title">{action.title}</div>
            <div className="action-desc">{action.description}</div>
          </div>
          <button className={`done-btn ${isKyle ? 'kyle' : ''}`}>Done</button>
        </div>
      ))}

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
    </div>
  )
}
