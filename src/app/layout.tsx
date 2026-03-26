import type { Metadata } from 'next'
import './globals.css'
import { Sora } from "next/font/google";
import { cn } from "@/lib/utils";

// Sora used as display/heading font to complement Arial body font
const sora = Sora({subsets:['latin'],variable:'--font-display',weight:['400','500','600','700']});

const BASE_URL = 'https://coin-bc.com'

export const metadata: Metadata = {
  title: {
    default: 'COIN - Business Continuity & Cyber Resilience | BeNeLux',
    template: '%s | COIN',
  },
  description: 'For over 20 years dedicated to business continuity in the BeNeLux. Consulting, training, business continuity centres, and cyberresilience solutions.',
  keywords: ['business continuity', 'disaster recovery', 'cyber resilience', 'NIS2', 'DORA', 'BeNeLux', 'COIN AS'],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: 'COIN AS',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(sora.variable)}>
      <body className="text-slate-800 bg-warm-50 antialiased" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
