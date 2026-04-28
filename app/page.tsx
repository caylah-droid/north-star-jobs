'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import DailyActions from '@/components/DailyActions'
import JobBoard from '@/components/JobBoard'
import CompanyTargets from '@/components/CompanyTargets'
import Metrics from '@/components/Metrics'

export default function Home() {
  const [activeUser, setActiveUser] = useState<'caylah' | 'kyle'>('caylah')
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'jobs' | 'companies' | 'metrics'
  >('dashboard')

  return (
    <main>
      <Header activeUser={activeUser} setActiveUser={setActiveUser} />

      {/* NAV */}
      <div className="tab-nav">
        {[
          { id: 'dashboard', label: '🚀 Dashboard' },
          { id: 'jobs', label: '🎯 Opportunities' },
          { id: 'companies', label: '🏢 Companies' },
          { id: 'metrics', label: '📊 Metrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="content">
        {activeTab === 'dashboard' && (
          <>
            {/* 🔥 TOP JOBS */}
            <JobBoard activeUser={activeUser} limit={5} />

            {/* ⚡ ACTIONS */}
            <DailyActions activeUser={activeUser} />

            {/* 📊 METRICS */}
            <Metrics activeUser={activeUser} compact />
          </>
        )}

        {activeTab === 'jobs' && (
          <JobBoard activeUser={activeUser} />
        )}

        {activeTab === 'companies' && (
          <CompanyTargets activeUser={activeUser} />
        )}

        {activeTab === 'metrics' && (
          <Metrics activeUser={activeUser} />
        )}
      </div>
    </main>
  )
}
