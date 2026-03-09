import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-[family-name:var(--font-inter)] text-gray-800 bg-white antialiased">
        {children}
      </body>
    </html>
  )
}
