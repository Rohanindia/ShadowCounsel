'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import DebateStream from '@/components/DebateStream'
import WhatIfPanel from '@/components/WhatIfPanel'
import NegotiationPack from '@/components/NegotiationPack'

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [activeTab, setActiveTab] = useState<'debate' | 'whatif' | 'negotiate'>('debate')
  const [copied, setCopied] = useState(false)

  const copySessionLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen mesh-bg pb-16 flex flex-col">
      {/* Top Workspace Header */}
      <header aria-label="Analysis workspace navigation" className="border-b border-white/[0.08] px-6 py-4 sticky top-0 z-30 bg-[#07090e]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Return to upload page"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div
                role="img"
                aria-label="ShadowCounsel logo"
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-sm shadow-md"
              >
                ⚖️
              </div>
              <div>
                <h1 className="text-base font-bold text-white font-serif leading-tight">
                  Shadow<span className="text-violet-400">Counsel</span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 font-mono" aria-label={`Session ID: ${sessionId}`}>
                    Session: {sessionId.slice(0, 8)}...
                  </span>
                  <button
                    onClick={copySessionLink}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-mono underline cursor-pointer"
                    aria-label={copied ? 'Session link copied to clipboard' : 'Copy session link to clipboard'}
                    aria-live="polite"
                  >
                    {copied ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300 px-3 py-1.5 rounded-xl glass border border-white/5" aria-label="Status: Adversarial Legal Intelligence active">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" aria-hidden="true" />
              <span>Adversarial Legal Intelligence</span>
            </div>
          </div>
        </div>
      </header>

      {/* Segmented Tab Navigation */}
      <nav aria-label="Analysis sections" className="border-b border-white/[0.06] bg-[#090c14]/60 backdrop-blur-sm sticky top-[65px] z-20">
        <div
          role="tablist"
          aria-label="Analysis view options"
          className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto py-2.5"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'debate'}
            aria-controls="panel-debate"
            id="tab-debate"
            onClick={() => setActiveTab('debate')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'debate'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span aria-hidden="true">⚔️</span>
            <span>Live Multi-Agent Debate</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'whatif'}
            aria-controls="panel-whatif"
            id="tab-whatif"
            onClick={() => setActiveTab('whatif')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'whatif'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span aria-hidden="true">🔮</span>
            <span>What-If Scenario Sandbox</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'negotiate'}
            aria-controls="panel-negotiate"
            id="tab-negotiate"
            onClick={() => setActiveTab('negotiate')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'negotiate'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span aria-hidden="true">📋</span>
            <span>Negotiation &amp; Lawyer Checklist</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div
          id="panel-debate"
          role="tabpanel"
          aria-labelledby="tab-debate"
          hidden={activeTab !== 'debate'}
        >
          {activeTab === 'debate' && <DebateStream sessionId={sessionId} />}
        </div>
        <div
          id="panel-whatif"
          role="tabpanel"
          aria-labelledby="tab-whatif"
          hidden={activeTab !== 'whatif'}
        >
          {activeTab === 'whatif' && <WhatIfPanel sessionId={sessionId} />}
        </div>
        <div
          id="panel-negotiate"
          role="tabpanel"
          aria-labelledby="tab-negotiate"
          hidden={activeTab !== 'negotiate'}
        >
          {activeTab === 'negotiate' && <NegotiationPack sessionId={sessionId} />}
        </div>
      </main>
    </div>
  )
}
