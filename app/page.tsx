'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import DailyActions from '@/components/DailyActions'
import JobBoard from '@/components/JobBoard'
import CompanyTargets from '@/components/CompanyTargets'
import Metrics from '@/components/Metrics'

export default function Home() {
  const [activeUser, setActiveUser] = useState<'caylah' | 'kyle'>('caylah')
  const [activeTab, setActiveTab] = useState<'actions' | 'jobs' | 'companies' | 'metrics'>('actions')

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Header activeUser={activeUser} setActiveUser={setActiveUser} />
      
      {/* Tab Navigation */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 pt-2">
            {[
              { id: 'actions', label: '⚡ Today' },
              { id: 'jobs', label: '🎯 Opportunities' },
              { id: 'companies', label: '🏢 Companies' },
              { id: 'metrics', label: '📊 Metrics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'actions' && <DailyActions activeUser={activeUser} />}
        {activeTab === 'jobs' && <JobBoard activeUser={activeUser} />}
        {activeTab === 'companies' && <CompanyTargets activeUser={activeUser} />}
        {activeTab === 'metrics' && <Metrics activeUser={activeUser} />}
      </div>
    </main>
  )
}
