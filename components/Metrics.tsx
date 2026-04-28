'use client'

type Props = {
  activeUser: 'caylah' | 'kyle'
  compact?: boolean
}

export default function Metrics({ activeUser, compact }: Props) {
  const isKyle = activeUser === 'kyle'

  // TEMP values (later from DB)
  const data = {
    applications: 4,
    responseRate: 10,
    interviewRate: 2,
    outreachReplies: 15,
  }

  const getStatus = (value: number, good: number, ok: number) => {
    if (value >= good) return { label: 'Good', color: '#22c55e' }
    if (value >= ok) return { label: 'Okay', color: '#f59e0b' }
    return { label: 'Low', color: '#ef4444' }
  }

  const stats = [
    {
      label: 'Applications',
      value: data.applications,
      sub: 'this week',
      emoji: '📨',
      status: null,
    },
    {
      label: 'Response Rate',
      value: `${data.responseRate}%`,
      sub: 'target >15%',
      emoji: '📬',
      status: getStatus(data.responseRate, 15, 8),
    },
    {
      label: 'Interview Rate',
      value: `${data.interviewRate}%`,
      sub: 'target >5%',
      emoji: '🎙️',
      status: getStatus(data.interviewRate, 5, 2),
    },
    {
      label: 'Outreach Replies',
      value: `${data.outreachReplies}%`,
      sub: 'target >20%',
      emoji: '💬',
      status: getStatus(data.outreachReplies, 20, 10),
    },
  ]

  return (
    <div>
      {!compact && (
        <>
          <div className="section-title">Pipeline Metrics</div>
          <div className="section-sub">
            Are you getting responses or being ignored?
          </div>
        </>
      )}

      <div className="metrics-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="metric-emoji">{stat.emoji}</div>

            <div className={`metric-value ${isKyle ? 'kyle' : ''}`}>
              {stat.value}
            </div>

            <div className="metric-label">{stat.label}</div>
            <div className="metric-sub">{stat.sub}</div>

            {stat.status && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: stat.status.color,
                }}
              >
                {stat.status.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {!compact && (
        <div className="card">
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              marginBottom: 16,
            }}
          >
            Strategy Health
          </div>

          <div className="health-row">
            <span className="health-label">Response rate</span>
            <span className="health-value">
              {data.responseRate < 10
                ? '⚠️ Improve targeting'
                : 'On track'}
            </span>
          </div>

          <div className="health-row">
            <span className="health-label">Outreach conversion</span>
            <span className="health-value">
              {data.outreachReplies < 15
                ? '⚠️ Improve messaging'
                : 'Working'}
            </span>
          </div>

          <div className="health-row">
            <span className="health-label">Applications sent</span>
            <span className="health-value">
              {data.applications < 5
                ? '⚠️ Increase volume'
                : 'Good'}
            </span>
          </div>

          <div className="tip-box">
            💡 If response rate is low → improve CV or targeting.  
            💡 If outreach is low → improve messaging.  
            💡 If interviews are low → refine positioning.
          </div>
        </div>
      )}
    </div>
  )
}
