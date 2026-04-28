'use client'

type Props = { activeUser: 'caylah' | 'kyle' }

const caylahCompanies = [
  { name: 'Notion', track: 'RevOps', tier: 1, why: 'Operations-native product' },
  { name: 'Zapier', track: 'GTM Ops', tier: 1, why: 'Automation-first culture' },
  { name: 'HubSpot', track: 'RevOps', tier: 1, why: 'Large global RevOps team' },
  { name: 'Chargebee', track: 'RevOps', tier: 2, why: 'Series C growth' },
  { name: 'Deel', track: 'GTM Ops', tier: 2, why: 'Remote-first, SA-friendly' },
]

const kyleCompanies = [
  { name: 'Clio', track: 'LegalTech CSM', tier: 1, why: 'Global legal SaaS leader' },
  { name: 'Everlaw', track: 'LegalTech CSM', tier: 1, why: 'eDiscovery platform' },
  { name: 'LEAP', track: 'LegalTech CSM', tier: 1, why: 'Legal SaaS, global growth' },
  { name: 'Sprout Social', track: 'Marketing Ops', tier: 2, why: 'Strong CSM org' },
  { name: 'Atticus', track: 'LegalTech CSM', tier: 2, why: 'Mission-driven legal tech' },
]

export default function CompanyTargets({ activeUser }: Props) {
  const companies = activeUser === 'caylah' ? caylahCompanies : kyleCompanies
  const isKyle = activeUser === 'kyle'

  return (
    <div>
      {/* HEADER */}
      <div className="flex-between">
        <div>
          <div className="section-title">Target Companies</div>
          <div className="section-sub">
            Work these like a pipeline. Start with Tier 1.
          </div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>
          + Add Company
        </button>
      </div>

      {/* GRID */}
      <div className="company-grid">
        {companies.map((company) => (
          <div key={company.name} className="company-card">
            
            {/* TOP ROW */}
            <div className="company-top">
              <div className="company-avatar">
                {company.name[0]}
              </div>

              <div>
                <div className="company-name">
                  {company.name}
                </div>
                <div className="company-track">
                  {company.track}
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div className="company-tags">
              <span className={`tier-badge tier-${company.tier}`}>
                {company.tier === 1 ? 'Tier 1' : 'Tier 2'}
              </span>
              <span className="status-badge">Not started</span>
            </div>

            {/* WHY */}
            <div className="company-why">
              {company.why}
            </div>

            {/* ACTIONS */}
            <div className="company-actions">
              <button className="btn-secondary">Research</button>
              <button className={`btn-primary ${isKyle ? 'kyle' : ''}`}>
                Outreach
              </button>
              <button className="btn-secondary">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
