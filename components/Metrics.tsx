'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

export default function Metrics({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'

  const stats = [
    { label: 'Applications', value: '0', sub: 'this week', emoji: '📨' },
    { label: 'Response Rate', value: '0%', sub: 'target: >15%', emoji: '📬' },
    { label: 'Interview Rate', value: '0%', sub: 'target: >5%', emoji: '🎙️' },
    { label: 'Outreach Replies', value: '0%', sub: 'target: >20%', emoji: '💬' },
  ]

  return (
    <div>
      <div className="section-title">Pipeline Metrics</div>
      <div className="section-sub">Track what's working. Adapt what isn't.</div>

      <div className="metrics-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="metric-emoji">{stat.emoji}</div>
            <div className={`metric-value ${isKyle ? 'kyle' : ''}`}>{stat.value}</div>
            <div className="metric-label">{stat.label}</div>
            <div className="metric-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 16 }}>Strategy Health</div>
        {[
          { label: 'Response rate', value: 'No data yet' },
          { label: 'Outreach conversion', value: 'No data yet' },
          { label: 'Days since first application', value: 'Not started' },
        ].map((row) => (
          <div key={row.label} className="health-row">
            <span className="health-label">{row.label}</span>
            <span className="health-value">{row.value}</span>
          </div>
        ))}
        <div className="tip-box">
          💡 Metrics will populate as you add jobs and track actions. If response rate drops below 15%, the system will flag a strategy change.
        </div>
      </div>
    </div>
  )
}
