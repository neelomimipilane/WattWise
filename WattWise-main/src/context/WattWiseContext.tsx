import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AiQuotation,
  AppView,
  CompanyPricing,
  InstallerQuote,
  ProfileType,
  RegisteredUser,
  SelectedAppliance,
  SizingPreferences,
  UsagePeriod,
  UserRole,
} from '../types'
import { DEFAULT_COMPANY_PRICING, REGISTRATION_FEES } from '../types'
import { appliancesForProfile } from '../data/appliances'
import {
  buildEnergySummary,
  buildSolarRecommendation,
  calculateCostEstimate,
  generateInstallerQuotes,
} from '../utils/calculations'
import { generateAiQuotation, quotationsToInstallerCards } from '../utils/aiQuotation'

const DEFAULT_PREFERENCES: SizingPreferences = {
  locationId: 'gaborone',
  autonomyDays: 1,
  expansionPercent: 10,
  priority: 'balanced',
}

const USERS_KEY = 'wattwise-users'
const SESSION_KEY = 'wattwise-session'

interface ToastState {
  message: string
  tone: 'success' | 'warning' | 'info'
}

interface AssessmentSnapshot {
  id: string
  savedAt: string
  profile: ProfileType
  applianceCount: number
  dailyKwh: number
  arrayKwp: number
  costLow: number
  costHigh: number
}

interface WattWiseContextValue {
  view: AppView
  setView: (view: AppView) => void
  profile: ProfileType | null
  setProfile: (profile: ProfileType) => void
  appliances: SelectedAppliance[]
  addAppliance: (templateId: string, quantity: number, hours: number, period: UsagePeriod) => void
  updateAppliance: (id: string, patch: Partial<SelectedAppliance>) => void
  removeAppliance: (id: string) => void
  preferences: SizingPreferences
  setPreferences: (patch: Partial<SizingPreferences>) => void
  energySummary: ReturnType<typeof buildEnergySummary>
  recommendation: ReturnType<typeof buildSolarRecommendation>
  costEstimate: ReturnType<typeof calculateCostEstimate>
  installerQuotes: InstallerQuote[]
  compareIds: string[]
  toggleCompare: (id: string) => void
  savedAssessments: AssessmentSnapshot[]
  saveAssessment: () => void
  resetAssessment: () => void
  toast: ToastState | null
  showToast: (message: string, tone?: ToastState['tone']) => void
  clearToast: () => void
  progressStep: number
  highDemandWarning: boolean
  currentUser: RegisteredUser | null
  users: RegisteredUser[]
  registerUser: (input: {
    role: UserRole
    name: string
    email: string
    phone: string
    password: string
    companyName?: string
  }) => boolean
  completeRegistrationPayment: (paymentRef: string) => boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  updateCompanyPricing: (pricing: CompanyPricing) => void
  companyAiQuotes: AiQuotation[]
  regenerateCompanyQuote: () => void
  marketplaceQuotes: InstallerQuote[]
}

const WattWiseContext = createContext<WattWiseContextValue | null>(null)

function loadUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : []
  } catch {
    return []
  }
}

export function WattWiseProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('dashboard')
  const [profile, setProfileState] = useState<ProfileType | null>(null)
  const [appliances, setAppliances] = useState<SelectedAppliance[]>([])
  const [preferences, setPreferencesState] = useState<SizingPreferences>(DEFAULT_PREFERENCES)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedAssessments, setSavedAssessments] = useState<AssessmentSnapshot[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>(() => loadUsers())
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))
  const [pendingRegistrationId, setPendingRegistrationId] = useState<string | null>(null)
  const [companyAiQuotes, setCompanyAiQuotes] = useState<AiQuotation[]>([])

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId],
  )

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId)
    else localStorage.removeItem(SESSION_KEY)
  }, [currentUserId])

  const energySummary = useMemo(() => buildEnergySummary(appliances), [appliances])
  const recommendation = useMemo(
    () => buildSolarRecommendation(energySummary, preferences),
    [energySummary, preferences],
  )
  const costEstimate = useMemo(() => calculateCostEstimate(recommendation), [recommendation])
  const demoQuotes = useMemo(
    () => generateInstallerQuotes(recommendation, costEstimate),
    [recommendation, costEstimate],
  )

  const marketplaceQuotes = useMemo((): InstallerQuote[] => {
    const paidCompanies = users.filter((user) => user.role === 'company' && user.paid && user.pricing)
    const ai = paidCompanies
      .map((company) => generateAiQuotation(company, recommendation))
      .filter((quote): quote is AiQuotation => Boolean(quote))
    const fromCompanies = quotationsToInstallerCards(ai)
    if (fromCompanies.length > 0) return fromCompanies
    return demoQuotes.map((q) => ({ ...q, aiGenerated: false }))
  }, [users, recommendation, demoQuotes])

  const installerQuotes = marketplaceQuotes

  const highDemandWarning = energySummary.dailyKwh > 40 || energySummary.peakLoadW > 8000

  const progressStep = useMemo(() => {
    if (!profile) return 0
    if (appliances.length === 0) return 1
    if (view === 'preferences') return 2
    if (view === 'recommendation') return 3
    if (view === 'cost') return 4
    if (view === 'installers') return 5
    return 1
  }, [profile, appliances.length, view])

  const showToast = useCallback((message: string, tone: ToastState['tone'] = 'info') => {
    setToast({ message, tone })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const setProfile = useCallback(
    (next: ProfileType) => {
      setProfileState(next)
      setAppliances([])
      setCompareIds([])
      showToast(`${next.charAt(0).toUpperCase()}${next.slice(1)} profile selected`, 'success')
    },
    [showToast],
  )

  const setPreferences = useCallback((patch: Partial<SizingPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...patch }))
  }, [])

  const addAppliance = useCallback(
    (templateId: string, quantity: number, hours: number, period: UsagePeriod) => {
      if (!profile) {
        showToast('Select a profile first', 'warning')
        return
      }
      if (quantity <= 0 || hours < 0 || hours > 24) {
        showToast('Enter a valid quantity and hours (0–24)', 'warning')
        return
      }
      const template = appliancesForProfile(profile).find((item) => item.id === templateId)
      if (!template) {
        showToast('Appliance not found for this profile', 'warning')
        return
      }

      setAppliances((prev) => [
        ...prev,
        {
          id: `${template.id}-${Date.now()}`,
          templateId: template.id,
          name: template.name,
          category: template.category,
          wattage: template.wattage,
          quantity,
          hoursPerDay: hours,
          period,
        },
      ])
      showToast(`${template.name} added`, 'success')
    },
    [profile, showToast],
  )

  const updateAppliance = useCallback((id: string, patch: Partial<SelectedAppliance>) => {
    setAppliances((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, ...patch }
        next.quantity = Math.max(1, Math.round(next.quantity))
        next.wattage = Math.max(1, next.wattage)
        next.hoursPerDay = Math.min(24, Math.max(0, next.hoursPerDay))
        return next
      }),
    )
  }, [])

  const removeAppliance = useCallback(
    (id: string) => {
      setAppliances((prev) => prev.filter((item) => item.id !== id))
      showToast('Appliance removed', 'info')
    },
    [showToast],
  )

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }, [])

  const saveAssessment = useCallback(() => {
    if (!profile || appliances.length === 0) {
      showToast('Add appliances before saving', 'warning')
      return
    }
    if (!currentUser || currentUser.role !== 'customer') {
      showToast('Sign in as a customer to save assessments', 'warning')
      setView('register')
      return
    }
    const snapshot: AssessmentSnapshot = {
      id: `save-${Date.now()}`,
      savedAt: new Date().toLocaleString('en-BW'),
      profile,
      applianceCount: energySummary.applianceCount,
      dailyKwh: energySummary.dailyKwh,
      arrayKwp: recommendation.arrayKwp,
      costLow: costEstimate.totalLow,
      costHigh: costEstimate.totalHigh,
    }
    setSavedAssessments((prev) => [snapshot, ...prev])
    showToast('Assessment saved', 'success')
    setView('saved')
  }, [
    profile,
    appliances.length,
    currentUser,
    energySummary,
    recommendation.arrayKwp,
    costEstimate,
    showToast,
  ])

  const resetAssessment = useCallback(() => {
    setProfileState(null)
    setAppliances([])
    setPreferencesState(DEFAULT_PREFERENCES)
    setCompareIds([])
    setCompanyAiQuotes([])
    setView('dashboard')
    showToast('Assessment reset', 'info')
  }, [showToast])

  const registerUser = useCallback(
    (input: {
      role: UserRole
      name: string
      email: string
      phone: string
      password: string
      companyName?: string
    }) => {
      if (!input.name.trim() || !input.email.trim() || input.password.length < 6) {
        showToast('Enter name, email, and a password (min 6 characters)', 'warning')
        return false
      }
      if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
        showToast('An account with this email already exists', 'warning')
        return false
      }
      if (input.role === 'company' && !input.companyName?.trim()) {
        showToast('Company name is required for solar companies', 'warning')
        return false
      }

      const id = `user-${Date.now()}`
      const isCustomer = input.role === 'customer'
      const user: RegisteredUser = {
        id,
        role: input.role,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        companyName: input.companyName?.trim(),
        password: input.password,
        paid: isCustomer,
        registrationFee: REGISTRATION_FEES[input.role],
        paidAt: isCustomer ? new Date().toLocaleString('en-BW') : undefined,
        pricing: input.role === 'company' ? { ...DEFAULT_COMPANY_PRICING } : undefined,
      }
      setUsers((prev) => [...prev, user])
      if (isCustomer) {
        setCurrentUserId(id)
        setPendingRegistrationId(null)
        showToast('Account created', 'success')
        setView('profile')
        return true
      }
      setPendingRegistrationId(id)
      showToast('Registration complete — continue to payment', 'info')
      setView('payment')
      return true
    },
    [users, showToast],
  )

  const completeRegistrationPayment = useCallback(
    (paymentRef: string) => {
      const targetId =
        pendingRegistrationId ??
        [...users].reverse().find((user) => user.role === 'company' && !user.paid)?.id ??
        null
      if (!targetId) {
        showToast('No pending registration found', 'warning')
        return false
      }
      if (paymentRef.trim().length < 4) {
        showToast('Enter a valid payment reference', 'warning')
        return false
      }

      const pendingUser = users.find((user) => user.id === targetId)
      setUsers((prev) =>
        prev.map((user) =>
          user.id === targetId
            ? { ...user, paid: true, paidAt: new Date().toLocaleString('en-BW') }
            : user,
        ),
      )
      setCurrentUserId(targetId)
      setPendingRegistrationId(null)
      showToast('Payment successful — account activated', 'success')
      setView(pendingUser?.role === 'company' ? 'companyPricing' : 'profile')
      return true
    },
    [pendingRegistrationId, users, showToast],
  )

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
      )
      if (!user) {
        showToast('Invalid email or password', 'warning')
        return false
      }
      if (!user.paid) {
        setPendingRegistrationId(user.id)
        setView('payment')
        showToast('Complete payment to activate your company account', 'warning')
        return false
      }
      setCurrentUserId(user.id)
      showToast(`Welcome back, ${user.name}`, 'success')
      setView(user.role === 'company' ? 'companyPricing' : 'dashboard')
      return true
    },
    [users, showToast],
  )

  const logout = useCallback(() => {
    setCurrentUserId(null)
    setView('dashboard')
    showToast('Signed out', 'info')
  }, [showToast])

  const updateCompanyPricing = useCallback(
    (pricing: CompanyPricing) => {
      if (!currentUser || currentUser.role !== 'company') return
      setUsers((prev) =>
        prev.map((user) => (user.id === currentUser.id ? { ...user, pricing } : user)),
      )
      showToast('Panel prices, labour rates, and standards saved', 'success')
    },
    [currentUser, showToast],
  )

  const regenerateCompanyQuote = useCallback(() => {
    if (!currentUser || currentUser.role !== 'company' || !currentUser.pricing) {
      showToast('Save company pricing first', 'warning')
      return
    }
    if (recommendation.panelCount === 0) {
      showToast('No customer system sized yet — use a sample assessment or wait for customer demand', 'warning')
      return
    }
    const quote = generateAiQuotation(currentUser, recommendation)
    if (!quote) return
    setCompanyAiQuotes((prev) => [quote, ...prev])
    showToast('AI quotation generated from your prices and standards', 'success')
    setView('companyQuotes')
  }, [currentUser, recommendation, showToast])

  const value: WattWiseContextValue = {
    view,
    setView,
    profile,
    setProfile,
    appliances,
    addAppliance,
    updateAppliance,
    removeAppliance,
    preferences,
    setPreferences,
    energySummary,
    recommendation,
    costEstimate,
    installerQuotes,
    compareIds,
    toggleCompare,
    savedAssessments,
    saveAssessment,
    resetAssessment,
    toast,
    showToast,
    clearToast,
    progressStep,
    highDemandWarning,
    currentUser,
    users,
    registerUser,
    completeRegistrationPayment,
    login,
    logout,
    updateCompanyPricing,
    companyAiQuotes,
    regenerateCompanyQuote,
    marketplaceQuotes,
  }

  return <WattWiseContext.Provider value={value}>{children}</WattWiseContext.Provider>
}

export function useWattWise() {
  const ctx = useContext(WattWiseContext)
  if (!ctx) throw new Error('useWattWise must be used within WattWiseProvider')
  return ctx
}
