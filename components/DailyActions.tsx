'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

const caylahActions = [
  {
    id: 1,
    type: 'Apply',
    emoji: '📨',
    title: 'Apply to 2 targeted roles',
    description: 'RevOps or GTM Ops at Series A–C SaaS. Direct career page only.',
    priority: 'high',
  },
  {
    id: 2,
    type: 'Outreach',
    emoji: '🤝',
    title: 'Send 1 warm outreach',
    description: 'Find hiring manager or ops leader on LinkedIn. Connect before applying.',
    priority: 'high',
  },
  {
    id: 3,
    type: 'Follow Up',
    emoji: '🔁',
    title: 'Follow up on 2 applications',
    description: 'Any application older than 5 days with no response.',
    priority: 'medium',
  },
  {
    id: 4,
    type: 'Proof of Work',
    emoji: '⚒️',
    title: 'Create 1 proof-of-work asset',
    description: 'Loom audit, process doc, or LinkedIn post as The Operator.',
    priority: 'medium',
  },
]

const kyleActions = [
  {
    id: 1,
    type: 'Research',
    emoji: '🔍',
    title: 'Research 1 target company',
    description: 'LegalTech or Marketing Ops. Find the CSM team, hiring manager, open roles.',
    priority: 'high',
  },
  {
    id: 2,
    type: 'Apply',
    emoji: '📨',
    title: 'Apply to 2 targeted roles',
    description: 'CSM or Account Manager at LegalTech or Marketing platform.',
    priority: 'high',
  },
  {
    id: 3,
    type: 'Outreach',
    emoji: '🤝',
    title: 'Send 3 outreach messages',
    description: 'LinkedIn connections with personalised notes referencing legal or marketing ops.',
    priority: 'high',
  },
  {
    id: 4,
    type: 'Follow Up',
    emoji: '🔁',
    title: 'Follow up on 3 conversations',
    description: 'Any outreach or application older than 4 days with no response.',
    priority: 'medium',
  },
]

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-slate-600',
}

export default function DailyActions({ activeUser }: Props) {
  const actions = activeUser === 'caylah' ? caylahActions : kyleActions
  const color = activeUser === 'caylah' ? 'blue' : 'purple'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Today's Mission</h2>
        <p className="text-slate-400 text-sm mt-1">
          {activeUser === 'caylah'
            ? 'RevOps & GTM Ops targeting — systems, proof, outreach'
            : 'LegalTech & Marketing Ops targeting — relationships, conversations'}
        </p>
      </div>

      <div className="grid gap-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`bg-slate-900 border border-slate-800 border-l-4 ${
              priorityColors[action.priority as keyof typeof priorityColors]
            } rounded-lg p-4 flex items-start gap-4`}
          >
            <span className="text-2xl">{action.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  color === 'blue' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                }`}>
                  {action.type}
                </span>
                {action.priority === 'high' && (
                  <span className="text-xs text-red-400 font-medium">● High priority</span>
                )}
              </div>
              <h3 className="text-white font-medium">{action.title}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{action.description}</p>
            </div>
            <button className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${
              color === 'blue'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            } transition-colors`}>
              Done
            </button>
          </div>
        ))}
      </div>

      {/* Daily target summary */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Today's targets</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {activeUser === 'caylah' ? (
            <>
              <div>
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-xs text-slate-500 mt-1">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">1</div>
                <div className="text-xs text-slate-500 mt-1">Outreach</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">1</div>
                <div className="text-xs text-slate-500 mt-1">Proof of work</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-2xl font-bold text-purple-400">2</div>
                <div className="text-xs text-slate-500 mt-1">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">3</div>
                <div className="text-xs text-slate-500 mt-1">Outreach</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">3</div>
                <div className="text-xs text-slate-500 mt-1">Follow ups</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
