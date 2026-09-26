'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ClauseCard from './ClauseCard'
import RiskBadge from './RiskBadge'

interface ClauseDebate {
  clauseId: number
  clauseText: string
  category: string
  riskLevel?: 'Low' | 'Medium' | 'High'
  advocate: string
  shadowParty: string
  arbiter: string
}

interface DebateStreamProps {
  sessionId: string
}

export default function DebateStream({ sessionId }: DebateStreamProps) {
  const [clauses, setClauses] = useState<ClauseDebate[]>([])
  const [activeClauseId, setActiveClauseId] = useState<number | null>(null)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [overallRisk, setOverallRisk] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/debate/${sessionId}`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      ws.send(JSON.stringify({ type: 'start_analysis', session_id: sessionId }))
    }

    ws.onmessage = (event) => {
      const msg = jsonParseSafe(event.data)
      if (!msg) return

      switch (msg.type) {
        case 'clause_start':
          setClauses(prev => {
            const exists = prev.some(c => c.clauseId === msg.clause_id)
            if (exists) return prev
            return [...prev, {
              clauseId: msg.clause_id,
              clauseText: msg.clause_text,
              category: msg.category,
              advocate: '',
              shadowParty: '',
              arbiter: '',
            }]
          })
          setActiveClauseId(msg.clause_id)
          break

        case 'agent_start':
          setCurrentAgent(msg.agent)
          break

        case 'agent_delta':
          setClauses(prev => prev.map(c => {
            if (c.clauseId !== msg.clause_id) return c
            const key = msg.agent === 'advocate' ? 'advocate'
              : msg.agent === 'shadow_party' ? 'shadowParty' : 'arbiter'
            return { ...c, [key]: c[key] + msg.content }
          }))
          break

        case 'agent_complete':
          setCurrentAgent(null)
          break

        case 'arbiter_verdict':
          setClauses(prev => prev.map(c =>
            c.clauseId === msg.clause_id
              ? { ...c, riskLevel: msg.risk }
              : c
          ))
          break

        case 'debate_complete':
          setIsComplete(true)
          setOverallRisk(msg.overall_risk)
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onerror = () => {
      setIsConnected(false)
    }

    return ws
  }, [sessionId])

  useEffect(() => {
    const ws = connectWebSocket()
    return () => ws.close()
  }, [connectWebSocket])

  // Auto-scroll to active clause smoothly
  useEffect(() => {
    if (scrollRef.current && activeClauseId) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [activeClauseId, clauses])

  const highRiskCount = clauses.filter(c => c.riskLevel === 'High').length
  const mediumRiskCount = clauses.filter(c => c.riskLevel === 'Medium').length
  const lowRiskCount = clauses.filter(c => c.riskLevel === 'Low').length

  return (
    <div className="space-y-6">
      {/* HUD Control & Status Strip */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? (isComplete ? 'bg-emerald-400' : 'bg-violet-400') : 'bg-rose-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isConnected ? (isComplete ? 'bg-emerald-500' : 'bg-violet-500') : 'bg-rose-500'
              }`} />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-200">
              {isConnected ? (isComplete ? 'Analysis Finished' : 'Adversarial Stream Active') : 'Connection Reconnecting...'}
            </span>
          </div>

          {activeClauseId && !isComplete && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Debating Clause #{activeClauseId}
            </span>
          )}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2">
          {clauses.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                {clauses.length} Clauses
              </span>
              {highRiskCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {highRiskCount} High Risk
                </span>
              )}
              {mediumRiskCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {mediumRiskCount} Medium
                </span>
              )}
              {lowRiskCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lowRiskCount} Low
                </span>
              )}
            </div>
          )}

          {overallRisk && (
            <div className="pl-3 border-l border-white/10 flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Overall:</span>
              <RiskBadge level={overallRisk as 'Low' | 'Medium' | 'High'} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Empty State / Loading Animation */}
      {clauses.length === 0 && isConnected && (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/10 space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⚔️</div>
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Summoning Adversarial Agents</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Extracting legal taxonomy under Indian contract statutes and initializing Advocate, Shadow Counsel, and Judicial Arbiter...
            </p>
          </div>
        </div>
      )}

      {/* Clause Cards Accordion Stream */}
      <div ref={scrollRef} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {clauses.map((clause) => (
          <ClauseCard
            key={clause.clauseId}
            clauseId={clause.clauseId}
            clauseText={clause.clauseText}
            category={clause.category}
            riskLevel={clause.riskLevel}
            advocateContent={clause.advocate || undefined}
            shadowContent={clause.shadowParty || undefined}
            arbiterContent={clause.arbiter || undefined}
            isActive={clause.clauseId === activeClauseId}
            isStreaming={clause.clauseId === activeClauseId && currentAgent !== null}
          />
        ))}
      </div>
    </div>
  )
}

function jsonParseSafe(data: string) {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}
