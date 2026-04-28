'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

const stages = ['prospect', 'applied', 'interview', 'offer', 'rejected']

const stageConfig: Record<string, { label: string; color: string }> = {
  prospect: { label: '🔭 Prospect', color: 'slate' },
  applied: { label: '📨 Applied', color: 'blue' },
  interview: { label: '🎙️ Interview', color: 'yellow' },
  offer: { label: '🎉 Offer', color: 'green' },
  rejected: { label: '❌ Rejected', color: 'red' },
}

export default function JobBoard({ activeUser }: Props) {
  const color = activeUser === 'caylah' ? 'blue' : 'purple'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Opportunities</h2>
          <p className="text-slate-400 text-sm mt-1">
            {activeUser === 'caylah'
              ? 'RevOps · GTM Ops · Business Operations'
              : 'LegalTech CSM · Marketing Ops · Account Management'}
          </p>
        </div>
        <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
          color === 'blue'
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'bg-purple-600 hover:bg-purple-500'
        } text-white transition-colors`}>
          + Add Job
        </button>
      </div>

      {/* Top 5 Engine */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white">⭐ Highest Probability</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            Top 5
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-500 text-sm">No jobs added yet.</p>
          <p className="text-slate-600 text-xs mt-1">
            Add your first opportunity to see it ranked here.
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">All Opportunities</h3>
        <div className="grid grid-cols-5 gap-3">
          {stages.map((stage) => (
            <div key={stage} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-400 mb-3">
                {stageConfig[stage].label}
              </div>
              <div className="min-h-24 flex items-center justify-center">
                <p className="text-slate-700 text-xs text-center">Empty</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
