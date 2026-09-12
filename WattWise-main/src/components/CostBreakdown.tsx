import { useWattWise } from '../context/WattWiseContext'
import { formatPula } from '../utils/calculations'
import { DonutChart } from './EnergyChart'
import { PrimaryButton, SectionCard } from './ui'

export function CostBreakdown() {
  const { appliances, costEstimate, setView } = useWattWise()

  if (appliances.length === 0) {
    return (
      <SectionCard title="Cost estimate" subtitle="Generate a recommendation first.">
        <PrimaryButton onClick={() => setView('appliances')}>Start assessment</PrimaryButton>
      </SectionCard>
    )
  }

  const chartItems = costEstimate.items.map((item) => ({
    label: item.label,
    value: (item.low + item.high) / 2,
  }))

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionCard
        title="Indicative Botswana cost breakdown"
        subtitle="Fair-market range in Botswana Pula based on your live system size."
        action={
          <PrimaryButton variant="secondary" onClick={() => setView('installers')}>
            Compare installers
          </PrimaryButton>
        }
      >
        <div className="mb-5 rounded-2xl border border-gold-yellow/40 bg-gold-yellow/15 px-4 py-3 text-sm text-dark-text">
          <strong>Indicative market estimate</strong> — final pricing depends on installer assessment and equipment brands.
        </div>

        <div className="mb-6 rounded-2xl bg-deep-blue px-5 py-4 text-white">
          <p className="text-xs font-semibold tracking-wide text-bright-cyan uppercase">Total estimated range</p>
          <p className="mt-1 font-display text-3xl font-extrabold">
            {formatPula(costEstimate.totalLow)} – {formatPula(costEstimate.totalHigh)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <DonutChart items={chartItems} />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-dark-text/55 uppercase">
                <tr>
                  <th className="py-2 text-left font-semibold">Component</th>
                  <th className="py-2 text-right font-semibold">Low</th>
                  <th className="py-2 text-right font-semibold">High</th>
                </tr>
              </thead>
              <tbody>
                {costEstimate.items.map((item) => (
                  <tr key={item.label} className="border-b border-border/70">
                    <td className="py-2.5 text-dark-text">{item.label}</td>
                    <td className="py-2.5 text-right font-medium text-deep-blue">{formatPula(item.low)}</td>
                    <td className="py-2.5 text-right font-medium text-deep-blue">{formatPula(item.high)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
