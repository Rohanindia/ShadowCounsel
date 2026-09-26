'use client'

import { useState } from 'react'

interface WhatIfPanelProps {
  sessionId: string
}

interface Consequence {
  matched_clause_id: number
  matched_clause_text: string
  financial_range?: string
  legal_consequences: string
  timeline?: string
  likelihood: string
}

export default function WhatIfPanel({ sessionId }: WhatIfPanelProps) {
  const [scenario, setScenario] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [consequences, setConsequences] = useState<Consequence[]>([])
  const [practicalAdvice, setPracticalAdvice] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!scenario.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, scenario }),
      })
      const data = await response.json()
      setConsequences(data.consequences || [])
      setPracticalAdvice(data.practical_advice || null)
    } catch (error) {
      console.error('What-if error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">🔮 What-If Scenario Simulator & Q&A</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ask hypothetical questions or real concerns about your contract to understand practical outcomes and rights.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='e.g., "What if I leave before the notice period?"'
          className="flex-1 px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !scenario.trim()}
          className="px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Scenario'}
        </button>
      </div>

      {/* Example scenarios */}
      <div className="flex flex-wrap gap-2">
        {[
          'What if I leave before the notice period?',
          'What if I miss two rent payments?',
          'What if the landlord refuses to return my deposit?',
          'What if I need to terminate for cause immediately?',
        ].map((example) => (
          <button
            key={example}
            onClick={() => setScenario(example)}
            className="px-3 py-1.5 rounded-full glass text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Practical Advice Banner */}
      {practicalAdvice && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
          <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
            <span>💡</span> Practical Next Steps
          </div>
          <p className="text-sm text-[hsl(var(--foreground))]">{practicalAdvice}</p>
        </div>
      )}

      {/* Consequences list */}
      {consequences.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Potential Outcomes & Clause Exposure
          </h3>
          {consequences.map((c, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-3 bg-[hsl(var(--card))]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                  Mapped to Clause #{c.matched_clause_id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  c.likelihood === 'likely' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {c.likelihood.toUpperCase()}
                </span>
              </div>
              {c.financial_range && (
                <p className="text-lg font-bold text-red-400 flex items-center gap-2">
                  <span>💰</span> Financial Exposure: {c.financial_range}
                </p>
              )}
              <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{c.legal_consequences}</p>
              {c.timeline && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                  ⏱️ Timeline: {c.timeline}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
