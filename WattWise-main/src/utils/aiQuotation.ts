import type {
  AiQuotation,
  CompanyPricing,
  RegisteredUser,
  SolarRecommendation,
} from '../types'

export function generateAiQuotation(
  company: RegisteredUser,
  recommendation: SolarRecommendation,
): AiQuotation | null {
  if (company.role !== 'company' || !company.pricing || recommendation.panelCount === 0) {
    return null
  }

  const p = company.pricing
  const panelCount = Math.max(
    recommendation.panelCount,
    Math.ceil((recommendation.arrayKwp * 1000) / p.panelWattage),
  )
  const arrayKwp = (panelCount * p.panelWattage) / 1000
  const installDays = Math.max(3, Math.ceil(arrayKwp * p.estimatedInstallDaysPerKwp))

  const panelCost = panelCount * p.panelPrice
  const batteryCost = recommendation.batteryKwh * p.batteryPricePerKwh
  const inverterCost = recommendation.inverterKw * p.inverterPricePerKw
  const mountingCost = arrayKwp * p.mountingPerKwp
  const cablingCost = arrayKwp * p.cablingPerKwp
  const labourKwpCost = arrayKwp * p.labourPerKwp
  const labourDaysCost = installDays * p.labourDayRate
  const protectionCost = p.protectionFlat
  const subtotal =
    panelCost +
    batteryCost +
    inverterCost +
    mountingCost +
    cablingCost +
    labourKwpCost +
    labourDaysCost +
    protectionCost
  const contingency = subtotal * (p.contingencyPercent / 100)
  const total = Math.round((subtotal + contingency) / 50) * 50

  const lines = [
    {
      label: 'Solar panels',
      amount: Math.round(panelCost),
      detail: `${panelCount} × ${p.panelWattage}W ${p.panelBrand} @ ${p.panelEfficiency}% eff.`,
    },
    {
      label: 'Battery storage',
      amount: Math.round(batteryCost),
      detail: `${recommendation.batteryKwh} kWh ${p.batteryBrand}`,
    },
    {
      label: 'Hybrid inverter',
      amount: Math.round(inverterCost),
      detail: `${recommendation.inverterKw} kW ${p.inverterBrand}`,
    },
    {
      label: 'Mounting structure',
      amount: Math.round(mountingCost),
      detail: `${arrayKwp.toFixed(2)} kWp roof/ground mount`,
    },
    {
      label: 'Cabling & BOS',
      amount: Math.round(cablingCost),
      detail: 'DC/AC cabling to company standard',
    },
    {
      label: 'Protection equipment',
      amount: Math.round(protectionCost),
      detail: 'Surge, breakers, and isolation',
    },
    {
      label: 'Labour (system)',
      amount: Math.round(labourKwpCost),
      detail: `${p.labourPerKwp.toLocaleString('en-BW')} P/kWp × ${arrayKwp.toFixed(2)} kWp`,
    },
    {
      label: 'Labour (installation days)',
      amount: Math.round(labourDaysCost),
      detail: `${installDays} days × P${p.labourDayRate}/day`,
    },
    {
      label: 'Contingency',
      amount: Math.round(contingency),
      detail: `${p.contingencyPercent}% of works`,
    },
  ]

  const narrative = buildNarrative(company.companyName || company.name, p, recommendation, arrayKwp, total)

  return {
    id: `ai-${company.id}`,
    companyId: company.id,
    companyName: company.companyName || company.name,
    generatedAt: new Date().toLocaleString('en-BW'),
    narrative,
    lines,
    total,
    panelSpec: `${panelCount} × ${p.panelWattage}W ${p.panelBrand}`,
    batterySpec: `${recommendation.batteryKwh} kWh ${p.batteryBrand}`,
    inverterSpec: `${recommendation.inverterKw} kW ${p.inverterBrand}`,
    warrantyYears: p.panelWarrantyYears,
    installDays,
    standardsApplied: p.standardsNotes,
    systemKwp: Number(arrayKwp.toFixed(2)),
    batteryKwh: recommendation.batteryKwh,
    rating: 4.7,
    verified: true,
    serviceArea: p.serviceArea,
  }
}

function buildNarrative(
  companyName: string,
  pricing: CompanyPricing,
  recommendation: SolarRecommendation,
  arrayKwp: number,
  total: number,
): string {
  return (
    `${companyName} AI quotation: sized a ${arrayKwp.toFixed(2)} kWp ${pricing.panelBrand} array ` +
    `(${pricing.panelEfficiency}% module efficiency) with ${recommendation.batteryKwh} kWh ${pricing.batteryBrand} storage ` +
    `and a ${recommendation.inverterKw} kW ${pricing.inverterBrand} inverter. ` +
    `Labour is priced at P${pricing.labourPerKwp}/kWp plus P${pricing.labourDayRate}/day installation. ` +
    `Standards applied: ${pricing.standardsNotes}. ` +
    `Indicative turnkey total: P${total.toLocaleString('en-BW')}.`
  )
}

export function quotationsToInstallerCards(quotes: AiQuotation[]) {
  return quotes.map((quote) => ({
    id: quote.id,
    company: quote.companyName,
    serviceArea: quote.serviceArea,
    rating: quote.rating,
    reviewCount: 0,
    verified: quote.verified,
    price: quote.total,
    panelSpec: quote.panelSpec,
    batterySpec: quote.batterySpec,
    inverterSpec: quote.inverterSpec,
    warrantyYears: quote.warrantyYears,
    installDays: quote.installDays,
    afterSales: quote.standardsApplied,
    reviewSnippet: quote.narrative,
    systemKwp: quote.systemKwp,
    batteryKwh: quote.batteryKwh,
    aiGenerated: true,
    narrative: quote.narrative,
  }))
}
