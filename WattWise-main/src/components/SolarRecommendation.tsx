import { Battery, Cpu, Pencil, Receipt, RotateCcw, Save, SolarPanel, Wallet } from 'lucide-react'
import { useWattWise } from '../context/WattWiseContext'
import { formatNumber, formatPula } from '../utils/calculations'
import { MetricCard, PrimaryButton, SectionCard } from './ui'

export function SolarRecommendation() {
  const {
    appliances,
    energySummary,
    recommendation,
    costEstimate,
    preferences,
    setView,
    saveAssessment,
    resetAssessment,
  } = useWattWise()

  if (appliances.length === 0) {
    return (
      <SectionCard title="Solar recommendation" subtitle="Add appliances and preferences to generate a live system size.">
        <PrimaryButton onClick={() => setView('appliances')}>Configure appliances</PrimaryButton>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-blue uppercase">Watt-Wise results</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-deep-blue">Your Watt-Wise Energy Plan</h2>
        <p className="mt-2 max-w-2xl text-sm text-dark-text/70">
          Generated from your {energySummary.applianceCount} appliance loads, {preferences.autonomyDays}-day backup,
          and {preferences.expansionPercent}% expansion allowance — not a static template.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-border bg-light-bg p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gold-yellow text-deep-blue">
              <SolarPanel className="size-5" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-dark-text/55 uppercase">Solar array</p>
            <p className="mt-2 font-display text-2xl font-bold text-deep-blue">
              {recommendation.panelCount} × {recommendation.panelWattage}W Panels
            </p>
            <p className="mt-1 text-sm text-cyan-blue">{recommendation.arrayKwp} kWp</p>
            <p className="mt-2 text-xs text-dark-text/60">
              Est. generation {formatNumber(recommendation.estimatedDailyGenerationKwh, 2)} kWh/day
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-light-bg p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-bright-cyan text-white">
              <Battery className="size-5" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-dark-text/55 uppercase">Battery</p>
            <p className="mt-2 font-display text-2xl font-bold text-deep-blue">
              {recommendation.batteryKwh} kWh Lithium
            </p>
            <p className="mt-1 text-sm text-cyan-blue">
              Usable {recommendation.usableBatteryKwh} kWh · ~{recommendation.backupHours}h backup
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-light-bg p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-deep-blue text-white">
              <Cpu className="size-5" />
            </div>
            <p className="text-xs font-semibold tracking-wide text-dark-text/55 uppercase">Inverter</p>
            <p className="mt-2 font-display text-2xl font-bold text-deep-blue">
              {recommendation.inverterKw} kW Hybrid Inverter
            </p>
            <p className="mt-1 text-sm text-cyan-blue">
              Peak {recommendation.peakDemandKw} kW · {recommendation.safetyMarginPercent}% margin
            </p>
          </div>

          <MetricCard
            label="Daily energy demand"
            value={`${formatNumber(energySummary.dailyKwh, 2)} kWh`}
            accent="gold"
          />
          <MetricCard
            label="Backup autonomy"
            value={`${preferences.autonomyDays} day${preferences.autonomyDays === 1 ? '' : 's'}`}
            accent="cyan"
          />
          <MetricCard
            label="Estimated cost"
            value={`${formatPula(costEstimate.totalLow)} – ${formatPula(costEstimate.totalHigh)}`}
            accent="orange"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton variant="ghost" onClick={() => setView('appliances')}>
            <Pencil className="size-4" /> Edit my inputs
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={() => setView('cost')}>
            <Wallet className="size-4" /> View cost breakdown
          </PrimaryButton>
          <PrimaryButton variant="primary" onClick={() => setView('installers')}>
            <Receipt className="size-4" /> Compare installers
          </PrimaryButton>
          <PrimaryButton variant="accent" onClick={saveAssessment}>
            <Save className="size-4" /> Save estimate
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={resetAssessment}>
            <RotateCcw className="size-4" /> Start new assessment
          </PrimaryButton>
        </div>
      </section>

      <SectionCard title="System specification detail" subtitle="Derived from live loads, location irradiance, losses, and priority.">
        <div className="grid gap-3 md:grid-cols-3">
          <Spec label="Array capacity" value={`${recommendation.arrayKwp} kWp`} />
          <Spec label="Panel count" value={`${recommendation.panelCount}`} />
          <Spec label="Panel wattage" value={`${recommendation.panelWattage} W`} />
          <Spec label="Battery bank" value={`${recommendation.batteryKwh} kWh`} />
          <Spec label="Usable storage" value={`${recommendation.usableBatteryKwh} kWh`} />
          <Spec label="Inverter size" value={`${recommendation.inverterKw} kW`} />
        </div>
      </SectionCard>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-dark-text/50 uppercase">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-deep-blue">{value}</p>
    </div>
  )
}
