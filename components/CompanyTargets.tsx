'use client'

import { useState } from 'react'

type Props = { activeUser: 'caylah' | 'kyle' }

type Status = 'none' | 'research' | 'contacted' | 'replied'

type Company = {
  name: string
  track: string
  tier: number
  why: string
  status: Status
}

const caylahCompanies: Company[] = [
  { name: 'Notion', track: 'RevOps', tier: 1, why: 'Operations-native product', status: 'none' },
  { name: 'Zapier', track: 'GTM Ops', tier: 1, why: 'Automation-first', status: 'none' },
  { name: 'HubSpot', track: 'RevOps', tier: 1, why: 'Large RevOps function', status: 'none' },
  { name: 'Chargebee', track: 'RevOps', tier: 2, why: 'Series C growth', status: 'none' },
  { name: 'Deel', track: 'GTM Ops', tier: 2, why: 'Remote-first', status: 'none' },
]

const kyleCompanies: Company[] = [
  { name: 'Clio', track: 'LegalTech CSM', tier: 1, why: 'Legal platform leader', status: 'none' },
  { name: 'Everlaw', track: 'LegalTech CSM', tier: 1, why: 'eDiscovery platform', status: 'none' },
  { name: 'LEAP Legal', track: 'LegalTech CSM', tier: 1, why: 'Global legal SaaS', status: 'none' },
  { name: 'Sprout Social', track: 'Marketing Ops', tier: 2, why: 'Strong CSM culture', status: 'none' },
  { name: 'Atticus', track: 'LegalTech CSM', tier: 2, why: 'Mission-driven', status: 'none' },
]

export default function CompanyTargets({ activeUser }: Props) {
  const initial = activeUser === 'caylah' ? caylahCompanies : kyleCompanies
  const [companies, setCompanies] = useState(initial)
  const isKyle = activeUser === 'kyle'

  const updateStatus = (name: string, status: Status) => {
    setCompanies((prev) =>
      prev.map((c) => (c.name === name ? { ...c, status } : c))
    )
  }

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'research':
        return '🔍 Researched'
      case 'contacted':
        return '📨 Contacted'
      case 'replied':
        return '💬 Replied'
      default:
        return '⚪ Not started'
    }
  }

  return (
    <div>
      <div className="flex-between">
        <div>
          <div className="section-title">Target Companies</div>
          <div className="section-sub">
            Work these like a pipeline. Tier 1 first.
          </div>
        </div>
        <button className={`btn-add ${isKyle ? 'kyle' : ''}`}>
          + Add Company
        </button>
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

            <div style={{ fontSize: 12, marginTop: 4 }}>
              {getStatusLabel(company.status)}
            </div>
          </div>

          <div className="company-actions">
            <button
              className="btn-secondary"
              onClick={() => updateStatus(company.name, 'research')}
            >
              Research
            </button>

            <button
              className={`btn-primary ${isKyle ? 'kyle' : ''}`}
              onClick={() => updateStatus(company.name, 'contacted')}
            >
              Outreach
            </button>

            <button
              className="btn-secondary"
              onClick={() => updateStatus(company.name, 'replied')}
            >
              Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
