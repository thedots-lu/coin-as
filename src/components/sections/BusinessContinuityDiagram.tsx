'use client'

interface BusinessContinuityDiagramProps {
  steps: string[]
  theme?: 'light' | 'dark'
}

const LIGHT_COLORS = [
  'bg-primary-600',
  'bg-primary-500',
  'bg-secondary-700',
  'bg-secondary-600',
  'bg-primary-700',
  'bg-primary-800',
]

const DARK_COLORS = [
  'bg-primary-400',
  'bg-primary-300',
  'bg-secondary-400',
  'bg-secondary-300',
  'bg-accent-500',
  'bg-accent-400',
]

export default function BusinessContinuityDiagram({
  steps,
  theme = 'light',
}: BusinessContinuityDiagramProps) {
  if (steps.length === 0) return null

  const total = steps.length
  const stepColors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS
  const arrowColor = theme === 'dark' ? 'text-accent-400' : 'text-primary-400'
  const mobileChevronColor = theme === 'dark' ? 'text-accent-400' : 'text-secondary-400'
  const markerId = `bc-arrowhead-${theme}`

  return (
    <>
      {/* Desktop: circular layout with arrows + center logo */}
      <div className="hidden md:block max-w-md mx-auto">
        <div className="relative aspect-square">
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none ${arrowColor}`}
            viewBox="0 0 400 400"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
              </marker>
            </defs>
            {steps.slice(0, -1).map((_, i) => {
              const orbit = 132
              const gap = 24
              const a1 = ((i * 360) / total - 90 + gap) * (Math.PI / 180)
              const a2 = (((i + 1) * 360) / total - 90 - gap) * (Math.PI / 180)
              const sx = 200 + orbit * Math.cos(a1)
              const sy = 200 + orbit * Math.sin(a1)
              const ex = 200 + orbit * Math.cos(a2)
              const ey = 200 + orbit * Math.sin(a2)
              return (
                <path
                  key={i}
                  d={`M ${sx.toFixed(2)},${sy.toFixed(2)} A ${orbit},${orbit} 0 0 1 ${ex.toFixed(2)},${ey.toFixed(2)}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                  className="mission-arrow-flow"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              )
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/images/coin/coin-as-sigle.png"
              alt="COIN AS"
              className="w-24 h-auto"
            />
          </div>

          {steps.map((step, index) => {
            const angle = (index * 360) / total - 90
            const radius = 33
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180)
            return (
              <div
                key={index}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`${stepColors[index % stepColors.length]} text-white w-24 h-24 rounded-full flex items-center justify-center text-center text-xs font-semibold shadow-lg transition-transform duration-300 hover:scale-110`}
                >
                  <span className="px-2">{step}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: horizontal pipeline */}
      <div className="md:hidden flex flex-wrap justify-center gap-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`${stepColors[index % stepColors.length]} text-white px-5 py-3 rounded-full text-sm font-semibold shadow-md`}
            >
              {step}
            </div>
            {index < steps.length - 1 && (
              <svg
                className={`w-5 h-5 ${mobileChevronColor} mx-1 flex-shrink-0`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
