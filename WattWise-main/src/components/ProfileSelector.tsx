import { Building2, Check, Home, Tractor } from 'lucide-react'
import { PROFILE_META } from '../data/appliances'
import { useWattWise } from '../context/WattWiseContext'
import type { ProfileType } from '../types'
import { PrimaryButton, SectionCard } from './ui'

const ICONS = {
  household: Home,
  farm: Tractor,
  business: Building2,
}

export function ProfileSelector() {
  const { profile, setProfile, setView, currentUser } = useWattWise()

  if (!currentUser) {
    return (
      <SectionCard title="Energy assessment" subtitle="Create a free customer account to continue.">
        <PrimaryButton variant="accent" onClick={() => setView('register')}>
          Register now
        </PrimaryButton>
      </SectionCard>
    )
  }

  if (currentUser.role === 'company') {
    return (
      <SectionCard title="Company portal" subtitle="Use Prices & Standards to manage your rate card.">
        <PrimaryButton variant="primary" onClick={() => setView('companyPricing')}>
          Go to prices & standards
        </PrimaryButton>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Select your energy profile"
      subtitle="This choice filters appliances and influences sizing assumptions for your Watt-Wise plan."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(PROFILE_META) as ProfileType[]).map((key) => {
          const meta = PROFILE_META[key]
          const Icon = ICONS[key]
          const selected = profile === key
          return (
            <div
              key={key}
              className={`rounded-2xl border p-5 transition ${
                selected
                  ? 'border-orange bg-orange/5 shadow-md ring-2 ring-orange/30'
                  : 'border-border bg-white hover:border-cyan-blue'
              }`}
            >
              <div
                className={`mb-4 flex size-12 items-center justify-center rounded-xl ${
                  selected ? 'bg-orange text-white' : 'bg-deep-blue text-white'
                }`}
              >
                <Icon className="size-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-deep-blue">{meta.title}</h3>
              <p className="mt-2 text-sm text-dark-text/70">{meta.description}</p>
              <p className="mt-3 text-xs font-medium text-dark-text/55">{meta.useCase}</p>
              <PrimaryButton
                className="mt-5 w-full"
                variant={selected ? 'accent' : 'primary'}
                onClick={() => {
                  setProfile(key)
                  setView('appliances')
                }}
              >
                {selected ? (
                  <>
                    <Check className="size-4" /> Selected — Continue
                  </>
                ) : (
                  'Select'
                )}
              </PrimaryButton>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
