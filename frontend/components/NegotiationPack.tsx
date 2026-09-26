'use client'

import { useState, useEffect } from 'react'

interface RedlineSuggestion {
  clause_id: number
  original_text: string
  suggested_text: string
  rationale: string
  statute_basis?: string
}

interface NegotiationPackProps {
  sessionId: string
}

export default function NegotiationPack({ sessionId }: NegotiationPackProps) {
  const [redlines, setRedlines] = useState<RedlineSuggestion[]>([])
  const [executiveSummary, setExecutiveSummary] = useState<string>('')
  const [lawyerQuestions, setLawyerQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchPack = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/negotiation/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setRedlines(data.high_risk_clauses || [])
          setExecutiveSummary(data.executive_summary || '')
          setLawyerQuestions(data.lawyer_questions || [])
        }
      } catch (err) {
        console.error('Negotiation pack error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPack()
  }, [sessionId])

  const copyQuestions = () => {
    if (lawyerQuestions.length > 0) {
      navigator.clipboard.writeText(lawyerQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))] mb-4" />
        <p className="text-base font-medium">Generating actionable negotiation pack & checklist...</p>
        <p className="text-xs mt-1">Balancing clauses under Indian contract statutes</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-1">📋 Actionable Negotiation & Consultation Pack</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Empowering users with specific counter-proposals and consultation questions for legal counsel.
        </p>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="p-5 rounded-xl bg-[hsl(var(--secondary))]/50 border border-[hsl(var(--border))]">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2 text-[hsl(var(--primary))]">
            <span>📑</span> Executive Risk & Obligations Summary
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{executiveSummary}</p>
        </div>
      )}

      {/* Lawyer Questions Checklist */}
      {lawyerQuestions.length > 0 && (
        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                <span>⚖️</span> Questions to Ask Your Legal Professional (DLSA / Advocate)
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Take these specific questions to your consultation or legal aid advisor to clarify your exposure.
              </p>
            </div>
            <button
              onClick={copyQuestions}
              className="px-3 py-1.5 rounded-lg glass text-xs font-medium hover:text-[hsl(var(--foreground))] transition-all"
            >
              {copied ? '✓ Copied!' : '📋 Copy Questions'}
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {lawyerQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-[hsl(var(--background))]/60 border border-[hsl(var(--border))]">
                <input
                  type="checkbox"
                  id={`q-${idx}`}
                  className="mt-1 rounded border-gray-600 text-[hsl(var(--primary))] focus:ring-0 cursor-pointer"
                />
                <label htmlFor={`q-${idx}`} className="text-sm leading-snug cursor-pointer select-none">
                  {q}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Redlines */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span>✍️</span> Clause Redline Proposals
        </h3>

        {redlines.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-xl">
            <p>No high-risk clauses detected, or debate is still in progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {redlines.map((r, i) => (
              <div key={i} className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
                <div className="p-4 bg-red-500/5 border-b border-[hsl(var(--border))]">
                  <div className="text-xs text-red-400 font-semibold mb-2">❌ Original Clause #{r.clause_id}</div>
                  <p className="text-sm line-through text-[hsl(var(--muted-foreground))] leading-relaxed">{r.original_text}</p>
                </div>
                <div className="p-4 bg-emerald-500/5 space-y-2">
                  <div className="text-xs text-emerald-400 font-semibold">✅ Recommended Fair Counter-Draft</div>
                  <p className="text-sm font-medium text-emerald-200 leading-relaxed">{r.suggested_text}</p>
                  <div className="pt-2 text-xs text-[hsl(var(--muted-foreground))] flex flex-col gap-1 border-t border-[hsl(var(--border))]/50">
                    <p><span className="font-semibold text-[hsl(var(--foreground))]">Rationale:</span> {r.rationale}</p>
                    {r.statute_basis && (
                      <p className="text-blue-400 font-mono">📖 Statutory Basis: {r.statute_basis}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
