import { useWattWise } from '../context/WattWiseContext'
import { formatNumber } from '../utils/calculations'
import { MetricCard, SectionCard } from './ui'

export function EnergySummaryPanel() {
  const { energySummary } = useWattWise()

  return (
    <SectionCard title="Live energy summary" subtitle="Updates instantly as you change appliances.">
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="Total appliances" value={`${energySummary.applianceCount}`} accent="blue" />
        <MetricCard
          label="Connected load"
          value={`${Math.round(energySummary.connectedLoadW).toLocaleString('en-BW')} W`}
          accent="cyan"
        />
        <MetricCard
          label="Total daily energy"
          value={`${formatNumber(energySummary.dailyKwh, 2)} kWh`}
          hint={`${Math.round(energySummary.dailyWh).toLocaleString('en-BW')} Wh`}
          accent="gold"
        />
        <MetricCard
          label="Peak load"
          value={`${formatNumber(energySummary.peakLoadW / 1000, 2)} kW`}
          accent="orange"
        />
        <MetricCard
          label="Daytime consumption"
          value={`${formatNumber(energySummary.daytimeKwh, 2)} kWh`}
          accent="cyan"
        />
        <MetricCard
          label="Nighttime demand"
          value={`${formatNumber(energySummary.nighttimeKwh, 2)} kWh`}
          accent="blue"
        />
      </div>
    </SectionCard>
  )
}
