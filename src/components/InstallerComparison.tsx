import { BadgeCheck, Sparkles, Star } from 'lucide-react'
import { useWattWise } from '../context/WattWiseContext'
import { formatPula } from '../utils/calculations'
import { PrimaryButton, SectionCard } from './ui'

export function InstallerComparison() {
  const {
    appliances,
    installerQuotes,
    compareIds,
    toggleCompare,
    showToast,
    setView,
    currentUser,
  } = useWattWise()

  if (appliances.length === 0 && currentUser?.role !== 'company') {
    return (
      <SectionCard title="Installer quotes" subtitle="Complete an assessment to generate quotations.">
        <PrimaryButton onClick={() => setView(currentUser?.paid ? 'profile' : 'register')}>
          {currentUser?.paid ? 'Start assessment' : 'Register first'}
        </PrimaryButton>
      </SectionCard>
    )
  }

  if (installerQuotes.length === 0) {
    return (
      <SectionCard title="Installer quotes" subtitle="No quotations available yet.">
        <PrimaryButton onClick={() => setView('profile')}>Build an assessment</PrimaryButton>
      </SectionCard>
    )
  }

  const compared = installerQuotes.filter((quote) => compareIds.includes(quote.id))
  const hasAi = installerQuotes.some((quote) => quote.aiGenerated)

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionCard
        title="Installer comparison"
        subtitle={
          hasAi
            ? 'AI quotations generated from registered solar company prices, labour rates, and standards.'
            : 'Sample marketplace quotations — register a solar company to publish live AI-priced offers.'
        }
      >
        <div className="mb-4 rounded-xl border border-border bg-light-bg px-4 py-3 text-sm text-dark-text/70">
          Select up to three quotations to compare.{' '}
          {hasAi
            ? 'Prices come from company rate cards via Watt-Wise AI.'
            : 'Demo data shown until companies register.'}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {installerQuotes.map((quote) => {
            const selected = compareIds.includes(quote.id)
            return (
              <article
                key={quote.id}
                className={`rounded-2xl border p-5 transition ${
                  selected ? 'border-orange ring-2 ring-orange/20' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-deep-blue">{quote.company}</h3>
                    <p className="text-sm text-dark-text/60">{quote.serviceArea}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {quote.aiGenerated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange/15 px-2.5 py-1 text-xs font-semibold text-orange">
                        <Sparkles className="size-3.5" /> AI quote
                      </span>
                    )}
                    {quote.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bright-cyan/15 px-2.5 py-1 text-xs font-semibold text-cyan-blue">
                        <BadgeCheck className="size-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Star className="size-4 fill-gold-yellow text-gold-yellow" />
                  <span className="font-semibold text-dark-text">{quote.rating.toFixed(1)}</span>
                  {quote.reviewCount > 0 && (
                    <span className="text-dark-text/50">({quote.reviewCount} reviews)</span>
                  )}
                </div>

                <p className="mt-3 font-display text-2xl font-bold text-orange">{formatPula(quote.price)}</p>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <Row label="Panels" value={quote.panelSpec} />
                  <Row label="Battery" value={quote.batterySpec} />
                  <Row label="Inverter" value={quote.inverterSpec} />
                  <Row label="Warranty" value={`${quote.warrantyYears} years`} />
                  <Row label="Timeline" value={`${quote.installDays} days`} />
                </dl>

                <p className="mt-3 rounded-xl bg-light-bg px-3 py-2 text-xs text-dark-text/70 italic">
                  “{quote.reviewSnippet}”
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        if (!selected && compareIds.length >= 3) {
                          showToast('Compare up to 3 installers at a time', 'warning')
                          return
                        }
                        toggleCompare(quote.id)
                      }}
                      className="accent-orange"
                    />
                    Compare
                  </label>
                  <PrimaryButton
                    variant="primary"
                    onClick={() => showToast(`Quotation request sent to ${quote.company}`, 'success')}
                  >
                    Request quotation
                  </PrimaryButton>
                </div>
              </article>
            )
          })}
        </div>
      </SectionCard>

      {compared.length >= 2 && (
        <SectionCard title="Side-by-side comparison" subtitle="Selected quotations.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-dark-text/55 uppercase">
                <tr>
                  <th className="px-2 py-3 text-left font-semibold">Field</th>
                  {compared.map((quote) => (
                    <th key={quote.id} className="px-2 py-3 text-left font-semibold text-deep-blue">
                      {quote.company.replace(' (Demo)', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Total price', ...compared.map((q) => formatPula(q.price))],
                  ['System capacity', ...compared.map((q) => `${q.systemKwp} kWp`)],
                  ['Battery capacity', ...compared.map((q) => `${q.batteryKwh} kWh`)],
                  ['Warranty', ...compared.map((q) => `${q.warrantyYears} years`)],
                  ['Installation time', ...compared.map((q) => `${q.installDays} days`)],
                  ['After-sales support', ...compared.map((q) => q.afterSales)],
                  ['Installer rating', ...compared.map((q) => q.rating.toFixed(1))],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border/70">
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={`px-2 py-3 ${index === 0 ? 'font-semibold text-dark-text' : 'text-dark-text/80'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-dark-text/55">{label}</dt>
      <dd className="text-right font-medium text-dark-text">{value}</dd>
    </div>
  )
}
