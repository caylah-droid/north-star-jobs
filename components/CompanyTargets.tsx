'use client'

import { useState, useEffect } from 'react'
import AddCompanyModal from './AddCompanyModal'

type Company = {
  id?: string
  name: string
  track: string
  tier: number
  why: string
  careersUrl: string
  hiringSignal: string
  regionFriendly: boolean
  isDefault?: boolean
  website?: string
  linkedinUrl?: string
  notes?: string
}

const DEFAULT_CAYLAH: Company[] = [
  { name: 'Chargebee', track: 'Revenue Operations', tier: 1, why: 'Subscription billing SaaS — RevOps is core to their GTM. SA remote-friendly.', careersUrl: 'https://www.chargebee.com/jobs/', hiringSignal: 'Actively hiring RevOps', regionFriendly: true, isDefault: true },
  { name: 'HubSpot', track: 'GTM Operations', tier: 1, why: 'Global CRM leader, structured ops function, strong remote culture.', careersUrl: 'https://www.hubspot.com/careers', hiringSignal: 'GTM Ops and RevOps open', regionFriendly: true, isDefault: true },
  { name: 'Paddle', track: 'Revenue Operations', tier: 1, why: 'Payments/billing SaaS, UK-based but remote globally. RevOps critical.', careersUrl: 'https://www.paddle.com/careers', hiringSignal: 'Growing RevOps team', regionFriendly: true, isDefault: true },
  { name: 'Aircall', track: 'GTM Operations', tier: 2, why: 'B2B SaaS, voice platform. Ops-heavy GTM motion.', careersUrl: 'https://aircall.io/careers/', hiringSignal: 'Series C, scaling ops', regionFriendly: true, isDefault: true },
  { name: 'Deel', track: 'Business Operations', tier: 2, why: 'Remote-first payroll SaaS, SA hiring common, ops roles frequent.', careersUrl: 'https://www.deel.com/careers', hiringSignal: 'Expanding EMEA ops', regionFriendly: true, isDefault: true },
  { name: 'Remote.com', track: 'Revenue Operations', tier: 2, why: 'Built for distributed teams, strong RevOps function.', careersUrl: 'https://remote.com/careers', hiringSignal: 'RevOps and BizOps roles', regionFriendly: true, isDefault: true },
  { name: 'Salesforce', track: 'Revenue Operations', tier: 3, why: 'Largest CRM — competitive but strong ops function and Zoho crossover.', careersUrl: 'https://www.salesforce.com/company/careers/', hiringSignal: 'Always hiring, competitive', regionFriendly: false, isDefault: true },
]

const DEFAULT_KYLE: Company[] = [
  { name: 'Clio', track: 'Customer Success', tier: 1, why: 'Leading LegalTech SaaS. CS-first culture, strong remote hiring.', careersUrl: 'https://www.clio.com/careers/', hiringSignal: 'CSM roles open, legal fluency valued', regionFriendly: true, isDefault: true },
  { name: 'MyCase', track: 'Customer Success', tier: 1, why: 'Legal practice management, CS-driven growth, remote-first.', careersUrl: 'https://www.mycase.com/about/careers/', hiringSignal: 'Growing CS team', regionFriendly: true, isDefault: true },
  { name: 'Smokeball', track: 'Customer Success', tier: 1, why: 'Legal workflow SaaS, SA presence, values law firm relationship exp.', careersUrl: 'https://www.smokeball.com/careers', hiringSignal: 'CSM and Account Mgmt open', regionFriendly: true, isDefault: true },
  { name: 'Filevine', track: 'Customer Success', tier: 2, why: 'Legal case management, fast-growing, CSM roles recurring.', careersUrl: 'https://www.filevine.com/company/careers/', hiringSignal: 'CSM and AM roles', regionFriendly: true, isDefault: true },
  { name: 'Loom', track: 'Customer Success', tier: 2, why: 'Remote-first, CS-heavy, async culture.', careersUrl: 'https://www.loom.com/careers', hiringSignal: 'Growing CS team', regionFriendly: true, isDefault: true },
  { name: 'Hotjar', track: 'Customer Success', tier: 2, why: 'SA-founded, remote-first, strong team culture.', careersUrl: 'https://www.hotjar.com/careers/', hiringSignal: 'CS and support roles, Africa-friendly', regionFriendly: true, isDefault: true },
  { name: 'Intercom', track: 'Customer Success', tier: 3, why: 'Strong CS culture but competitive, mostly US/EU.', careersUrl: 'https://www.intercom.com/careers', hiringSignal: 'Lower volume, competitive', regionFriendly: false, isDefault: true },
]

const TIER_LABEL: Record<number, string> = { 1: 'High Probability', 2: 'Good Bet', 3: 'Stretch' }
const TIER_COLOR: Record<number, string> = { 1: '#22c55e', 2: '#2563eb', 3: '#64748b' }
const TIER_BG: Record<number, string> = { 1: '#0f2a1a', 2: '#1e3a5f', 3: '#1e293b' }

type CompanyCardProps = {
  company: Company
  accent: string
  isExpanded: boolean
  onToggle: () => void
  onOutreach: (c: Company) => void
  noteVal: string
  onNoteChange: (val: string) => void
  onNoteSave: () => void
  saving: boolean
}

function CompanyCard({
  company, accent, isExpanded, onToggle, onOutreach,
  noteVal, onNoteChange, onNoteSave, saving,
}: CompanyCardProps) {
  const tier = company.tier
  return (
    <div style={{
      background: '#0d1117',
      border: `1px solid ${isExpanded ? accent : '#1e293b'}`,
      borderLeft: `3px solid ${isExpanded ? accent : TIER_COLOR[tier]}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: TIER_BG[tier],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: TIER_COLOR[tier],
        }}>
          {company.name[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{company.name}</span>
            {company.regionFriendly && (
              <span style={{ fontSize: 10, background: '#0f2a1a', color: '#4ade80', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                🌍 Global
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
            {company.track} · {company.hiringSignal}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          
            href={company.careersUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 10px', borderRadius: 6,
              border: '1px solid #334155', background: 'transparent',
              color: '#94a3b8', fontSize: 12, fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            Careers ↗
          </a>
          <button
            onClick={onToggle}
            style={{
              padding: '6px 10px', borderRadius: 6,
              border: `1px solid ${isExpanded ? accent : '#334155'}`,
              background: isExpanded ? accent + '22' : 'transparent',
              color: isExpanded ? 'white' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {isExpanded ? '▲ Less' : '▼ More'}
          </button>
          <button
            onClick={() => onOutreach(company)}
            style={{
              padding: '6px 10px', borderRadius: 6,
              border: 'none', background: accent,
              color: 'white', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            + Outreach
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid #1e293b', padding: 16, background: '#080c12' }}>
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#94a3b8', lineHeight: 1.6,
          }}>
            💡 {company.why}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: accent, fontSize: 12, textDecoration: 'none' }}>
                Website ↗
              </a>
            )}
            {company.linkedinUrl && (
              <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: accent, fontSize: 12, textDecoration: 'none' }}>
                LinkedIn ↗
              </a>
            )}
          </div>

          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Research Notes
          </div>
          <textarea
            value={noteVal}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Who is the hiring manager? What roles are open? What is the ops gap?"
            rows={3}
            disabled={!company.id}
            style={{
              width: '100%', padding: '10px 12px',
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, color: company.id ? '#e2e8f0' : '#475569',
              fontSize: 13, outline: 'none', resize: 'vertical',
              marginBottom: 10, fontFamily: 'inherit',
            }}
          />
          {company.id ? (
            <button
              onClick={onNoteSave}
              disabled={saving}
              style={{
                padding: '7px 16px', borderRadius: 6, border: 'none',
                background: saving ? '#334155' : accent,
                color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
          ) : (
            <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>
              Add via + Add Company to save notes to your DB
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type OutreachModalProps = {
  company: Company
  accent: string
  onClose: () => void
}

function OutreachModal({ company, accent, onClose }: OutreachModalProps) {
  const [platform, setPlatform] = useState('LinkedIn')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid #1e293b',
        borderTop: `3px solid ${accent}`,
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 460,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Log Outreach</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{company.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Contact Name</div>
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="e.g. Sarah Chen"
            style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Their Role</div>
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Head of Operations"
            style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Platform</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['LinkedIn', 'Email', 'Twitter'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${platform === p ? accent : '#334155'}`,
                  background: platform === p ? accent + '22' : 'transparent',
                  color: platform === p ? 'white' : '#64748b', cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Message Sent</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Paste the message you sent…"
            rows={4}
            style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            style={{ flex: 2, padding: 11, borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Log Outreach ✓
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = { activeUser: 'caylah' | 'kyle' }

export default function CompanyTargets({ activeUser }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [globalOnly, setGlobalOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [outreachTarget, setOutreachTarget] = useState<Company | null>(null)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/companies?user=' + activeUser)
      const data = await res.json()
      setCompanies(Array.isArray(data) && data.length > 0 ? data : (isKyle ? DEFAULT_KYLE : DEFAULT_CAYLAH))
    } catch {
      setCompanies(isKyle ? DEFAULT_KYLE : DEFAULT_CAYLAH)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [activeUser])

  const filtered = companies
    .filter(c => !globalOnly || c.regionFriendly)
    .sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : (b.regionFriendly ? 1 : 0) - (a.regionFriendly ? 1 : 0))

  const saveNotes = async (company: Company) => {
    if (!company.id) return
    setSavingNotes(company.id)
    try {
      await fetch('/api/companies/' + company.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteDrafts[company.id] ?? company.notes, lastChecked: new Date().toISOString() }),
      })
      await load()
    } finally {
      setSavingNotes(null)
    }
  }

  if (loading) {
    return <div style={{ color: '#64748b', padding: 40, textAlign: 'center', fontSize: 14 }}>Loading companies…</div>
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">Target Companies</div>
          <div className="section-sub">Direct outreach targets. Start at Tier 1. Careers page first.</div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
        >
          + Add Company
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setGlobalOnly(g => !g)}
          style={{
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${globalOnly ? accent : '#334155'}`,
            background: globalOnly ? accent + '22' : 'transparent',
            color: globalOnly ? 'white' : '#64748b',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          🌍 Global-friendly only
        </button>
        <span style={{ fontSize: 12, color: '#334155' }}>
          {filtered.length} companies · {filtered.filter(c => c.regionFriendly).length} global-friendly
        </span>
      </div>

      {[1, 2, 3].map(tier => {
        const group = filtered.filter(c => c.tier === tier)
        if (!group.length) return null
        return (
          <div key={tier} style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 10, paddingBottom: 8,
              borderBottom: `1px solid ${TIER_COLOR[tier]}33`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: TIER_COLOR[tier] }}>
                Tier {tier}
              </span>
              <span style={{ fontSize: 11, color: '#475569' }}>—</span>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{TIER_LABEL[tier]}</span>
              <span style={{ fontSize: 11, background: '#1e293b', color: '#475569', padding: '1px 8px', borderRadius: 20 }}>
                {group.length}
              </span>
            </div>

            {group.map(company => {
              const cardId = company.id || 'default-' + company.name
              const isExpanded = expandedId === cardId
              const noteVal = company.id
                ? (noteDrafts[company.id] ?? company.notes ?? '')
                : (company.notes ?? '')

              return (
                <CompanyCard
                  key={cardId}
                  company={company}
                  accent={accent}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedId(isExpanded ? null : cardId)}
                  onOutreach={setOutreachTarget}
                  noteVal={noteVal}
                  onNoteChange={val => {
                    if (company.id) setNoteDrafts(prev => ({ ...prev, [company.id!]: val }))
                  }}
                  onNoteSave={() => saveNotes(company)}
                  saving={savingNotes === company.id}
                />
              )
            })}
          </div>
        )
      })}

      {outreachTarget && (
        <OutreachModal
          company={outreachTarget}
          accent={accent}
          onClose={() => setOutreachTarget(null)}
        />
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