import { Bot, Save, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWattWise } from '../context/WattWiseContext'
import type { CompanyPricing } from '../types'
import { DEFAULT_COMPANY_PRICING } from '../types'
import { formatPula } from '../utils/calculations'
import { PrimaryButton, SectionCard } from './ui'

export function CompanyPricingPage() {
  const { currentUser, updateCompanyPricing, regenerateCompanyQuote, setView, recommendation } =
    useWattWise()
  const [form, setForm] = useState<CompanyPricing>(
    currentUser?.pricing ?? DEFAULT_COMPANY_PRICING,
  )

  useEffect(() => {
    if (currentUser?.pricing) setForm(currentUser.pricing)
  }, [currentUser])

  if (!currentUser || currentUser.role !== 'company' || !currentUser.paid) {
    return (
      <SectionCard title="Company pricing" subtitle="Solar companies must register and pay to publish rates.">
        <PrimaryButton onClick={() => setView('register')}>Register as solar company</PrimaryButton>
      </SectionCard>
    )
  }

  const setNum = (key: keyof CompanyPricing, value: string) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }))
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionCard
        title="Panel prices, labour & standards"
        subtitle={`${currentUser.companyName || currentUser.name} — these rates feed AI-generated customer quotations.`}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <TextField label="Panel brand" value={form.panelBrand} onChange={(v) => setForm({ ...form, panelBrand: v })} />
          <NumberField label="Panel wattage (W)" value={form.panelWattage} onChange={(v) => setNum('panelWattage', v)} />
          <NumberField label="Price per panel (P)" value={form.panelPrice} onChange={(v) => setNum('panelPrice', v)} />
          <NumberField label="Panel efficiency (%)" value={form.panelEfficiency} onChange={(v) => setNum('panelEfficiency', v)} />
          <NumberField label="Panel warranty (years)" value={form.panelWarrantyYears} onChange={(v) => setNum('panelWarrantyYears', v)} />
          <TextField label="Battery brand" value={form.batteryBrand} onChange={(v) => setForm({ ...form, batteryBrand: v })} />
          <NumberField label="Battery price / kWh (P)" value={form.batteryPricePerKwh} onChange={(v) => setNum('batteryPricePerKwh', v)} />
          <TextField label="Inverter brand" value={form.inverterBrand} onChange={(v) => setForm({ ...form, inverterBrand: v })} />
          <NumberField label="Inverter price / kW (P)" value={form.inverterPricePerKw} onChange={(v) => setNum('inverterPricePerKw', v)} />
          <NumberField label="Labour / kWp (P)" value={form.labourPerKwp} onChange={(v) => setNum('labourPerKwp', v)} />
          <NumberField label="Labour day rate (P)" value={form.labourDayRate} onChange={(v) => setNum('labourDayRate', v)} />
          <NumberField label="Install days / kWp" value={form.estimatedInstallDaysPerKwp} onChange={(v) => setNum('estimatedInstallDaysPerKwp', v)} />
          <NumberField label="Mounting / kWp (P)" value={form.mountingPerKwp} onChange={(v) => setNum('mountingPerKwp', v)} />
          <NumberField label="Protection flat (P)" value={form.protectionFlat} onChange={(v) => setNum('protectionFlat', v)} />
          <NumberField label="Cabling / kWp (P)" value={form.cablingPerKwp} onChange={(v) => setNum('cablingPerKwp', v)} />
          <NumberField label="Contingency %" value={form.contingencyPercent} onChange={(v) => setNum('contingencyPercent', v)} />
          <TextField label="Service area" value={form.serviceArea} onChange={(v) => setForm({ ...form, serviceArea: v })} />
        </div>

        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Standards & compliance notes</span>
          <textarea
            value={form.standardsNotes}
            onChange={(e) => setForm({ ...form, standardsNotes: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-cyan-blue"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryButton
            variant="primary"
            onClick={() => updateCompanyPricing(form)}
          >
            <Save className="size-4" /> Save prices & standards
          </PrimaryButton>
          <PrimaryButton
            variant="accent"
            onClick={() => {
              updateCompanyPricing(form)
              regenerateCompanyQuote()
            }}
            disabled={recommendation.panelCount === 0}
          >
            <Sparkles className="size-4" /> Generate AI quotation
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => setView('companyQuotes')}>
            View AI quotes
          </PrimaryButton>
        </div>
        {recommendation.panelCount === 0 && (
          <p className="mt-3 text-sm text-dark-text/60">
            Tip: when a customer completes an assessment on this device, AI quotations use that live system size.
            You can also open Energy Assessment as a demo load profile first.
          </p>
        )}
      </SectionCard>
    </div>
  )
}

export function CompanyQuotesPage() {
  const { companyAiQuotes, regenerateCompanyQuote, setView, currentUser } = useWattWise()

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <SectionCard title="AI quotations" subtitle="Company accounts only.">
        <PrimaryButton onClick={() => setView('register')}>Register</PrimaryButton>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionCard
        title="AI-generated quotations"
        subtitle="Built from your saved panel prices, labour rates, and standards."
        action={
          <PrimaryButton variant="accent" onClick={regenerateCompanyQuote}>
            <Bot className="size-4" /> New AI quote
          </PrimaryButton>
        }
      >
        {companyAiQuotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-light-bg px-4 py-10 text-center text-sm text-dark-text/60">
            No AI quotations yet. Save pricing, ensure a system is sized, then generate.
          </div>
        ) : (
          <div className="space-y-4">
            {companyAiQuotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="inline-flex items-center gap-1 rounded-full bg-bright-cyan/15 px-2.5 py-1 text-xs font-semibold text-cyan-blue">
                      <Sparkles className="size-3.5" /> AI quotation
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-deep-blue">
                      {formatPula(quote.total)}
                    </h3>
                    <p className="text-xs text-dark-text/50">{quote.generatedAt}</p>
                  </div>
                  <p className="text-sm text-dark-text/70">{quote.systemKwp} kWp · {quote.installDays} days</p>
                </div>
                <p className="mt-3 text-sm text-dark-text/75">{quote.narrative}</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border text-xs uppercase text-dark-text/50">
                      <tr>
                        <th className="py-2 text-left">Line</th>
                        <th className="py-2 text-left">Detail</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.lines.map((line) => (
                        <tr key={line.label} className="border-b border-border/70">
                          <td className="py-2 font-medium">{line.label}</td>
                          <td className="py-2 text-dark-text/65">{line.detail}</td>
                          <td className="py-2 text-right font-semibold text-deep-blue">
                            {formatPula(line.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-dark-text">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-cyan-blue"
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-dark-text">{label}</span>
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-cyan-blue"
      />
    </label>
  )
}
