import type { Metadata } from 'next'
import './globals.css'
import { Geist, Sora } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const sora = Sora({subsets:['latin'],variable:'--font-display',weight:['400','500','600','700']});

export const metadata: Metadata = {
  title: {
    default: 'COIN - Business Continuity Innovation',
    template: '%s | COIN',
  },
  description: 'For over 20 years dedicated to business continuity in the BeNeLux. Consulting, training, business continuity centres, and cyberresilience solutions.',
  keywords: ['business continuity', 'disaster recovery', 'cyber resilience', 'NIS2', 'DORA', 'BeNeLux'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, sora.variable)}>
      <body className="text-slate-800 bg-warm-50 antialiased">
        {children}
      </body>
    </html>
  )
}
