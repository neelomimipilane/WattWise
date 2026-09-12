export type ProfileType = 'household' | 'farm' | 'business'

export type UserRole = 'customer' | 'company'

export type AppView =
  | 'dashboard'
  | 'register'
  | 'payment'
  | 'login'
  | 'profile'
  | 'appliances'
  | 'preferences'
  | 'recommendation'
  | 'cost'
  | 'installers'
  | 'saved'
  | 'help'
  | 'companyPricing'
  | 'companyQuotes'
  | 'account'

export type SystemPriority = 'lowest_cost' | 'balanced' | 'max_backup'
export type UsagePeriod = 'day' | 'night' | 'both'

export interface ApplianceTemplate {
  id: string
  name: string
  category: string
  wattage: number
  defaultHours: number
  defaultPeriod: UsagePeriod
  profiles: ProfileType[]
}

export interface SelectedAppliance {
  id: string
  templateId: string
  name: string
  category: string
  wattage: number
  quantity: number
  hoursPerDay: number
  period: UsagePeriod
}

export interface LocationOption {
  id: string
  name: string
  peakSunHours: number
  description: string
}

export interface SizingPreferences {
  locationId: string
  autonomyDays: 0.5 | 1 | 2 | 3
  expansionPercent: 0 | 10 | 20 | 30
  priority: SystemPriority
}

export interface EnergySummary {
  applianceCount: number
  connectedLoadW: number
  dailyWh: number
  dailyKwh: number
  peakLoadW: number
  daytimeKwh: number
  nighttimeKwh: number
  byAppliance: { name: string; kwh: number }[]
}

export interface SolarRecommendation {
  panelCount: number
  panelWattage: number
  arrayKwp: number
  estimatedDailyGenerationKwh: number
  batteryKwh: number
  usableBatteryKwh: number
  backupHours: number
  inverterKw: number
  peakDemandKw: number
  safetyMarginPercent: number
}

export interface CostLineItem {
  label: string
  low: number
  high: number
}

export interface CostEstimate {
  items: CostLineItem[]
  totalLow: number
  totalHigh: number
}

export interface CompanyPricing {
  panelBrand: string
  panelWattage: number
  panelPrice: number
  panelEfficiency: number
  panelWarrantyYears: number
  batteryBrand: string
  batteryPricePerKwh: number
  inverterBrand: string
  inverterPricePerKw: number
  labourPerKwp: number
  labourDayRate: number
  estimatedInstallDaysPerKwp: number
  mountingPerKwp: number
  protectionFlat: number
  cablingPerKwp: number
  contingencyPercent: number
  serviceArea: string
  standardsNotes: string
}

export interface RegisteredUser {
  id: string
  role: UserRole
  name: string
  email: string
  phone: string
  companyName?: string
  password: string
  paid: boolean
  registrationFee: number
  paidAt?: string
  pricing?: CompanyPricing
}

export interface AiQuotationLine {
  label: string
  amount: number
  detail: string
}

export interface AiQuotation {
  id: string
  companyId: string
  companyName: string
  generatedAt: string
  narrative: string
  lines: AiQuotationLine[]
  total: number
  panelSpec: string
  batterySpec: string
  inverterSpec: string
  warrantyYears: number
  installDays: number
  standardsApplied: string
  systemKwp: number
  batteryKwh: number
  rating: number
  verified: boolean
  serviceArea: string
}

export interface InstallerQuote {
  id: string
  company: string
  serviceArea: string
  rating: number
  reviewCount: number
  verified: boolean
  price: number
  panelSpec: string
  batterySpec: string
  inverterSpec: string
  warrantyYears: number
  installDays: number
  afterSales: string
  reviewSnippet: string
  systemKwp: number
  batteryKwh: number
  aiGenerated?: boolean
  narrative?: string
}

export const REGISTRATION_FEES: Record<UserRole, number> = {
  customer: 0,
  company: 850,
}

export const DEFAULT_COMPANY_PRICING: CompanyPricing = {
  panelBrand: 'Jinko Tiger Neo',
  panelWattage: 550,
  panelPrice: 1650,
  panelEfficiency: 21.5,
  panelWarrantyYears: 12,
  batteryBrand: 'Pylontech',
  batteryPricePerKwh: 5200,
  inverterBrand: 'Deye Hybrid',
  inverterPricePerKw: 4800,
  labourPerKwp: 1100,
  labourDayRate: 850,
  estimatedInstallDaysPerKwp: 1.8,
  mountingPerKwp: 2100,
  protectionFlat: 3200,
  cablingPerKwp: 380,
  contingencyPercent: 8,
  serviceArea: 'Gaborone & surrounding',
  standardsNotes: 'IEC 61215 panels · BOS compliant cabling · BPC-ready hybrid inverters',
}
