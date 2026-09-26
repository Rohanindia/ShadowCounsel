import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import Disclaimer from '@/components/Disclaimer'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ShadowCounsel — Adversarial AI Legal Intelligence',
  description: 'Stress-test contracts clause-by-clause with 3 adversarial AI agents grounded in Indian statutory law. Free AI-powered legal document analysis for Indian contracts.',
  keywords: 'legal AI, contract analysis, Indian law, adversarial AI, document review',
  openGraph: {
    title: 'ShadowCounsel — Adversarial AI Legal Intelligence',
    description: 'Stress-test contracts with 3 adversarial AI agents grounded in Indian statutory law.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#07090e] text-[#f1f5f9] selection:bg-violet-500/30 selection:text-white">
        {/* Skip navigation for keyboard/screen reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Disclaimer />
      </body>
    </html>
  )
}
