'use client'

import { useCallback, useState } from 'react'

interface DocumentUploadProps {
  onUpload: (file: File) => void
  isUploading: boolean
}

export default function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      onUpload(file)
    }
  }, [onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onUpload(file)
    }
  }, [onUpload])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative group rounded-3xl p-10 md:p-14 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? 'border-2 border-violet-500 bg-violet-500/10 shadow-2xl shadow-violet-500/20 scale-[1.01]'
          : 'border border-white/10 hover:border-violet-500/40 glass-card hover:shadow-2xl hover:shadow-violet-500/10'
      }`}
    >
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all duration-500" />

      <input
        type="file"
        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff,.bmp"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="space-y-5 relative z-0">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-3 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">⚖️</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Extracting & Analyzing Clauses</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-mono truncate">
              {fileName || 'Document'}
            </p>
            <p className="text-xs text-violet-400 mt-2">Deploying 3 Adversarial AI Agents...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 relative z-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-transparent border border-violet-500/30 flex items-center justify-center mx-auto text-3xl shadow-inner group-hover:scale-110 group-hover:border-violet-400/60 transition-all duration-300">
            📑
          </div>
          <div>
            <p className="text-xl font-medium text-white tracking-tight">
              Drop your contract or legal document here
            </p>
            <p className="text-sm text-slate-400 mt-1.5">
              or <span className="text-violet-400 underline decoration-violet-400/50 underline-offset-4 hover:text-violet-300 font-medium">browse your computer</span>
            </p>
          </div>
          
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">PDF</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">DOCX</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">Scanned Images (OCR)</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">Case Briefs</span>
          </div>
        </div>
      )}
    </div>
  )
}
