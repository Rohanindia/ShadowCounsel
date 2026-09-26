'use client'

import { useState } from 'react'
import RiskBadge from './RiskBadge'
import AgentMessage from './AgentMessage'

interface ClauseCardProps {
  clauseId: number
  clauseText: string
  category: string
  riskLevel?: 'Low' | 'Medium' | 'High'
  advocateContent?: string
  shadowContent?: string
  arbiterContent?: string
  isActive?: boolean
  isStreaming?: boolean
}

export default function ClauseCard({
  clauseId,
  clauseText,
  category,
  riskLevel,
  advocateContent,
  shadowContent,
  arbiterContent,
  isActive = false,
  isStreaming = false,
}: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(isActive || isStreaming || !!riskLevel)

  // Border glow based on active or risk state
  const riskBorderColor =
    riskLevel === 'High'
      ? 'border-rose-500/40 hover:border-rose-500/60'
      : riskLevel === 'Medium'
      ? 'border-amber-500/30 hover:border-amber-500/50'
      : riskLevel === 'Low'
      ? 'border-emerald-500/30 hover:border-emerald-500/50'
      : 'border-white/10 hover:border-white/20'

  return (
    <div
      className={`rounded-2xl transition-all duration-300 glass-card overflow-hidden ${
        isActive
          ? 'border-2 border-violet-500 shadow-xl shadow-violet-500/10'
          : `border ${riskBorderColor}`
      }`}
    >
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.03] transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-semibold text-slate-300">
            #{clauseId}
          </span>
          <div>
            <span className="text-sm font-semibold text-white font-serif">{category}</span>
            <p className="text-xs text-slate-400 font-mono line-clamp-1 max-w-md mt-0.5">
              {clauseText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {riskLevel ? (
            <RiskBadge level={riskLevel} size="sm" />
          ) : isActive ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-violet-300 bg-violet-500/20 border border-violet-500/30 animate-pulse">
              Debating...
            </span>
          ) : null}

          <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-slate-400">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 space-y-4 border-t border-white/[0.06] pt-4">
          {/* Original Clause Box */}
          <div className="rounded-xl bg-[#06080e] border border-white/[0.08] p-4 relative">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Original Provision Wording</span>
              <span className="text-slate-500">Contract Source</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-mono">
              {clauseText}
            </p>
          </div>

          {/* 3 Adversarial Agent Grid */}
          <div className="space-y-3">
            {advocateContent && (
              <AgentMessage
                agent="advocate"
                content={advocateContent}
                isStreaming={isStreaming && !shadowContent}
              />
            )}
            {shadowContent && (
              <AgentMessage
                agent="shadow_party"
                content={shadowContent}
                isStreaming={isStreaming && !arbiterContent}
              />
            )}
            {arbiterContent && (
              <AgentMessage
                agent="arbiter"
                content={arbiterContent}
                isStreaming={isStreaming}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
