import { useWattWise } from '../context/WattWiseContext'

const STEPS = [
  'Profile',
  'Appliances',
  'Preferences',
  'System',
  'Cost',
  'Installers',
]

export function ProgressStepper() {
  const { progressStep, profile } = useWattWise()
  if (!profile && progressStep === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="mb-3 text-xs font-semibold tracking-wide text-cyan-blue uppercase">
        Assessment progress
      </p>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => {
          const active = index <= progressStep
          return (
            <div
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                active
                  ? 'bg-deep-blue text-white'
                  : 'bg-light-bg text-dark-text/50'
              }`}
            >
              {index + 1}. {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
