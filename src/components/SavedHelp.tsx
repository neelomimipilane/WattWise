import { useWattWise } from '../context/WattWiseContext'
import { formatNumber, formatPula } from '../utils/calculations'
import { PrimaryButton, SectionCard } from './ui'

export function SavedAssessments() {
  const { savedAssessments, setView } = useWattWise()

  return (
    <SectionCard
      title="Saved assessments"
      subtitle="Estimates are stored in this browser session for demo purposes."
    >
      {savedAssessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-light-bg px-4 py-10 text-center text-sm text-dark-text/60">
          No saved assessments yet.
          <div className="mt-4 flex justify-center">
            <PrimaryButton onClick={() => setView('recommendation')}>Go to results</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {savedAssessments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-deep-blue capitalize">
                  {item.profile} assessment
                </h3>
                <span className="text-xs text-dark-text/50">{item.savedAt}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
                <p>{item.applianceCount} appliances</p>
                <p>{formatNumber(item.dailyKwh, 2)} kWh/day</p>
                <p>{item.arrayKwp} kWp array</p>
                <p className="font-semibold text-orange">
                  {formatPula(item.costLow)} – {formatPula(item.costHigh)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

export function HelpPage() {
  return (
    <SectionCard title="Help & guidance" subtitle="How to get the most accurate Watt-Wise plan.">
      <div className="space-y-4 text-sm text-dark-text/80">
        <p>
          Watt-Wise is a Botswana-focused solar sizing prototype. Enter realistic appliance wattages and daily
          hours, then choose your location and backup preference to generate panels, battery, inverter, and cost ranges.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Select Household, Farm, or Business.</li>
          <li>Add appliances and adjust quantity / hours until the live energy summary looks right.</li>
          <li>Set location, autonomy, expansion, and system priority.</li>
          <li>Review the energy plan, cost breakdown, and demo installer quotes.</li>
        </ol>
        <p>
          Prices are indicative market estimates in Botswana Pula. Final quotes depend on site survey and equipment brands.
        </p>
      </div>
    </SectionCard>
  )
}
