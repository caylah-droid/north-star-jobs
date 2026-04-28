'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

const stages = [
  { id: 'prospect', label: '🔭 Prospect' },
  { id: 'applied', label: '📨 Applied' },
  { id: 'interview', label: '🎙️ Interview' },
  { id: 'offer', label: '🎉 Offer' },
  { id: 'rejected', label: '❌ Rejected' },
]

export default function JobBoard({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'

  return (
    <div>
      <div className="flex-between">
        <div>
          <div className="section-title">Opportunities</div>
          <div className="section-sub">
            {isKyle
              ? 'LegalTech CSM · Marketing Ops · Account Management'
              : 'RevOps · GTM Ops · Business Operations'}
          </div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>+ Add Job</button>
      </div>

      <div className="section-label" style={{ marginBottom: 12 }}>
        <h3>⭐ Highest Probability</h3>
        <span className="count-badge">Top 5</span>
      </div>

      <div className="top5-empty">
        <p>No jobs added yet.</p>
        <span>Add your first opportunity to see it ranked here.</span>
      </div>

      <div className="section-label">
        <h3>All Opportunities</h3>
      </div>

      <div className="kanban-grid">
        {stages.map((stage) => (
          <div key={stage.id} className="kanban-col">
            <div className="kanban-header">{stage.label}</div>
            <div className="kanban-empty">Empty</div>
          </div>
        ))}
      </div>
    </div>
  )
}
