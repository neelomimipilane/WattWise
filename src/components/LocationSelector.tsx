import { BOTSWANA_LOCATIONS } from '../data/appliances'
import { useWattWise } from '../context/WattWiseContext'
import type { SystemPriority } from '../types'
import { PrimaryButton, SectionCard } from './ui'

export function LocationSelector() {
  const { preferences, setPreferences, appliances, setView, showToast } = useWattWise()
  const location = BOTSWANA_LOCATIONS.find((item) => item.id === preferences.locationId)

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionCard
        title="Location & system preferences"
        subtitle="Botswana solar resource, backup autonomy, expansion, and priority shape your recommendation."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-dark-text">Botswana location</span>
            <select
              value={preferences.locationId}
              onChange={(e) => setPreferences({ locationId: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-cyan-blue"
            >
              {BOTSWANA_LOCATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {location && (
              <p className="mt-2 rounded-xl bg-light-bg px-3 py-2 text-sm text-dark-text/70">
                Solar resource estimate: <strong className="text-deep-blue">{location.peakSunHours} peak sun hours</strong>
                . {location.description}
              </p>
            )}
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-dark-text">Backup autonomy</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([0.5, 1, 2, 3] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPreferences({ autonomyDays: days })}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    preferences.autonomyDays === days
                      ? 'border-orange bg-orange text-white'
                      : 'border-border bg-white text-dark-text hover:border-cyan-blue'
                  }`}
                >
                  {days} day{days === 1 ? '' : 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-dark-text">Future expansion</span>
              <span className="font-bold text-cyan-blue">{preferences.expansionPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={10}
              value={preferences.expansionPercent}
              onChange={(e) =>
                setPreferences({
                  expansionPercent: Number(e.target.value) as 0 | 10 | 20 | 30,
                })
              }
              className="w-full accent-orange"
            />
            <div className="mt-1 flex justify-between text-xs text-dark-text/50">
              <span>0%</span>
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-dark-text">System priority</p>
            <div className="space-y-2">
              {(
                [
                  ['lowest_cost', 'Lowest upfront cost'],
                  ['balanced', 'Balanced system'],
                  ['max_backup', 'Maximum backup reliability'],
                ] as [SystemPriority, string][]
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                    preferences.priority === value
                      ? 'border-bright-cyan bg-bright-cyan/10'
                      : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={preferences.priority === value}
                    onChange={() => setPreferences({ priority: value })}
                    className="accent-deep-blue"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton variant="ghost" onClick={() => setView('appliances')}>
            Back to appliances
          </PrimaryButton>
          <PrimaryButton
            variant="accent"
            onClick={() => {
              if (appliances.length === 0) {
                showToast('Add at least one appliance first', 'warning')
                setView('appliances')
                return
              }
              setView('recommendation')
            }}
          >
            Generate solar recommendation
          </PrimaryButton>
        </div>
      </SectionCard>
    </div>
  )
}
