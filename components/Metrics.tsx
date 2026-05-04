'use client'

import { useState, useEffect } from 'react'

type MetricsData = {
  appliedToday: number
  appliedThisWeek: number
  totalApplied: number
  activePipeline: number
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

  const accent = isKyle ? '#7c3aed' : '#2563eb'
  const accentLight = isKyle ? '#a78bfa' : '#60a5fa'

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
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Pipeline Metrics
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 12, padding: 20, marginBottom: 10, height: 60
          }} />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ fontSize: 13, color: '#f87171' }}>Failed to load metrics.</div>
      </div>
    )
  }

  const pipelineStages = [
    { label: 'Prospect', count: data.pipeline.prospect, color: '#334155' },
    { label: 'Applied', count: data.pipeline.applied, color: accentLight },
    { label: 'Interview', count: data.pipeline.interview, color: '#fbbf24' },
    { label: 'Offer', count: data.pipeline.offer, color: '#4ade80' },
    { label: 'Rejected', count: data.pipeline.rejected, color: '#f87171' },
  ]

  const total = Object.values(data.pipeline).reduce((a, b) => a + b, 0)

  // Momentum scoreboard — 4 distinct time horizons
  const scoreItems = [
    {
      value: String(data.appliedToday),
      label: 'Today',
      sub: 'applications sent',
      color: data.appliedToday > 0 ? accentLight : '#334155',
    },
    {
      value: String(data.appliedThisWeek),
      label: 'This week',
      sub: 'since Sunday',
      color: data.appliedThisWeek > 0 ? accentLight : '#334155',
    },
    {
      value: String(data.totalApplied),
      label: 'Total',
      sub: data.daysActive !== null ? `over ${data.daysActive} day${data.daysActive !== 1 ? 's' : ''}` : 'all time',
      color: data.totalApplied > 0 ? accentLight : '#334155',
    },
    {
      value: String(data.activePipeline),
      label: 'Active',
      sub: 'in live pipeline',
      color: data.activePipeline > 0 ? '#4ade80' : '#334155',
    },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* MOMENTUM SCOREBOARD */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderTop: `3px solid ${accent}`,
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#475569',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
        }}>
          Momentum · {data.daysActive !== null ? `Day ${data.daysActive} of search` : 'Search not started'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {scoreItems.map((item, i) => (
            <div
              key={item.label}
              style={{
                paddingRight: i < scoreItems.length - 1 ? 16 : 0,
                marginRight: i < scoreItems.length - 1 ? 16 : 0,
                borderRight: i < scoreItems.length - 1 ? '1px solid #1e293b' : 'none',
              }}
            >
              <div style={{
                fontSize: 28,
                fontWeight: 800,
                color: item.color,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                marginBottom: 6,
              }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 10, color: '#334155' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PIPELINE BREAKDOWN */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#475569',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Pipeline
          </span>
          <span style={{ fontSize: 11, color: '#334155' }}>{total} total</span>
        </div>

        {total > 0 ? (
          <div style={{
            display: 'flex', height: 6, borderRadius: 4,
            overflow: 'hidden', gap: 2, marginBottom: 12,
          }}>
            {pipelineStages.filter(s => s.count > 0).map(s => (
              <div key={s.label} style={{ flex: s.count, background: s.color, borderRadius: 4 }} />
            ))}
          </div>
        ) : (
          <div style={{ height: 6, background: '#1e293b', borderRadius: 4, marginBottom: 12 }} />
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {pipelineStages.map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#0a0a0f', border: '1px solid #1e293b',
              borderRadius: 8, padding: '5px 10px',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{s.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: s.count > 0 ? 'white' : '#334155',
              }}>
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STRATEGY HEALTH */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#475569',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          Strategy health
        </div>

        {[
          {
            label: 'Response rate',
            value: data.totalApplied === 0
              ? 'No applications yet'
              : `${data.responseRate}% of ${data.totalApplied} sent`,
            valueColor: data.totalApplied === 0 ? '#64748b' : responseColor(data.responseRate),
            ok: data.totalApplied === 0 || data.responseRate >= 15,
          },
          {
            label: 'Interview conversion',
            value: data.totalApplied === 0
              ? 'No applications yet'
              : `${data.interviewRate}% of applications`,
            valueColor: data.totalApplied === 0 ? '#64748b' : interviewColor(data.interviewRate),
            ok: data.totalApplied === 0 || data.interviewRate >= 5,
          },
          {
            label: 'Active offers',
            value: data.totalOffers === 0 ? 'None yet' : `${data.totalOffers} open`,
            valueColor: data.totalOffers > 0 ? '#4ade80' : '#64748b',
            ok: true,
          },
          {
            label: 'Follow-ups overdue',
            value: data.staleJobs === 0 ? 'All caught up ✓' : `${data.staleJobs} need attention`,
            valueColor: data.staleJobs === 0 ? '#64748b' : '#f87171',
            ok: data.staleJobs === 0,
          },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: i < arr.length - 1 ? '1px solid #1e293b' : 'none',
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: row.valueColor }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* FLAGS */}
      {data.flags.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {data.flags.map((flag, i) => (
            <div key={i} style={{
              background: '#1c1010',
              border: '1px solid #7f1d1d',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 8,
              fontSize: 12,
              color: '#fca5a5',
              lineHeight: 1.5,
            }}>
              ⚠️ {flag}
            </div>
          ))}
        </div>
      )}

      {/* STATUS FOOTER */}
      {data.flags.length === 0 && data.totalApplied > 0 && (
        <div style={{
          padding: '10px 14px',
          background: '#0f1f14',
          border: '1px solid #166534',
          borderRadius: 10,
          fontSize: 12,
          color: '#4ade80',
        }}>
          ✅ Strategy on track. Keep the volume and quality high.
        </div>
      )}

      {data.totalApplied === 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#0d0d14',
          border: '1px solid #1e293b',
          borderRadius: 10,
          fontSize: 11,
          color: '#334155',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          Metrics populate as you apply and track. Response rate below 15% triggers an automatic flag.
        </div>
      )}

    </div>
  )
}