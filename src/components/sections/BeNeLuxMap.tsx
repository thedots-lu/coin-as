'use client'

import { useState } from 'react'
import { Phone, MapPin } from 'lucide-react'

// ---------------------------------------------------------------------------
// Equirectangular projection
// ViewBox: 460 × 530
// Lon: 2.2 → 7.4 (5.2°), Lat: 49.1 → 53.85 (4.75°)
// x = (lon - 2.2) / 5.2 * 460
// y = (53.85 - lat) / 4.75 * 530
// ---------------------------------------------------------------------------

const NL_PATH = "M229,99 L282,73 L428,61 L429,155 L378,225 L346,346 L303,345 L101,272 L168,205 Z"
const BE_PATH = "M32,307 L101,272 L303,345 L346,346 L342,414 L319,479 L314,488 L177,429 L31,330 Z"
const LU_PATH = "M319,407 L342,414 L383,456 L378,489 L337,488 L314,488 L317,462 Z"

const SITES = [
  {
    id: 'nl',
    num: '01',
    name: 'Schiphol-Rijk',
    country: 'Netherlands',
    address: 'Tupolevlaan 41, 1119 PA Schiphol-Rijk',
    phone: '+31 88 26 46 000',
    detail: 'Recovery workplaces · Crisis rooms · Co-location',
    x: 225,
    y: 175,
    color: '#004779',
    labelDir: 'right' as const,
  },
  {
    id: 'be',
    num: '02',
    name: 'Machelen',
    country: 'Belgium',
    address: 'De Kleetlaan 12B, 1831 Machelen',
    phone: '+32 2 513 36 18',
    detail: 'Dedicated recovery workplaces · Near Brussels Airport',
    x: 199,
    y: 328,
    color: '#009900',
    labelDir: 'left' as const,
  },
  {
    id: 'lu1',
    num: '03',
    name: 'Münsbach',
    country: 'Luxembourg',
    address: '6B rue Gabriel Lippmann, L-5365',
    phone: '+352 357 05 30',
    detail: '500 workplaces · TIER-3 · ISO 27001',
    x: 338,
    y: 458,
    color: '#004779',
    labelDir: 'left' as const,
  },
  {
    id: 'lu2',
    num: '04',
    name: 'Contern',
    country: 'Luxembourg',
    address: 'Zone Industrielle Contern',
    phone: '+352 357 05 30',
    detail: '250 workplaces · 10 min from Münsbach',
    x: 370,
    y: 482,
    color: '#A51218',
    labelDir: 'right' as const,
  },
]

export default function BeNeLuxMap() {
  const [active, setActive] = useState<string | null>(null)

  const activeSite = SITES.find((s) => s.id === active)

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* SVG Map */}
      <div className="relative w-full lg:w-auto lg:flex-shrink-0">
        <svg
          viewBox="0 0 460 530"
          className="w-full max-w-sm mx-auto lg:mx-0"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.10))' }}
          aria-label="COIN BeNeLux locations map"
        >
          {/* Subtle grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="460" height="530" fill="#f8fafc" rx="12" />
          <rect width="460" height="530" fill="url(#grid)" rx="12" />

          {/* Country shapes */}
          <path d={NL_PATH} fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={BE_PATH} fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={LU_PATH} fill="#fee2e2" stroke="#fca5a5" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Country labels */}
          <text x="240" y="195" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600" opacity="0.5" fontFamily="Arial, sans-serif">NETHERLANDS</text>
          <text x="155" y="380" textAnchor="middle" fontSize="11" fill="#166534" fontWeight="600" opacity="0.5" fontFamily="Arial, sans-serif">BELGIUM</text>
          <text x="348" y="435" textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="600" opacity="0.5" fontFamily="Arial, sans-serif">LUX.</text>

          {/* Connector lines from pin to label */}
          {SITES.map((site) => {
            const isActive = active === site.id
            const offset = 20
            const lx = site.labelDir === 'right' ? site.x + offset : site.x - offset
            return (
              <line
                key={`line-${site.id}`}
                x1={site.x}
                y1={site.y}
                x2={lx}
                y2={site.y - 22}
                stroke={site.color}
                strokeWidth={isActive ? 1.5 : 0.8}
                strokeDasharray="3,2"
                opacity={isActive ? 0.9 : 0.4}
              />
            )
          })}

          {/* Site pins */}
          {SITES.map((site) => {
            const isActive = active === site.id
            return (
              <g
                key={site.id}
                onClick={() => setActive(active === site.id ? null : site.id)}
                onMouseEnter={() => setActive(site.id)}
                onMouseLeave={() => setActive(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring on active */}
                {isActive && (
                  <circle
                    cx={site.x}
                    cy={site.y}
                    r={18}
                    fill={site.color}
                    opacity={0.15}
                  />
                )}
                {/* Outer ring */}
                <circle
                  cx={site.x}
                  cy={site.y}
                  r={isActive ? 13 : 10}
                  fill="white"
                  stroke={site.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ transition: 'r 0.2s, stroke-width 0.2s' }}
                />
                {/* Inner fill */}
                <circle
                  cx={site.x}
                  cy={site.y}
                  r={isActive ? 7 : 5}
                  fill={site.color}
                  style={{ transition: 'r 0.2s' }}
                />
                {/* Number label */}
                <text
                  x={site.labelDir === 'right' ? site.x + 16 : site.x - 16}
                  y={site.y - 24}
                  textAnchor={site.labelDir === 'right' ? 'start' : 'end'}
                  fontSize="10"
                  fontWeight="700"
                  fill={site.color}
                  fontFamily="Arial, sans-serif"
                >
                  {site.num} {site.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Site list / detail panel */}
      <div className="flex-1 flex flex-col gap-3 w-full">
        {SITES.map((site) => {
          const isActive = active === site.id
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => setActive(active === site.id ? null : site.id)}
              onMouseEnter={() => setActive(site.id)}
              onMouseLeave={() => setActive(null)}
              className={`text-left w-full rounded-xl border p-4 transition-all duration-200 ${
                isActive
                  ? 'border-current shadow-md bg-white scale-[1.01]'
                  : 'border-secondary-100 bg-white/60 hover:bg-white hover:shadow-sm'
              }`}
              style={{ borderColor: isActive ? site.color : undefined }}
            >
              <div className="flex items-start gap-3">
                {/* Number badge */}
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: site.color }}
                >
                  {site.num}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-secondary-800 text-sm">{site.name}</span>
                    <span className="text-xs text-secondary-400">{site.country}</span>
                  </div>
                  {isActive && (
                    <div className="mt-2 space-y-1.5 text-xs text-secondary-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: site.color }} />
                        <span>{site.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: site.color }} />
                        <a href={`tel:${site.phone.replace(/\s/g,'')}`} className="hover:underline">{site.phone}</a>
                      </div>
                      <p className="text-secondary-500 italic mt-1">{site.detail}</p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {/* ISO badge row */}
        <div className="flex items-center gap-2 mt-1 px-1">
          <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-3 h-3 fill-white"><path d="M9 12l-2-2 1.4-1.4L9 9.2l3.6-3.6L14 7z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd"/></svg>
          </div>
          <span className="text-xs text-secondary-400 font-medium">All sites ISO 27001 certified · 24/7 operations</span>
        </div>
      </div>
    </div>
  )
}
