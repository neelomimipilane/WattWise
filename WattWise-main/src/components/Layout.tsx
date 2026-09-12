import { useState, type ReactNode } from 'react'
import { useWattWise } from '../context/WattWiseContext'
import type { AppView } from '../types'
import { AppliancesPage } from './ApplianceForm'
import { LoginPage, PaymentPage, RegisterPage } from './AuthPages'
import { CompanyPricingPage, CompanyQuotesPage } from './CompanyPortal'
import { CostBreakdown } from './CostBreakdown'
import { Dashboard } from './Dashboard'
import { HelpPage, SavedAssessments } from './SavedHelp'
import { InstallerComparison } from './InstallerComparison'
import { LocationSelector } from './LocationSelector'
import { ProfileSelector } from './ProfileSelector'
import { ProgressStepper } from './ProgressStepper'
import { Sidebar } from './Sidebar'
import { SolarRecommendation } from './SolarRecommendation'
import { ToastNotification } from './ToastNotification'
import { Topbar } from './Topbar'

const TITLES: Record<AppView, string> = {
  dashboard: '',
  register: 'Register',
  payment: 'Payment',
  login: 'Sign in',
  profile: 'Energy Assessment',
  appliances: 'My Appliances',
  preferences: 'Location & Preferences',
  recommendation: 'Solar Recommendation',
  cost: 'Cost Estimate',
  installers: 'Installer Quotes',
  saved: 'Saved Assessments',
  help: 'Help',
  companyPricing: 'Prices & Standards',
  companyQuotes: 'AI Quotations',
  account: 'Account',
}

const CUSTOMER_STEPS: AppView[] = [
  'profile',
  'appliances',
  'preferences',
  'recommendation',
  'cost',
  'installers',
  'saved',
]

export function Layout() {
  const { view, currentUser } = useWattWise()
  const [menuOpen, setMenuOpen] = useState(false)

  const signedIn =
    Boolean(currentUser) &&
    (currentUser?.role === 'customer' || (currentUser?.role === 'company' && currentUser.paid))

  let content: ReactNode
  switch (view) {
    case 'dashboard':
      content = <Dashboard />
      break
    case 'register':
      content = <RegisterPage />
      break
    case 'payment':
      content = <PaymentPage />
      break
    case 'login':
      content = <LoginPage />
      break
    case 'profile':
      content = <ProfileSelector />
      break
    case 'appliances':
      content = <AppliancesPage />
      break
    case 'preferences':
      content = <LocationSelector />
      break
    case 'recommendation':
      content = <SolarRecommendation />
      break
    case 'cost':
      content = <CostBreakdown />
      break
    case 'installers':
      content = <InstallerComparison />
      break
    case 'saved':
      content = <SavedAssessments />
      break
    case 'help':
      content = <HelpPage />
      break
    case 'companyPricing':
      content = <CompanyPricingPage />
      break
    case 'companyQuotes':
      content = <CompanyQuotesPage />
      break
    default:
      content = <Dashboard />
  }

  const showStepper =
    signedIn && currentUser?.role === 'customer' && CUSTOMER_STEPS.includes(view)

  return (
    <div className={`min-h-screen ${signedIn ? 'lg:flex' : ''} ${view === 'dashboard' ? 'home-shell' : 'bg-light-bg'}`}>
      {signedIn && <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={TITLES[view]} onMenu={() => setMenuOpen(true)} showMenu={signedIn} />
        <main className="flex-1 space-y-4 p-4 lg:p-6">
          {showStepper && <ProgressStepper />}
          {content}
        </main>
        {view !== 'dashboard' && (
          <footer className="border-t border-border bg-white/90 px-4 py-4 text-center text-xs text-dark-text/55 lg:px-6">
            Watt-Wise · Know Your Power
          </footer>
        )}
      </div>
      <ToastNotification />
    </div>
  )
}
