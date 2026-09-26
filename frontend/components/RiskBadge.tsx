interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High'
  size?: 'sm' | 'md'
}

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const styles = {
    Low: {
      pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
      dot: 'bg-emerald-400 shadow-emerald-400/50 shadow-[0_0_8px]',
      label: 'Low Risk',
    },
    Medium: {
      pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
      dot: 'bg-amber-400 shadow-amber-400/50 shadow-[0_0_8px]',
      label: 'Medium Risk',
    },
    High: {
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse',
      dot: 'bg-rose-400 shadow-rose-400/80 shadow-[0_0_10px]',
      label: 'High Risk Trap',
    },
  }

  const current = styles[level] || styles.Medium

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-sm',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight ${current.pill} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  )
}
