'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

const caylahCompanies = [
  { name: 'Notion', track: 'RevOps', tier: 1, why: 'Operations-native product, strong remote culture' },
  { name: 'Zapier', track: 'GTM Ops', tier: 1, why: 'Automation-first, values systems thinkers' },
  { name: 'HubSpot', track: 'RevOps', tier: 1, why: 'Large RevOps function, global remote hiring' },
  { name: 'Chargebee', track: 'RevOps', tier: 2, why: 'Series C, building RevOps from scratch' },
  { name: 'Deel', track: 'GTM Ops', tier: 2, why: 'Remote-first, SA-friendly, rapid growth' },
]

const kyleCompanies = [
  { name: 'Clio', track: 'LegalTech CSM', tier: 1, why: 'Largest legal practice management platform' },
  { name: 'Everlaw', track: 'LegalTech CSM', tier: 1, why: 'eDiscovery platform, law firm clients' },
  { name: 'LEAP Legal', track: 'LegalTech CSM', tier: 1, why: 'Global, actively hiring CSMs with legal background' },
  { name: 'Sprout Social', track: 'Marketing Ops', tier: 2, why: 'Social media platform, strong CSM culture' },
  { name: 'Atticus', track: 'LegalTech CSM', tier: 2, why: 'Mission-driven legal tech, growing fast' },
]

const tierConfig = {
  1: { label: 'Dream', color: 'text-yellow-400 bg-yellow-900' },
  2: { label: 'Strong Fit', color: 'text-blue-400 bg-blue-900' },
  3: { label: 'Backup', color: 'text-slate-400 bg-slate-800' },
}

export default function CompanyTargets({ activeUser }: Props) {
  const companies = activeUser === 'caylah' ? caylahCompanies : kyleCompanies
  const color = activeUser === 'caylah' ? 'blue' : 'purple'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Target Companies</h2>
          <p className="text-slate-400 text-sm mt-1">
            Ranked by fit and probability. Start at Tier 1.
          </p>
        </div>
        <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
          color === 'blue'
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'bg-purple-600 hover:bg-purple-500'
        } text-white transition-colors`}>
          + Add Company
        </button>
      </div>

      <div className="grid gap-3">
        {companies.map((company) => (
          <div
            key={company.name}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-300 shrink-0">
              {company.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-medium">{company.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tierConfig[company.tier as keyof typeof tierConfig].color
                }`}>
                  {tierConfig[company.tier as keyof typeof tierConfig].label}
                </span>
                <span className="text-xs text-slate-500">{company.track}</span>
              </div>
              <p className="text-slate-400 text-sm">{company.why}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition-colors">
                Research
              </button>
              <button className={`px-3 py-1.5 text-white text-xs rounded-md transition-colors ${
                color === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-purple-600 hover:bg-purple-500'
              }`}>
                Outreach
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
