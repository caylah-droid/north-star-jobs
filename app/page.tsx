'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Feed from '@/components/Feed'
import DailyActions from '@/components/DailyActions'
import JobBoard from '@/components/JobBoard'
import CompanyTargets from '@/components/CompanyTargets'
import Metrics from '@/components/Metrics'

export default function Home() {
  const [activeUser, setActiveUser] = useState<'caylah' | 'kyle'>('caylah')
  const [activeTab, setActiveTab] = useState<'feed' | 'actions' | 'jobs' | 'companies' | 'metrics'>('feed')

  return (
    <main>
      <Header activeUser={activeUser} setActiveUser={setActiveUser} />

      <div className="tab-nav">
        {[
          { id: 'feed', label: '🔭 Feed' },
          { id: 'actions', label: '⚡ Today' },
          { id: 'jobs', label: '🎯 Pipeline' },
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

      <div className="content">
        {activeTab === 'feed' && <Feed activeUser={activeUser} />}
        {activeTab === 'actions' && <DailyActions activeUser={activeUser} />}
        {activeTab === 'jobs' && <JobBoard activeUser={activeUser} />}
        {activeTab === 'companies' && <CompanyTargets activeUser={activeUser} />}
        {activeTab === 'metrics' && <Metrics activeUser={activeUser} />}
      </div>
    </main>
  )
}
