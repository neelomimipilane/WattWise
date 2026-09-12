import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { appliancesForProfile } from '../data/appliances'
import { useWattWise } from '../context/WattWiseContext'
import type { UsagePeriod } from '../types'
import { calculateDailyEnergy } from '../utils/calculations'
import { EnergyChart } from './EnergyChart'
import { EnergySummaryPanel } from './EnergySummary'
import { PrimaryButton, SectionCard } from './ui'

export function ApplianceForm() {
  const { profile, addAppliance, setView } = useWattWise()
  const catalogue = appliancesForProfile(profile)
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(catalogue.map((item) => item.category)))],
    [catalogue],
  )

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [templateId, setTemplateId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [hours, setHours] = useState(4)
  const [period, setPeriod] = useState<UsagePeriod>('both')

  const filtered = catalogue.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectedTemplate = catalogue.find((item) => item.id === templateId) ?? filtered[0]

  if (!profile) {
    return (
      <SectionCard title="My Appliances" subtitle="Select a profile before configuring appliances.">
        <PrimaryButton onClick={() => setView('profile')}>Choose Profile</PrimaryButton>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Appliance configuration"
      subtitle="Search, filter, and add loads. Energy totals update the moment you change quantity or hours."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-dark-text/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-2 pr-3 pl-9 outline-none focus:border-cyan-blue"
              placeholder="Find an appliance"
            />
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 outline-none focus:border-cyan-blue"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm md:col-span-2 xl:col-span-2">
          <span className="mb-1 block font-semibold text-dark-text">Appliance</span>
          <select
            value={selectedTemplate?.id ?? ''}
            onChange={(e) => {
              const next = catalogue.find((item) => item.id === e.target.value)
              setTemplateId(e.target.value)
              if (next) {
                setHours(next.defaultHours)
                setPeriod(next.defaultPeriod)
              }
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 outline-none focus:border-cyan-blue"
          >
            {filtered.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.wattage}W
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Wattage (auto)</span>
          <input
            readOnly
            value={selectedTemplate?.wattage ?? ''}
            className="w-full rounded-xl border border-border bg-light-bg px-3 py-2 text-dark-text/80"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Quantity</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-cyan-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Hours / day</span>
          <input
            type="number"
            min={0}
            max={24}
            step={0.1}
            value={hours}
            onChange={(e) => setHours(Math.min(24, Math.max(0, Number(e.target.value) || 0)))}
            className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-cyan-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-dark-text">Usage period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as UsagePeriod)}
            className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-cyan-blue"
          >
            <option value="day">Daytime</option>
            <option value="night">Nighttime</option>
            <option value="both">Day & Night</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <PrimaryButton
          variant="accent"
          onClick={() => {
            if (!selectedTemplate) return
            addAppliance(selectedTemplate.id, quantity, hours, period)
          }}
        >
          <Plus className="size-4" />
          Add appliance
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => setView('preferences')}>
          Continue to preferences
        </PrimaryButton>
      </div>
    </SectionCard>
  )
}

export function ApplianceTable() {
  const { appliances, updateAppliance, removeAppliance } = useWattWise()
  const [editingId, setEditingId] = useState<string | null>(null)

  if (appliances.length === 0) {
    return (
      <SectionCard title="Selected appliances" subtitle="Your load list is empty.">
        <div className="rounded-xl border border-dashed border-border bg-light-bg px-4 py-10 text-center text-sm text-dark-text/60">
          Add your first appliance to start live energy calculations.
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="Selected appliances" subtitle="Edit wattage, quantity, or hours — daily energy recalculates instantly.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wide text-dark-text/55 uppercase">
            <tr>
              <th className="px-2 py-3 font-semibold">Appliance</th>
              <th className="px-2 py-3 font-semibold">Wattage</th>
              <th className="px-2 py-3 font-semibold">Qty</th>
              <th className="px-2 py-3 font-semibold">Hours/day</th>
              <th className="px-2 py-3 font-semibold">Period</th>
              <th className="px-2 py-3 font-semibold">Daily energy</th>
              <th className="px-2 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appliances.map((item) => {
              const dailyWh = calculateDailyEnergy(item.wattage, item.quantity, item.hoursPerDay)
              const editing = editingId === item.id
              return (
                <tr key={item.id} className="border-b border-border/70">
                  <td className="px-2 py-3 font-medium text-dark-text">
                    {item.name}
                    <p className="text-xs text-dark-text/50">{item.category}</p>
                  </td>
                  <td className="px-2 py-3">
                    {editing ? (
                      <input
                        type="number"
                        min={1}
                        value={item.wattage}
                        onChange={(e) => updateAppliance(item.id, { wattage: Number(e.target.value) || 1 })}
                        className="w-20 rounded-lg border border-border px-2 py-1"
                      />
                    ) : (
                      `${item.wattage} W`
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateAppliance(item.id, { quantity: Number(e.target.value) || 1 })}
                      className="w-16 rounded-lg border border-border px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.1}
                      value={item.hoursPerDay}
                      onChange={(e) => updateAppliance(item.id, { hoursPerDay: Number(e.target.value) || 0 })}
                      className="w-20 rounded-lg border border-border px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <select
                      value={item.period}
                      onChange={(e) => updateAppliance(item.id, { period: e.target.value as UsagePeriod })}
                      className="rounded-lg border border-border px-2 py-1"
                    >
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="both">Both</option>
                    </select>
                  </td>
                  <td className="px-2 py-3 font-semibold text-deep-blue">
                    {(dailyWh / 1000).toFixed(2)} kWh
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(editing ? null : item.id)}
                        className="rounded-lg border border-border p-1.5 text-cyan-blue hover:bg-light-bg"
                        aria-label="Edit appliance"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAppliance(item.id)}
                        className="rounded-lg border border-border p-1.5 text-orange hover:bg-light-bg"
                        aria-label="Remove appliance"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

export function AppliancesPage() {
  const { energySummary, highDemandWarning } = useWattWise()

  return (
    <div className="space-y-6">
      <ApplianceForm />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ApplianceTable />
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <EnergySummaryPanel />
          <SectionCard title="Top energy consumers" subtitle="Share of daily demand by appliance.">
            <EnergyChart data={energySummary.byAppliance} />
          </SectionCard>
          {highDemandWarning && (
            <div className="rounded-2xl border border-orange/40 bg-orange/10 p-4 text-sm text-dark-text">
              <p className="font-semibold text-orange">High demand warning</p>
              <p className="mt-1">
                Your connected load or daily energy looks unusually high. Double-check wattages and hours before sizing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
