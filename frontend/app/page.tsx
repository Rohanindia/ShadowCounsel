'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DocumentUpload from '@/components/DocumentUpload'

export default function HomePage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Upload failed')
      }

      const data = await response.json()
      router.push(`/analyze/${data.session_id}`)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [router])

  const handleDemoLaunch = async (demoType: string) => {
    setIsDemoLoading(demoType)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/demo/${demoType}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to launch demo')
      const data = await response.json()
      router.push(`/analyze/${data.session_id}`)
    } catch (err) {
      console.error('Demo error:', err)
      alert('Could not start sample demo. You can also upload a document directly.')
    } finally {
      setIsDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col justify-between">
      {/* Top Brand Navigation */}
      <header aria-label="ShadowCounsel primary navigation" className="border-b border-white/[0.06] px-6 py-4 backdrop-blur-md sticky top-0 z-50 bg-[#07090e]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div role="img" aria-label="ShadowCounsel logo" className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-400 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-[#0b0e18] rounded-[11px] flex items-center justify-center text-base">
                ⚖️
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white font-serif">
                Shadow<span className="text-violet-400">Counsel</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20">
                Adversarial AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-full glass border-white/5" aria-label="Grounded in Indian Statute Law">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Grounded in Indian Statute Law</span>
            </div>
            <button
              onClick={() => handleDemoLaunch('rental')}
              disabled={isDemoLoading !== null}
              aria-label="Load instant sample demo document"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isDemoLoading ? 'Loading Demo...' : '✦ Instant Sample Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Action Section */}
      <main aria-label="Contract analysis workspace" className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Authority Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-violet-300 border border-violet-500/30 mb-8 animate-pulse-subtle">
          <span className="text-amber-400" aria-hidden="true">⚡</span>
          <span>GenAI for Legal Assistance &amp; Document Sovereignty</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 font-serif max-w-4xl leading-[1.1]">
          Understand what you sign. <br className="hidden sm:block" />
          <span className="purple-gradient-text">Before it costs you.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-10">
          Generic AI summarizes; <strong className="text-white font-medium">ShadowCounsel</strong> pits three adversarial AI agents against each other live — stress-testing contract terms, exposing traps, and drafting enforceable counter-proposals under Indian Law.
        </p>

        {/* Document Upload Zone */}
        <div className="w-full max-w-2xl mb-8">
          <DocumentUpload onUpload={handleUpload} isUploading={isUploading} />
        </div>

        {/* 1-Click Interactive Sample Demos */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-3 text-xs uppercase tracking-wider text-slate-400 font-mono">
            <span className="h-[1px] w-8 bg-white/10" aria-hidden="true" />
            <span>Or try instant sample documents</span>
            <span className="h-[1px] w-8 bg-white/10" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <button
              onClick={() => handleDemoLaunch('rental')}
              disabled={isDemoLoading !== null}
              aria-label="Load residential lease sample agreement (high risk)"
              className="p-4 rounded-2xl glass-card hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white group-hover:text-violet-300 flex items-center gap-2">
                  <span aria-hidden="true">🏠</span> Residential Lease (11-Mo)
                </span>
                <span className="text-xs text-amber-400 font-mono font-medium">High Risk</span>
              </div>
              <p className="text-xs text-slate-400">
                10-month deposit, unilateral lock-in forfeiture, unannounced landlord inspection.
              </p>
            </button>

            <button
              onClick={() => handleDemoLaunch('case_study')}
              disabled={isDemoLoading !== null}
              aria-label="Load BNS criminal case brief study"
              className="p-4 rounded-2xl glass-card hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white group-hover:text-violet-300 flex items-center gap-2">
                  <span aria-hidden="true">⚖️</span> BNS Criminal Case Brief
                </span>
                <span className="text-xs text-blue-400 font-mono font-medium">BNS 2023</span>
              </div>
              <p className="text-xs text-slate-400">
                Fictional case study under Bharatiya Nyaya Sanhita BNS 318(4) &amp; BSA 63.
              </p>
            </button>
          </div>
        </div>

        {/* Feature Grid / Competitive Edge */}
        <section aria-label="Key competitive features" className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">
              🛡️
            </div>
            <h3 className="text-base font-semibold text-white">Your Personal Advocate</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Tenaciously highlights one-sided obligations, missing tenant/employee rights, and hidden financial penalties that regular summaries miss.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg text-red-400">
              👹
            </div>
            <h3 className="text-base font-semibold text-white">Shadow Opposing Counsel</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Simulates how the other party&apos;s ruthless corporate lawyer will exploit ambiguous wording, notice loopholes, and dispute covenants.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg text-blue-400">
              ⚖️
            </div>
            <h3 className="text-base font-semibold text-white">Indian Statute Arbiter</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Impartially scores clause enforceability against the Indian Contract Act 1872, Consumer Protection Act, and state tenancy codes.
            </p>
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-white/[0.06] py-6 px-6 text-center text-xs text-slate-500">
        <p>ShadowCounsel • Autonomous Adversarial AI Legal Document Analyzer for Indian Contracts</p>
      </footer>
    </div>
  )
}
