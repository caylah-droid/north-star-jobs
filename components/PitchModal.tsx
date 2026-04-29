'use client'

import { useState } from 'react'

type Props = {
  activeUser: 'caylah' | 'kyle'
  company: string
  role: string
  description: string | null
  platform: string
  onClose: () => void
}

export default function PitchModal({ activeUser, company, role, description, platform, onClose }: Props) {
  const isKyle = activeUser === 'kyle'
  const accent = isKyle ? '#7c3aed' : '#2563eb'

  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [linkedinOutreach, setLinkedinOutreach] = useState('')
  const [error, setError] = useState('')
  const [copiedCover, setCopiedCover] = useState(false)
  const [copiedLinkedin, setCopiedLinkedin] = useState(false)
  const [activeTab, setActiveTab] = useState<'cover' | 'linkedin'>('cover')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeUser,
          company,
          role,
          description,
          platform,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError('Generation failed. Please try again.')
      } else {
        setCoverLetter(data.coverLetter)
        setLinkedinOutreach(data.linkedinOutreach)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const copy = async (text: string, type: 'cover' | 'linkedin') => {
    await navigator.clipboard.writeText(text)
    if (type === 'cover') {
      setCopiedCover(true)
      setTimeout(() => setCopiedCover(false), 2000)
    } else {
      setCopiedLinkedin(true)
      setTimeout(() => setCopiedLinkedin(false), 2000)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Generate Pitch</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              {role} at {company}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#64748b', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Generate button */}
        {!coverLetter && (
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: accent, color: 'white',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 16,
            }}
          >
            {loading ? '✨ Generating your pitch...' : '✨ Generate Pitch'}
          </button>
        )}

        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}

        {/* Results */}
        {coverLetter && (
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { id: 'cover', label: '📄 Cover Letter' },
                { id: 'linkedin', label: '💼 LinkedIn Outreach' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    background: activeTab === tab.id ? accent : '#1e293b',
                    color: activeTab === tab.id ? 'white' : '#64748b',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cover Letter */}
            {activeTab === 'cover' && (
              <div>
                <div style={{
                  background: '#1e293b', borderRadius: 10,
                  padding: 16, marginBottom: 12,
                  fontSize: 13, color: '#e2e8f0',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                  {coverLetter}
                </div>
                <button
                  onClick={() => copy(coverLetter, 'cover')}
                  style={{
                    width: '100%', padding: 10,
                    background: copiedCover ? '#166534' : '#1e293b',
                    color: copiedCover ? '#4ade80' : '#94a3b8',
                    border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copiedCover ? '✓ Copied!' : '📋 Copy Cover Letter'}
                </button>
              </div>
            )}

            {/* LinkedIn */}
            {activeTab === 'linkedin' && (
              <div>
                <div style={{
                  background: '#1e293b', borderRadius: 10,
                  padding: 16, marginBottom: 12,
                  fontSize: 13, color: '#e2e8f0',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                  {linkedinOutreach}
                </div>
                <button
                  onClick={() => copy(linkedinOutreach, 'linkedin')}
                  style={{
                    width: '100%', padding: 10,
                    background: copiedLinkedin ? '#166534' : '#1e293b',
                    color: copiedLinkedin ? '#4ade80' : '#94a3b8',
                    border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {copiedLinkedin ? '✓ Copied!' : '📋 Copy LinkedIn Message'}
                </button>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              style={{
                width: '100%', padding: 10, marginTop: 10,
                background: 'transparent', color: '#64748b',
                border: '1px solid #1e293b', borderRadius: 8,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              {loading ? 'Regenerating...' : '🔄 Regenerate'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
