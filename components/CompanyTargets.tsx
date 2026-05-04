'use client'

import { useState, useEffect } from 'react'
import AddCompanyModal from './AddCompanyModal'

type Company = {
  id?: string
  name: string
  track: string
  tier: number
  why: string
  notes?: string
  careersUrl: string
  website?: string
  linkedinUrl?: string
  hiringSignal: string
  regionFriendly: boolean
  isDefault?: boolean
  targetUser?: string
  industry?: string
  lastChecked?: string
}

const DEFAULT_CAYLAH: Company[] = [
  { name: 'Deel', track: 'GTM Ops / RevOps', tier: 1, why: 'Global-first, constant hiring, SA-friendly payroll', careersUrl: 'https://jobs.ashbyhq.com/deel', hiringSignal: 'High-volume ops and support hiring year-round', regionFriendly: true, isDefault: true },
  { name: 'Remote.com', track: 'Operations / Support', tier: 1, why: 'Built for global teams, walks the talk on remote hiring', careersUrl: 'https://remote.com/careers', hiringSignal: 'Frequent ops, support and onboarding roles', regionFriendly: true, isDefault: true },
  { name: 'Hotjar', track: 'Operations / GTM', tier: 1, why: 'Fully remote, SA-founded, strong async culture', careersUrl: 'https://www.hotjar.com/careers/', hiringSignal: 'Regular ops and business roles, Africa-friendly', regionFriendly: true, isDefault: true },
  { name: 'GitLab', track: 'Program / Business Ops', tier: 1, why: 'Fully remote company, transparent hiring, documented culture', careersUrl: 'https://about.gitlab.com/jobs/', hiringSignal: 'Consistent remote roles across ops and program management', regionFriendly: true, isDefault: true },
  { name: 'Automattic', track: 'Business Ops / Project', tier: 1, why: 'Fully distributed since 2005, proven remote culture', careersUrl: 'https://automattic.com/work-with-us/', hiringSignal: 'Regular ops and project roles, globally inclusive', regionFriendly: true, isDefault: true },
  { name: 'Zapier', track: 'Ops / Automation', tier: 2, why: 'Remote-native, values systems thinkers', careersUrl: 'https://zapier.com/jobs', hiringSignal: 'Occasional ops and partnerships roles', regionFriendly: true, isDefault: true },
  { name: 'Aircall', track: 'RevOps / GTM Ops', tier: 2, why: 'Series C, building ops function, remote-friendly', careersUrl: 'https://aircall.io/careers/', hiringSignal: 'Growing ops team, active hiring', regionFriendly: true, isDefault: true },
  { name: 'Webflow', track: 'Business Ops / RevOps', tier: 2, why: 'High-growth SaaS, strong ops culture', careersUrl: 'https://webflow.com/careers', hiringSignal: 'Regular business and revenue ops roles', regionFriendly: true, isDefault: true },
  { name: 'HubSpot', track: 'RevOps', tier: 3, why: 'Large RevOps function but competitive and US-weighted', careersUrl: 'https://www.hubspot.com/careers', hiringSignal: 'Fewer remote global roles', regionFriendly: false, isDefault: true },
]

const DEFAULT_KYLE: Company[] = [
  { name: 'Deel', track: 'Customer Success', tier: 1, why: 'Rapid growth, onboarding-heavy, global hiring', careersUrl: 'https://jobs.ashbyhq.com/deel', hiringSignal: 'Frequent CS and onboarding roles', regionFriendly: true, isDefault: true },
  { name: 'SupportYourApp', track: 'Customer Support', tier: 1, why: 'Global support outsourcer, always hiring, entry-friendly', careersUrl: 'https://supportyourapp.com/careers/', hiringSignal: 'High-volume global support hiring', regionFriendly: true, isDefault: true },
  { name: 'Automattic', track: 'Customer Success', tier: 1, why: 'Fully distributed, Happiness Engineers, proven remote culture', careersUrl: 'https://automattic.com/work-with-us/', hiringSignal: 'Regular customer-facing roles globally', regionFriendly: true, isDefault: true },
  { name: 'Clio', track: 'LegalTech CSM', tier: 1, why: 'Largest legal platform globally, frequent CSM hiring', careersUrl: 'https://www.clio.com/about/careers/', hiringSignal: 'Regular CSM roles, values legal background', regionFriendly: true, isDefault: true },
  { name: 'Freshworks', track: 'Customer Success', tier: 2, why: 'Large support org, structured CS team', careersUrl: 'https://www.freshworks.com/company/careers/', hiringSignal: 'Regular support and CS hiring', regionFriendly: true, isDefault: true },
  { name: 'Loom', track: 'Customer Success', tier: 2, why: 'Remote-first, CS-heavy, async culture', careersUrl: 'https://www.loom.com/careers', hiringSignal: 'Growing CS team', regionFriendly: true, isDefault: true },
  { name: 'Hotjar', track: 'Customer Success', tier: 2, why: 'SA-founded, remote-first, strong team culture', careersUrl: 'https://www.hotjar.com/careers/', hiringSignal: 'CS and support roles, Africa-friendly', regionFriendly: true, isDefault: true },
  { name: 'Intercom', track: 'Customer Success', tier: 3, why: 'Strong CS culture but competitive, mostly US/EU', careersUrl: 'https://www.intercom.com/careers', hiringSignal: 'Lower volume, competitive roles', regionFriendly: false, isDefault: true },
]

const TIER_LABEL: Record<number, string> = { 1: 'High Probability', 2: 'Good Bet', 3: 'Stretch' }
const TIER_COLOR: Record<number, string> = { 1: '#16a34a', 2: '#2563eb', 3: '#64748b' }

type Props = { activeUser: 'caylah' | 'kyle' }

export default function CompanyTargets({ activeUser }: Props) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [globalOnly, setGlobalOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [outreachTarget, setOutreachTarget] = useState<Company | null>(null)
  const [outreachPlatform, setOutreachPlatform] = useState('LinkedIn')
  const [outreachContact, setOutreachContact] = useState('')
  const [outreachRole, setOutreachRole] = useState('')
  const [outreachMessage, setOutreachMessage] = useState('')
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)

  const accent = activeUser === 'caylah' ? '#2563eb' : '#7c3aed'
  const isKyle = activeUser === 'kyle'

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/companies?user=' + activeUser)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setCompanies(data)
      } else {
        setCompanies(isKyle ? DEFAULT_KYLE : DEFAULT_CAYLAH)
      }
    } catch {
      setCompanies(isKyle ? DEFAULT_KYLE : DEFAULT_CAYLAH)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [activeUser])

  const filtered = companies
    .filter(c => !globalOnly || c.regionFriendly)
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier
      return (b.regionFriendly ? 1 : 0) - (a.regionFriendly ? 1 : 0)
    })

  const saveNotes = async (company: Company) => {
    if (!company.id) return
    setSavingNotes(company.id)
    try {
      await fetch('/api/companies/' + company.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: noteDrafts[company.id] ?? company.notes,
          lastChecked: new Date().toISOString(),
        }),
      })
      await load()
    } finally {
      setSavingNotes(null)
    }
  }

  const closeOutreach = () => {
    setOutreachTarget(null)
    setOutreachContact('')
    setOutreachRole('')
    setOutreachMessage('')
    setOutreachPlatform('LinkedIn')
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
        Loading companies...
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="section-title">Target Companies</div>
          <div className="section-sub">High-probability direct outreach targets. Verified careers pages. Start at Tier 1.</div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Company
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setGlobalOnly(!globalOnly)}
          style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid ' + (globalOnly ? accent : '#334155'), background: globalOnly ? accent + '22' : 'transparent', color: globalOnly ? 'white' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Global-friendly only
        </button>
        <div style={{ fontSize: 12, color: '#475569' }}>
          {filtered.length} companies · {filtered.filter(c => c.regionFriendly).length} global-friendly
        </div>
      </div>

      {[1, 2, 3].map(tier => {
        const group = filtered.filter(c => c.tier === tier)
        if (!group.length) return null
        return (
          <div key={tier} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: TIER_COLOR[tier], textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid ' + TIER_COLOR[tier] + '33' }}>
              Tier {tier} — {TIER_LABEL[tier]}
            </div>

            {group.map(company => {
              const cardId = company.id || 'default-' + company.name
              const isExpanded = expandedId === cardId
              const noteVal = company.id ? (noteDrafts[company.id] ?? company.notes ?? '') : (company.notes ?? '')

              return (
                <div key={cardId} style={{ background: '#0d1117', border: '1px solid ' + (isExpanded ? accent : '#1e293b'), borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: TIER_COLOR[tier] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: TIER_COLOR[tier] }}>
                      {company.name[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{company.name}</span>
                        {company.regionFriendly && (
                          <span style={{ fontSize: 10, background: '#16a34a22', color: '#4ade80', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Global</span>
                        )}
                        <span style={{ fontSize: 11, color: '#64748b' }}>{company.track}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>{company.hiringSignal}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => openUrl(company.careersUrl)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Careers
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cardId)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Research
                      </button>
                      <button
                        onClick={() => setOutreachTarget(company)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: accent, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Outreach
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #1e293b', padding: 16, background: '#080c12' }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>{company.why}</div>

                      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <button onClick={() => openUrl(company.careersUrl)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: accent, fontSize: 12, cursor: 'pointer' }}>
                          Careers Page
                        </button>
                        {company.website && (
                          <button onClick={() => openUrl(company.website as string)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: accent, fontSize: 12, cursor: 'pointer' }}>
                            Website
                          </button>
                        )}
                        {company.linkedinUrl && (
                          <button onClick={() => openUrl(company.linkedinUrl as string)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: accent, fontSize: 12, cursor: 'pointer' }}>
                            LinkedIn
                          </button>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Research Notes</div>
                      <textarea
                        value={noteVal}
                        onChange={e => {
                          if (company.id) {
                            const id = company.id
                            setNoteDrafts(prev => ({ ...prev, [id]: e.target.value }))
                          }
                        }}
                        placeholder="Who is the hiring manager? What roles are open? What is the ops gap?"
                        rows={3}
                        disabled={!company.id}
                        style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: company.id ? '#e2e8f0' : '#475569', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 8 }}
                      />
                      {company.id ? (
                        <button
                          onClick={() => saveNotes(company)}
                          disabled={savingNotes === company.id}
                          style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: savingNotes === company.id ? '#334155' : accent, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {savingNotes === company.id ? 'Saving...' : 'Save Notes'}
                        </button>
                      ) : (
                        <div style={{ fontSize: 11, color: '#475569' }}>Add via + Add Company to save notes</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {outreachTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Log Outreach</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{outreachTarget.name}</div>
              </div>
              <button onClick={closeOutreach} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>x</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Contact Name</div>
              <input value={outreachContact} onChange={e => setOutreachContact(e.target.value)} placeholder="e.g. Sarah Chen" style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Their Role</div>
              <input value={outreachRole} onChange={e => setOutreachRole(e.target.value)} placeholder="e.g. Head of Operations" style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Platform</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['LinkedIn', 'Email', 'Twitter'].map(p => (
                  <button key={p} onClick={() => setOutreachPlatform(p)} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid ' + (outreachPlatform === p ? accent : '#334155'), background: outreachPlatform === p ? accent + '22' : 'transparent', color: outreachPlatform === p ? 'white' : '#64748b', cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Message</div>
              <textarea value={outreachMessage} onChange={e => setOutreachMessage(e.target.value)} placeholder="Paste the message you sent..." rows={4} style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={closeOutreach} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={closeOutreach} style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log Outreach</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AddCompanyModal
          activeUser={activeUser}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
