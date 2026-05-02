'use client'

import { useState, useEffect } from 'react'

type MetricsData = {
  appliedThisWeek: number
  totalApplied: number
  responseRate: number
  interviewRate: number
  totalOffers: number
  staleJobs: number
  daysActive: number | null
  pipeline: {
    prospect: number
    applied: number
    interview: number
    offer: number
    rejected: number
  }
  flags: string[]
}

type Props = { activeUser: 'caylah' | 'kyle' }

export default function Metrics({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/metrics?user=${activeUser}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeUser])

  const accentColor = isKyle ? '#a78bfa' : '#60a5fa'
  const badgeColor = isKyle ? '#7c3aed' : '#2563eb'

  const responseColor = (rate: number) => {
    if (rate === 0) return '#64748b'
    if (rate < 15) return '#f87171'
    if (rate < 25) return '#fbbf24'
    return '#4ade80'
  }

  const interviewColor = (rate: number) => {
    if (rate === 0) return '#64748b'
    if (rate < 5) return '#fbbf24'
    return '#4ade80'
  }

  if (loading) {
    return (
      <div>
        <div className="section-title">Pipeline Metrics</div>
        <div className="section-sub">Loading live data...</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 12, padding: 20, minHeight: 100,
              animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <div className="section-title">Pipeline Metrics</div>
        <div className="section-sub" style={{ color: '#f87171' }}>Failed to load metrics. Check your connection.</div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Applications',
      value: data.appliedThisWeek === 0 ? '0' : String(data.appliedThisWeek),
      sub: `this week · ${data.totalApplied} total`,
      emoji: '📨',
      color: accentColor,
    },
    {
      label: 'Response Rate',
      value: data.totalApplied === 0 ? '—' : `${data.responseRate}%`,
      sub: 'target: >15%',
      emoji: '📬',
      color: data.totalApplied === 0 ? '#64748b' : responseColor(data.responseRate),
    },
    {
      label: 'Interview Rate',
      value: data.totalApplied === 0 ? '—' : `${data.interviewRate}%`,
      sub: 'target: >5%',
      emoji: '🎙️',
      color: data.totalApplied === 0 ? '#64748b' : interviewColor(data.interviewRate),
    },
    {
      label: 'Active Offers',
      value: data.totalOffers === 0 ? '0' : String(data.totalOffers),
      sub: data.totalOffers > 0 ? '🔥 Close these first' : 'keep pushing',
      emoji: '🎉',
      color: data.totalOffers > 0 ? '#4ade80' : '#64748b',
    },
  ]

  const pipelineStages = [
    { label: 'Prospect', count: data.pipeline.prospect, color: '#64748b' },
    { label: 'Applied', count: data.pipeline.applied, color: accentColor },
    { label: 'Interview', count: data.pipeline.interview, color: '#fbbf24' },
    { label: 'Offer', count: data.pipeline.offer, color: '#4ade80' },
    { label: 'Rejected', count: data.pipeline.rejected, color: '#f87171' },
  ]

  const total = Object.values(data.pipeline).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="section-title">Pipeline Metrics</div>
      <div className="section-sub">Live data · updates on every visit</div>

      {/* Stat Cards */}
      <div className="metrics-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="metric-emoji">{stat.emoji}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div className="metric-label">{stat.label}</div>
            <div className="metric-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>
          Pipeline Breakdown
          <span style={{
            fontSize: 12, fontWeight: 400, color: '#64748b', marginLeft: 8
          }}>
            {total} total opportunities
          </span>
        </div>

        {/* Visual bar */}
        {total > 0 && (
          <div style={{
            display: 'flex', height: 8, borderRadius: 4,
            overflow: 'hidden', marginBottom: 16, gap: 2
          }}>
            {pipelineStages.filter(s => s.count > 0).map(s => (
              <div
                key={s.label}
                style={{
                  flex: s.count,
                  background: s.color,
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pipelineStages.map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 8, padding: '6px 12px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Health */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>
          Strategy Health
        </div>

        {[
          {
            label: 'Response rate',
            value: data.totalApplied === 0
              ? 'No applications yet'
              : `${data.responseRate}% (${data.totalApplied} sent)`,
            ok: data.totalApplied === 0 || data.responseRate >= 15,
          },
          {
            label: 'Interview conversion',
            value: data.totalApplied === 0
              ? 'No applications yet'
              : `${data.interviewRate}% of applications`,
            ok: data.totalApplied === 0 || data.interviewRate >= 5,
          },
          {
            label: 'Follow-ups needed',
            value: data.staleJobs === 0
              ? 'All caught up ✓'
              : `${data.staleJobs} application${data.staleJobs > 1 ? 's' : ''} overdue`,
            ok: data.staleJobs === 0,
          },
          {
            label: 'Days active',
            value: data.daysActive === null
              ? 'Not started yet'
              : `${data.daysActive} day${data.daysActive !== 1 ? 's' : ''}`,
            ok: true,
          },
        ].map((row) => (
          <div key={row.label} className="health-row">
            <span className="health-label">{row.label}</span>
            <span style={{
              fontSize: 13,
              color: row.ok ? '#94a3b8' : '#f87171',
              fontWeight: row.ok ? 400 : 600,
            }}>
              {row.value}
            </span>
          </div>
        ))}

        {/* Flags */}
        {data.flags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {data.flags.map((flag, i) => (
              <div key={i} style={{
                background: '#1c1010',
                border: '1px solid #7f1d1d',
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 8,
                fontSize: 13,
                color: '#fca5a5',
                lineHeight: 1.5,
              }}>
                ⚠️ {flag}
              </div>
            ))}
          </div>
        )}

        {data.flags.length === 0 && data.totalApplied > 0 && (
          <div className="tip-box" style={{ marginTop: 16, borderColor: '#14532d', background: '#0f1f14' }}>
            ✅ Strategy on track. Keep the volume and quality high.
          </div>
        )}

        {data.totalApplied === 0 && (
          <div className="tip-box" style={{ marginTop: 16 }}>
            💡 Metrics populate as you add jobs and track applications. If response rate drops below 15%, the system will flag it automatically.
          </div>
        )}
      </div>
    </div>
  )
}
