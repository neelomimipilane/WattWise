import {
  Bot,
  CircleHelp,
  ClipboardList,
  Gauge,
  Home,
  LogIn,
  MapPin,
  PlugZap,
  Receipt,
  RotateCcw,
  Settings2,
  SolarPanel,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import type { AppView } from '../types'
import { useWattWise } from '../context/WattWiseContext'
import { Logo } from './Logo'

interface NavItem {
  id: AppView
  label: string
  icon: typeof Home
}

const CUSTOMER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'profile', label: 'Energy Assessment', icon: Users },
  { id: 'appliances', label: 'My Appliances', icon: PlugZap },
  { id: 'preferences', label: 'Location & Prefs', icon: MapPin },
  { id: 'recommendation', label: 'Solar Recommendation', icon: SolarPanel },
  { id: 'cost', label: 'Cost Estimate', icon: Wallet },
  { id: 'installers', label: 'Installer Quotes', icon: Receipt },
  { id: 'saved', label: 'Saved Assessments', icon: ClipboardList },
  { id: 'help', label: 'Help', icon: CircleHelp },
]

const COMPANY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'companyPricing', label: 'Prices & Standards', icon: Settings2 },
  { id: 'companyQuotes', label: 'AI Quotations', icon: Bot },
  { id: 'profile', label: 'Demo Assessment', icon: Users },
  { id: 'installers', label: 'Marketplace Preview', icon: Receipt },
  { id: 'help', label: 'Help', icon: CircleHelp },
]

const GUEST_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'register', label: 'Register', icon: UserPlus },
  { id: 'login', label: 'Sign in', icon: LogIn },
  { id: 'help', label: 'Help', icon: CircleHelp },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { view, setView, resetAssessment, profile, progressStep, currentUser, logout } = useWattWise()

  const nav =
    currentUser?.role === 'company' && currentUser.paid
      ? COMPANY_NAV
      : currentUser?.role === 'customer'
        ? CUSTOMER_NAV
        : GUEST_NAV

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-dark-text/40 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-border p-4">
          <Logo size={48} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active
                    ? 'bg-deep-blue text-white shadow-sm'
                    : 'text-dark-text hover:bg-light-bg'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          {currentUser?.role === 'customer' && (
            <div className="rounded-xl bg-light-bg p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-deep-blue">
                <Gauge className="size-4 text-orange" />
                Assessment status
              </div>
              <p className="text-xs text-dark-text/70">
                {profile
                  ? `${profile[0].toUpperCase()}${profile.slice(1)} · Step ${Math.min(progressStep + 1, 6)} of 6`
                  : 'No active assessment'}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-bright-cyan/15 font-display text-sm font-bold text-deep-blue">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'WW'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-dark-text">
                {currentUser
                  ? currentUser.role === 'company'
                    ? currentUser.companyName || currentUser.name
                    : currentUser.name
                  : 'Guest'}
              </p>
              <p className="text-xs text-dark-text/60">
                {currentUser ? (currentUser.role === 'company' ? 'Solar company' : 'Customer') : 'Not signed in'}
              </p>
            </div>
          </div>
          {currentUser?.role === 'customer' && (
            <button
              type="button"
              onClick={resetAssessment}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-dark-text hover:bg-light-bg"
            >
              <RotateCcw className="size-4" />
              Reset assessment
            </button>
          )}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout()
                onClose()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-dark-text hover:bg-light-bg"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
