'use client'

type Props = {
  activeUser: 'caylah' | 'kyle'
  setActiveUser: (user: 'caylah' | 'kyle') => void
}

export default function Header({ activeUser, setActiveUser }: Props) {
  return (
    <div className="border-b border-slate-800 bg-[#0d0d14]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            ⭐ North Star
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Job acquisition system
          </p>
        </div>

        {/* User Toggle */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveUser('caylah')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeUser === 'caylah'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Caylah
          </button>
          <button
            onClick={() => setActiveUser('kyle')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeUser === 'kyle'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kyle
          </button>
        </div>
      </div>

      {/* Mode indicator */}
      <div className={`h-0.5 ${activeUser === 'caylah' ? 'bg-blue-600' : 'bg-purple-600'}`} />
    </div>
  )
}
