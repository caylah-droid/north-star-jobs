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
  { name: 'Clio', track: 'LegalTech CSM', tier: 1, why: 'Largest legal practice management platform globally' },
  { name: 'Everlaw', track: 'LegalTech CSM', tier: 1, why: 'eDiscovery platform, law firm clients' },
  { name: 'LEAP Legal', track: 'LegalTech CSM', tier: 1, why: 'Global, actively hiring CSMs with legal background' },
  { name: 'Sprout Social', track: 'Marketing Ops', tier: 2, why: 'Social media platform, strong CSM culture' },
  { name: 'Atticus', track: 'LegalTech CSM', tier: 2, why: 'Mission-driven legal tech, growing fast' },
]

export default function CompanyTargets({ activeUser }: Props) {
  const companies = activeUser === 'caylah' ? caylahCompanies : kyleCompanies
  const isKyle = activeUser === 'kyle'

  return (
    <div>
      <div className="flex-between">
        <div>
          <div className="section-title">Target Companies</div>
          <div className="section-sub">Ranked by fit and probability. Start at Tier 1.</div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>+ Add Company</button>
      </div>

      {companies.map((company) => (
        <div key={company.name} className="company-card">
          <div className="company-avatar">{company.name[0]}</div>
          <div className="company-info">
            <div className="company-name">
              {company.name}
              <span className={`tier-badge tier-${company.tier}`}>
                {company.tier === 1 ? 'Dream' : 'Strong Fit'}
              </span>
              <span className="track-label">{company.track}</span>
            </div>
            <div className="company-why">{company.why}</div>
          </div>
          <div className="company-actions">
            <button className="btn-secondary">Research</button>
            <button className={`btn-primary ${isKyle ? 'kyle' : ''}`}>Outreach</button>
          </div>
        </div>
      ))}
    </div>
  )
}
