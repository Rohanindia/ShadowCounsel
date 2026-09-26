'use client'

import { useState } from 'react'

interface Citation {
  act_name: string
  section_number: string
  section_title?: string
  text_excerpt: string
}

interface CitationPopoverProps {
  citation: Citation
}

export default function CitationPopover({ citation }: CitationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span className="relative inline">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-mono hover:bg-blue-500/30 transition-colors cursor-pointer"
      >
        §{citation.section_number} {citation.act_name}
      </button>
      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-80 p-4 rounded-lg glass shadow-2xl border border-[hsl(var(--border))]">
          <div className="text-xs font-semibold text-blue-400 mb-1">
            {citation.act_name} — Section {citation.section_number}
          </div>
          {citation.section_title && (
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
              {citation.section_title}
            </div>
          )}
          <p className="text-xs leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            {citation.text_excerpt}
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            ✕
          </button>
        </div>
      )}
    </span>
  )
}
