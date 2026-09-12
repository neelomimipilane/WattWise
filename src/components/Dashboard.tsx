import { ArrowRight } from 'lucide-react'
import { useWattWise } from '../context/WattWiseContext'
import { Logo } from './Logo'
import { PrimaryButton, SectionCard } from './ui'

export function Dashboard() {
  const { setView, currentUser } = useWattWise()

  const continueTarget = () => {
    if (!currentUser) {
      setView('register')
      return
    }
    if (currentUser.role === 'company') {
      setView(currentUser.paid ? 'companyPricing' : 'register')
      return
    }
    setView('profile')
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="home-hero relative overflow-hidden rounded-3xl border border-orange/20 shadow-sm">
        <div className="home-hero-glow" aria-hidden />
        <div className="relative px-6 py-14 md:px-12 md:py-20">
          <div className="mb-6 max-w-xs">
            <Logo size={80} />
          </div>
          <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-deep-blue sm:text-5xl">
            Make smarter solar decisions with confidence.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton variant="accent" onClick={continueTarget}>
              {currentUser ? 'Continue' : 'Get started'}
              <ArrowRight className="size-4" />
            </PrimaryButton>
            {!currentUser && (
              <PrimaryButton variant="secondary" onClick={() => setView('login')}>
                Sign in
              </PrimaryButton>
            )}
          </div>
        </div>
      </section>

      <SectionCard
        id="how-it-works"
        title="How It Works"
        subtitle="Follow this process to size your system and compare quotations."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Register',
              text: 'Create a customer or solar company account to begin.',
            },
            {
              step: '02',
              title: 'Add appliances',
              text: 'Choose your profile, then set wattage, quantity, and daily usage hours.',
            },
            {
              step: '03',
              title: 'Set location & preferences',
              text: 'Pick a Botswana location, backup days, expansion, and system priority.',
            },
            {
              step: '04',
              title: 'Review & compare',
              text: 'Get your solar recommendation, cost estimate, and AI installer quotations.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-white/80 p-4">
              <p className="font-display text-2xl font-bold text-orange">{item.step}</p>
              <h3 className="mt-2 font-semibold text-deep-blue">{item.title}</h3>
              <p className="mt-1 text-sm text-dark-text/65">{item.text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
