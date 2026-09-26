interface AgentMessageProps {
  agent: 'advocate' | 'shadow_party' | 'arbiter'
  content: string
  isStreaming?: boolean
}

const agentConfig = {
  advocate: {
    label: 'User Protection Advocate',
    role: 'Tenacious Defense of Your Rights',
    icon: '🛡️',
    borderClass: 'border-l-4 border-l-emerald-400 border-emerald-500/20 bg-emerald-950/20',
    headerColor: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  shadow_party: {
    label: 'Shadow Opposing Counsel',
    role: 'Counterparty Exploitation & Enforcement',
    icon: '👹',
    borderClass: 'border-l-4 border-l-rose-500 border-rose-500/20 bg-rose-950/20',
    headerColor: 'text-rose-300',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  arbiter: {
    label: 'Judicial Arbiter (Indian Statute Law)',
    role: 'Enforceability Verdict & Statutory Precedent',
    icon: '⚖️',
    borderClass: 'border-l-4 border-l-indigo-400 border-indigo-500/20 bg-indigo-950/25',
    headerColor: 'text-indigo-300',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
}

export default function AgentMessage({ agent, content, isStreaming = false }: AgentMessageProps) {
  const config = agentConfig[agent]

  return (
    <div className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 ${config.borderClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`font-semibold text-sm tracking-tight ${config.headerColor}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
          {config.role}
        </span>
      </div>

      <div className={`text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans ${isStreaming ? 'streaming-cursor' : ''}`}>
        {content}
      </div>
    </div>
  )
}
