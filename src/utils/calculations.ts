import type {
  CostEstimate,
  EnergySummary,
  InstallerQuote,
  SelectedAppliance,
  SizingPreferences,
  SolarRecommendation,
  UsagePeriod,
} from '../types'
import { BOTSWANA_LOCATIONS } from '../data/appliances'

const SYSTEM_LOSSES = 0.85
const PERFORMANCE_RATIO = 0.8
const BATTERY_DOD = 0.9
const BATTERY_EFFICIENCY = 0.95
const PANEL_WATTAGE = 550
const SURGE_FACTOR = 1.25

export function calculateDailyEnergy(wattage: number, quantity: number, hours: number): number {
  return Math.max(0, wattage) * Math.max(0, quantity) * Math.max(0, hours)
}

export function calculateTotalLoad(appliances: SelectedAppliance[]): number {
  return appliances.reduce((sum, item) => sum + item.wattage * item.quantity, 0)
}

export function calculatePeakLoad(appliances: SelectedAppliance[]): number {
  if (appliances.length === 0) return 0
  const connected = calculateTotalLoad(appliances)
  const diversity = Math.min(1, 0.45 + appliances.length * 0.04)
  return connected * diversity
}

function splitByPeriod(period: UsagePeriod, dailyWh: number): { day: number; night: number } {
  if (period === 'day') return { day: dailyWh, night: 0 }
  if (period === 'night') return { day: 0, night: dailyWh }
  return { day: dailyWh * 0.55, night: dailyWh * 0.45 }
}

export function buildEnergySummary(appliances: SelectedAppliance[]): EnergySummary {
  let dailyWh = 0
  let daytimeWh = 0
  let nighttimeWh = 0

  const byAppliance = appliances.map((item) => {
    const wh = calculateDailyEnergy(item.wattage, item.quantity, item.hoursPerDay)
    const split = splitByPeriod(item.period, wh)
    dailyWh += wh
    daytimeWh += split.day
    nighttimeWh += split.night
    return { name: item.name, kwh: wh / 1000 }
  })

  byAppliance.sort((a, b) => b.kwh - a.kwh)

  return {
    applianceCount: appliances.reduce((sum, item) => sum + item.quantity, 0),
    connectedLoadW: calculateTotalLoad(appliances),
    dailyWh,
    dailyKwh: dailyWh / 1000,
    peakLoadW: calculatePeakLoad(appliances),
    daytimeKwh: daytimeWh / 1000,
    nighttimeKwh: nighttimeWh / 1000,
    byAppliance,
  }
}

export function calculateSolarCapacity(
  dailyKwh: number,
  preferences: SizingPreferences,
): Pick<SolarRecommendation, 'panelCount' | 'panelWattage' | 'arrayKwp' | 'estimatedDailyGenerationKwh'> {
  const location = BOTSWANA_LOCATIONS.find((l) => l.id === preferences.locationId) ?? BOTSWANA_LOCATIONS[0]
  const expansion = 1 + preferences.expansionPercent / 100
  const priorityFactor =
    preferences.priority === 'lowest_cost' ? 0.95 : preferences.priority === 'max_backup' ? 1.12 : 1

  const requiredArrayKw =
    dailyKwh <= 0
      ? 0
      : (dailyKwh * expansion * priorityFactor) / (location.peakSunHours * SYSTEM_LOSSES * PERFORMANCE_RATIO)

  const panelCount = requiredArrayKw <= 0 ? 0 : Math.max(2, Math.ceil((requiredArrayKw * 1000) / PANEL_WATTAGE))
  const arrayKwp = (panelCount * PANEL_WATTAGE) / 1000
  const estimatedDailyGenerationKwh =
    arrayKwp * location.peakSunHours * SYSTEM_LOSSES * PERFORMANCE_RATIO

  return {
    panelCount,
    panelWattage: PANEL_WATTAGE,
    arrayKwp: Number(arrayKwp.toFixed(2)),
    estimatedDailyGenerationKwh: Number(estimatedDailyGenerationKwh.toFixed(2)),
  }
}

export function calculateBatteryCapacity(
  nighttimeKwh: number,
  preferences: SizingPreferences,
): Pick<SolarRecommendation, 'batteryKwh' | 'usableBatteryKwh' | 'backupHours'> {
  const priorityFactor =
    preferences.priority === 'lowest_cost' ? 0.9 : preferences.priority === 'max_backup' ? 1.2 : 1
  const requiredUsable = nighttimeKwh * preferences.autonomyDays * priorityFactor
  const batteryKwh = requiredUsable <= 0 ? 0 : requiredUsable / (BATTERY_DOD * BATTERY_EFFICIENCY)
  const usableBatteryKwh = batteryKwh * BATTERY_DOD * BATTERY_EFFICIENCY
  const nightlyRate = Math.max(nighttimeKwh, 0.1)
  const backupHours = usableBatteryKwh <= 0 ? 0 : (usableBatteryKwh / nightlyRate) * 24

  return {
    batteryKwh: Number(batteryKwh.toFixed(1)),
    usableBatteryKwh: Number(usableBatteryKwh.toFixed(1)),
    backupHours: Number(backupHours.toFixed(1)),
  }
}

export function calculateInverterSize(
  peakLoadW: number,
  preferences: SizingPreferences,
): Pick<SolarRecommendation, 'inverterKw' | 'peakDemandKw' | 'safetyMarginPercent'> {
  const expansion = 1 + preferences.expansionPercent / 100
  const peakDemandKw = (peakLoadW / 1000) * expansion
  const required = peakDemandKw * SURGE_FACTOR
  const standardSizes = [1, 2, 3, 5, 8, 10, 15, 20, 30]
  const inverterKw =
    required <= 0 ? 0 : standardSizes.find((size) => size >= required) ?? Math.ceil(required)

  return {
    inverterKw,
    peakDemandKw: Number(peakDemandKw.toFixed(2)),
    safetyMarginPercent: peakDemandKw <= 0 ? 0 : Math.round(((inverterKw - peakDemandKw) / peakDemandKw) * 100),
  }
}

export function buildSolarRecommendation(
  summary: EnergySummary,
  preferences: SizingPreferences,
): SolarRecommendation {
  return {
    ...calculateSolarCapacity(summary.dailyKwh, preferences),
    ...calculateBatteryCapacity(summary.nighttimeKwh, preferences),
    ...calculateInverterSize(summary.peakLoadW, preferences),
  }
}

export function calculateCostEstimate(recommendation: SolarRecommendation): CostEstimate {
  const panelLow = recommendation.panelCount * 1450
  const panelHigh = recommendation.panelCount * 1750
  const mountingLow = recommendation.arrayKwp * 1800
  const mountingHigh = recommendation.arrayKwp * 2400
  const inverterLow = recommendation.inverterKw * 4200
  const inverterHigh = recommendation.inverterKw * 5600
  const batteryLow = recommendation.batteryKwh * 4800
  const batteryHigh = recommendation.batteryKwh * 6200
  const protectionLow = 2500 + recommendation.arrayKwp * 350
  const protectionHigh = 3500 + recommendation.arrayKwp * 500
  const cablingLow = 1800 + recommendation.arrayKwp * 280
  const cablingHigh = 2600 + recommendation.arrayKwp * 400
  const installationLow = 6000 + recommendation.arrayKwp * 900
  const installationHigh = 8500 + recommendation.arrayKwp * 1200
  const labourLow = 4000 + recommendation.arrayKwp * 500
  const labourHigh = 5500 + recommendation.arrayKwp * 700

  const subLow =
    panelLow +
    mountingLow +
    inverterLow +
    batteryLow +
    protectionLow +
    cablingLow +
    installationLow +
    labourLow
  const subHigh =
    panelHigh +
    mountingHigh +
    inverterHigh +
    batteryHigh +
    protectionHigh +
    cablingHigh +
    installationHigh +
    labourHigh

  const contingencyLow = subLow * 0.08
  const contingencyHigh = subHigh * 0.1

  const items = [
    { label: 'Solar panels', low: panelLow, high: panelHigh },
    { label: 'Mounting structure', low: mountingLow, high: mountingHigh },
    { label: 'Inverter', low: inverterLow, high: inverterHigh },
    { label: 'Batteries', low: batteryLow, high: batteryHigh },
    { label: 'Protection equipment', low: protectionLow, high: protectionHigh },
    { label: 'Cabling', low: cablingLow, high: cablingHigh },
    { label: 'Installation', low: installationLow, high: installationHigh },
    { label: 'Labour', low: labourLow, high: labourHigh },
    { label: 'Contingency', low: contingencyLow, high: contingencyHigh },
  ].map((item) => ({
    ...item,
    low: Math.round(item.low),
    high: Math.round(item.high),
  }))

  return {
    items,
    totalLow: items.reduce((sum, item) => sum + item.low, 0),
    totalHigh: items.reduce((sum, item) => sum + item.high, 0),
  }
}

export function generateInstallerQuotes(
  recommendation: SolarRecommendation,
  cost: CostEstimate,
): InstallerQuote[] {
  if (recommendation.panelCount === 0) return []

  const mid = (cost.totalLow + cost.totalHigh) / 2
  const base = [
    {
      id: 'demo-solar-delta',
      company: 'Solar Delta BW (Demo)',
      serviceArea: 'Gaborone & South East',
      rating: 4.8,
      reviewCount: 126,
      verified: true,
      priceFactor: 0.96,
      panelBrand: 'Jinko',
      batteryBrand: 'Pylontech',
      inverterBrand: 'Growatt',
      warrantyYears: 10,
      installDays: 7,
      afterSales: '24/7 WhatsApp support',
      reviewSnippet: 'Transparent quote and on-time installation for our Gaborone home.',
    },
    {
      id: 'demo-kalahari-power',
      company: 'Kalahari Power Systems (Demo)',
      serviceArea: 'Nationwide',
      rating: 4.6,
      reviewCount: 89,
      verified: true,
      priceFactor: 1.02,
      panelBrand: 'Canadian Solar',
      batteryBrand: 'BYD',
      inverterBrand: 'Deye',
      warrantyYears: 12,
      installDays: 10,
      afterSales: 'Quarterly maintenance plan',
      reviewSnippet: 'Sized our farm borehole system correctly the first time.',
    },
    {
      id: 'demo-thuto-energy',
      company: 'Thuto Energy Collective (Demo)',
      serviceArea: 'Francistown & North',
      rating: 4.5,
      reviewCount: 64,
      verified: true,
      priceFactor: 0.99,
      panelBrand: 'Trina',
      batteryBrand: 'Hubble',
      inverterBrand: 'Sunsynk',
      warrantyYears: 8,
      installDays: 8,
      afterSales: 'Local technician network',
      reviewSnippet: 'Clear comparison against other quotes and fair pricing.',
    },
    {
      id: 'demo-mokala-solar',
      company: 'Mokala Solar Works (Demo)',
      serviceArea: 'Maun & rural north-west',
      rating: 4.4,
      reviewCount: 41,
      verified: false,
      priceFactor: 1.08,
      panelBrand: 'Longi',
      batteryBrand: 'Freedom Won',
      inverterBrand: 'Victron',
      warrantyYears: 15,
      installDays: 12,
      afterSales: 'Premium remote monitoring',
      reviewSnippet: 'Higher quote, but excellent backup reliability for our lodge.',
    },
  ]

  return base.map((installer) => ({
    id: installer.id,
    company: installer.company,
    serviceArea: installer.serviceArea,
    rating: installer.rating,
    reviewCount: installer.reviewCount,
    verified: installer.verified,
    price: Math.round(mid * installer.priceFactor / 100) * 100,
    panelSpec: `${recommendation.panelCount} × ${recommendation.panelWattage}W ${installer.panelBrand}`,
    batterySpec: `${recommendation.batteryKwh} kWh ${installer.batteryBrand}`,
    inverterSpec: `${recommendation.inverterKw} kW ${installer.inverterBrand} Hybrid`,
    warrantyYears: installer.warrantyYears,
    installDays: installer.installDays,
    afterSales: installer.afterSales,
    reviewSnippet: installer.reviewSnippet,
    systemKwp: recommendation.arrayKwp,
    batteryKwh: recommendation.batteryKwh,
  }))
}

export function formatPula(value: number): string {
  return `P${Math.round(value).toLocaleString('en-BW')}`
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('en-BW', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
