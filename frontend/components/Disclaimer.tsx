export default function Disclaimer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-t border-amber-500/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            LEGAL NOTICE
          </span>
          <span className="text-slate-400">
            ShadowCounsel provides legal analysis and assistance for educational & informational purposes. Not a replacement for a licensed advocate.
          </span>
        </div>
        <a
          href="https://nalsa.gov.in/lsam/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-400/50 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Find Free Legal Aid (NALSA / DLSA)</span>
          <span>→</span>
        </a>
      </div>
    </footer>
  )
}
