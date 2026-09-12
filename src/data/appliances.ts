import type { ApplianceTemplate, LocationOption, ProfileType } from '../types'

export const PROFILE_META: Record<
  ProfileType,
  { title: string; description: string; useCase: string }
> = {
  household: {
    title: 'Household',
    description: 'Homes and family compounds needing reliable day-to-night power.',
    useCase: 'Typical use: lights, fridge, TV, fans, phones, and small appliances.',
  },
  farm: {
    title: 'Farm',
    description: 'Agricultural sites with pumps, coolers, and workshop tools.',
    useCase: 'Typical use: borehole pumps, irrigation, fencing, and cold storage.',
  },
  business: {
    title: 'Business',
    description: 'Shops, offices, and workshops that cannot afford downtime.',
    useCase: 'Typical use: refrigeration, POS, computers, CCTV, and AC.',
  },
}

export const APPLIANCE_DATABASE: ApplianceTemplate[] = [
  // Household
  { id: 'h-lights', name: 'LED Lights', category: 'Lighting', wattage: 12, defaultHours: 6, defaultPeriod: 'night', profiles: ['household'] },
  { id: 'h-tv', name: 'Television', category: 'Entertainment', wattage: 120, defaultHours: 5, defaultPeriod: 'both', profiles: ['household'] },
  { id: 'h-fridge', name: 'Refrigerator', category: 'Cooling', wattage: 150, defaultHours: 10, defaultPeriod: 'both', profiles: ['household'] },
  { id: 'h-freezer', name: 'Freezer', category: 'Cooling', wattage: 200, defaultHours: 8, defaultPeriod: 'both', profiles: ['household'] },
  { id: 'h-fan', name: 'Ceiling / Standing Fan', category: 'Comfort', wattage: 70, defaultHours: 8, defaultPeriod: 'day', profiles: ['household'] },
  { id: 'h-laptop', name: 'Laptop', category: 'Electronics', wattage: 65, defaultHours: 6, defaultPeriod: 'day', profiles: ['household'] },
  { id: 'h-phone', name: 'Phone Chargers', category: 'Electronics', wattage: 15, defaultHours: 3, defaultPeriod: 'night', profiles: ['household'] },
  { id: 'h-microwave', name: 'Microwave', category: 'Kitchen', wattage: 1000, defaultHours: 0.4, defaultPeriod: 'day', profiles: ['household'] },
  { id: 'h-kettle', name: 'Electric Kettle', category: 'Kitchen', wattage: 1800, defaultHours: 0.3, defaultPeriod: 'day', profiles: ['household'] },
  { id: 'h-washer', name: 'Washing Machine', category: 'Laundry', wattage: 500, defaultHours: 1, defaultPeriod: 'day', profiles: ['household'] },
  { id: 'h-ac', name: 'Air Conditioner', category: 'Comfort', wattage: 1500, defaultHours: 5, defaultPeriod: 'day', profiles: ['household'] },
  // Farm
  { id: 'f-borehole', name: 'Borehole Pump', category: 'Water', wattage: 1100, defaultHours: 4, defaultPeriod: 'day', profiles: ['farm'] },
  { id: 'f-irrigation', name: 'Irrigation Pump', category: 'Water', wattage: 2200, defaultHours: 5, defaultPeriod: 'day', profiles: ['farm'] },
  { id: 'f-fence', name: 'Electric Fence', category: 'Security', wattage: 40, defaultHours: 24, defaultPeriod: 'both', profiles: ['farm'] },
  { id: 'f-freezer', name: 'Farm Freezer', category: 'Cooling', wattage: 300, defaultHours: 10, defaultPeriod: 'both', profiles: ['farm'] },
  { id: 'f-water', name: 'Water Pump', category: 'Water', wattage: 750, defaultHours: 3, defaultPeriod: 'day', profiles: ['farm'] },
  { id: 'f-security', name: 'Security Lights', category: 'Lighting', wattage: 50, defaultHours: 10, defaultPeriod: 'night', profiles: ['farm'] },
  { id: 'f-tools', name: 'Workshop Tools', category: 'Workshop', wattage: 1200, defaultHours: 2, defaultPeriod: 'day', profiles: ['farm'] },
  { id: 'f-milk', name: 'Milk Cooler', category: 'Cooling', wattage: 900, defaultHours: 8, defaultPeriod: 'both', profiles: ['farm'] },
  { id: 'f-mixer', name: 'Feed Mixer', category: 'Agriculture', wattage: 1500, defaultHours: 1.5, defaultPeriod: 'day', profiles: ['farm'] },
  { id: 'f-agri', name: 'Agricultural Equipment', category: 'Agriculture', wattage: 2000, defaultHours: 2, defaultPeriod: 'day', profiles: ['farm'] },
  // Business
  { id: 'b-fridge', name: 'Commercial Refrigerator', category: 'Cooling', wattage: 450, defaultHours: 12, defaultPeriod: 'both', profiles: ['business'] },
  { id: 'b-freezer', name: 'Commercial Freezer', category: 'Cooling', wattage: 600, defaultHours: 12, defaultPeriod: 'both', profiles: ['business'] },
  { id: 'b-pos', name: 'POS System', category: 'Retail', wattage: 80, defaultHours: 10, defaultPeriod: 'day', profiles: ['business'] },
  { id: 'b-desktop', name: 'Desktop Computers', category: 'Office', wattage: 200, defaultHours: 8, defaultPeriod: 'day', profiles: ['business'] },
  { id: 'b-printer', name: 'Printers', category: 'Office', wattage: 350, defaultHours: 1, defaultPeriod: 'day', profiles: ['business'] },
  { id: 'b-cctv', name: 'CCTV System', category: 'Security', wattage: 120, defaultHours: 24, defaultPeriod: 'both', profiles: ['business'] },
  { id: 'b-server', name: 'Server', category: 'IT', wattage: 400, defaultHours: 24, defaultPeriod: 'both', profiles: ['business'] },
  { id: 'b-lights', name: 'Office Lighting', category: 'Lighting', wattage: 18, defaultHours: 10, defaultPeriod: 'day', profiles: ['business'] },
  { id: 'b-ac', name: 'Air Conditioners', category: 'Comfort', wattage: 1800, defaultHours: 8, defaultPeriod: 'day', profiles: ['business'] },
  { id: 'b-workshop', name: 'Workshop Equipment', category: 'Workshop', wattage: 2500, defaultHours: 4, defaultPeriod: 'day', profiles: ['business'] },
]

export const BOTSWANA_LOCATIONS: LocationOption[] = [
  { id: 'gaborone', name: 'Gaborone', peakSunHours: 5.6, description: 'Strong urban solar resource with high irradiance.' },
  { id: 'francistown', name: 'Francistown', peakSunHours: 5.5, description: 'Reliable northern corridor sunshine.' },
  { id: 'maun', name: 'Maun', peakSunHours: 5.8, description: 'Excellent delta-region solar potential.' },
  { id: 'kasane', name: 'Kasane', peakSunHours: 5.4, description: 'Good resource with seasonal cloud variation.' },
  { id: 'kanye', name: 'Kanye', peakSunHours: 5.7, description: 'High southern plateau irradiance.' },
  { id: 'molepolole', name: 'Molepolole', peakSunHours: 5.6, description: 'Strong central district solar availability.' },
  { id: 'serowe', name: 'Serowe', peakSunHours: 5.7, description: 'Consistent inland peak sun hours.' },
  { id: 'palapye', name: 'Palapye', peakSunHours: 5.6, description: 'Solid solar resource near the eastern corridor.' },
  { id: 'other', name: 'Other / Rural Location', peakSunHours: 5.5, description: 'Conservative Botswana rural average.' },
]

export function appliancesForProfile(profile: ProfileType | null): ApplianceTemplate[] {
  if (!profile) return []
  return APPLIANCE_DATABASE.filter((item) => item.profiles.includes(profile))
}
