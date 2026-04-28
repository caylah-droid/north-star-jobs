'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

export default function Metrics({ activeUser }: Props) {
  const color = activeUser === 'caylah' ? 'blue' : 'purple'

  const stats = [
    { label: 'Applications', value: '0', sub: 'this week', emoji: '📨' },
    { label: 'Response Rate', value: '0%', sub: 'target: >15%', emoji: '📬' },
    { label: 'Interview Rate', value: '0%', sub: 'target: >5%', emoji: '🎙️' },
    { label: 'Outreach Replies', value: '0%', sub: 'target: >20%', emoji: '💬' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Pipeline Metrics</h2>
        <p className="text-slate-400 text-sm mt-1">
          Track what's working. Adapt what isn't.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5"
          >
            <div className="text-2xl mb-2">{stat.emoji}</div>
            <div className={`text-3xl font-bold mb-1 ${
              color === 'blue' ? 'text-blue-400' : 'text-purple-400'
            }`}>
              {stat.value}
            </div>
            <div className="text-white text-sm font-medium">{stat.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Warning zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Strategy Health</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Response rate</span>
            <span className="text-slate-500 text-sm">No data yet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Outreach conversion</span>
            <span className="text-slate-500 text-sm">No data yet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Days since first application</span>
            <span className="text-slate-500 text-sm">Not started</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-slate-400 text-xs">
            💡 Metrics will populate as you add jobs and track actions. 
            If response rate drops below 15%, the system will flag a strategy change.
          </p>
        </div>
      </div>
    </div>
  )
}
