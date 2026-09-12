import { Building2, CreditCard, Lock, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useWattWise } from '../context/WattWiseContext'
import { REGISTRATION_FEES, type UserRole } from '../types'
import { formatPula } from '../utils/calculations'
import { PrimaryButton, SectionCard } from './ui'

export function RegisterPage() {
  const { registerUser, setView } = useWattWise()
  const [role, setRole] = useState<UserRole>('customer')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    registerUser({
      role,
      name,
      email,
      phone,
      password,
      companyName: role === 'company' ? companyName : undefined,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <SectionCard
        title="Create your Watt-Wise account"
        subtitle="Choose your account type to continue."
      >
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`rounded-2xl border p-4 text-left transition ${
              role === 'customer' ? 'border-orange bg-orange/5 ring-2 ring-orange/20' : 'border-border'
            }`}
          >
            <UserRound className="mb-2 size-6 text-deep-blue" />
            <p className="font-display font-bold text-deep-blue">Customer</p>
          </button>
          <button
            type="button"
            onClick={() => setRole('company')}
            className={`rounded-2xl border p-4 text-left transition ${
              role === 'company' ? 'border-orange bg-orange/5 ring-2 ring-orange/20' : 'border-border'
            }`}
          >
            <Building2 className="mb-2 size-6 text-deep-blue" />
            <p className="font-display font-bold text-deep-blue">Solar company</p>
          </button>
        </div>

        <form onSubmit={submitDetails} className="space-y-3">
          <Field label="Full name" value={name} onChange={setName} required />
          {role === 'company' && (
            <Field label="Company name" value={companyName} onChange={setCompanyName} required />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <div className="flex flex-wrap gap-3 pt-2">
            <PrimaryButton type="submit" variant="accent">
              Create account
            </PrimaryButton>
            <PrimaryButton type="button" variant="ghost" onClick={() => setView('login')}>
              Already registered? Sign in
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export function PaymentPage() {
  const { completeRegistrationPayment, users, setView, showToast } = useWattWise()
  const unpaidCompany = [...users].reverse().find((user) => user.role === 'company' && !user.paid)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paying, setPaying] = useState(false)
  const fee = REGISTRATION_FEES.company

  if (!unpaidCompany) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <SectionCard title="Payment" subtitle="No pending company registration found.">
          <PrimaryButton onClick={() => setView('register')}>Go to registration</PrimaryButton>
        </SectionCard>
      </div>
    )
  }

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardName || cardNumber.replace(/\s/g, '').length < 12 || !expiry || cvv.length < 3) {
      showToast('Enter valid card details to complete payment', 'warning')
      return
    }
    setPaying(true)
    window.setTimeout(() => {
      const ref = `WW-${cardNumber.slice(-4)}-${Date.now().toString().slice(-5)}`
      completeRegistrationPayment(ref)
      setPaying(false)
    }, 900)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <SectionCard
        title="Complete payment"
        subtitle={`Activate ${unpaidCompany.companyName || unpaidCompany.name} after registration.`}
      >
        <form onSubmit={submitPayment} className="space-y-3">
          <div className="rounded-2xl border border-gold-yellow/40 bg-gold-yellow/15 px-4 py-3 text-sm">
            <p className="font-semibold text-deep-blue">
              Pay {formatPula(fee)} to activate your solar company account
            </p>
            <p className="mt-1 text-dark-text/70">
              Demo payment only — no real card is charged. Use any test card details.
            </p>
          </div>
          <Field label="Name on card" value={cardName} onChange={setCardName} required />
          <Field
            label="Card number"
            value={cardNumber}
            onChange={setCardNumber}
            placeholder="4242 4242 4242 4242"
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Expiry" value={expiry} onChange={setExpiry} placeholder="MM/YY" required />
            <Field label="CVV" value={cvv} onChange={setCvv} placeholder="123" required />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <PrimaryButton type="submit" variant="accent" disabled={paying}>
              <CreditCard className="size-4" />
              {paying ? 'Processing…' : `Pay ${formatPula(fee)}`}
            </PrimaryButton>
            <PrimaryButton type="button" variant="ghost" onClick={() => setView('login')}>
              Sign in later
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export function LoginPage() {
  const { login, setView } = useWattWise()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="mx-auto max-w-lg animate-fade-up">
      <SectionCard title="Sign in" subtitle="Access your customer or solar company account.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            login(email, password)
          }}
        >
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <div className="flex flex-wrap gap-3 pt-2">
            <PrimaryButton type="submit" variant="primary">
              <Lock className="size-4" /> Sign in
            </PrimaryButton>
            <PrimaryButton type="button" variant="ghost" onClick={() => setView('register')}>
              Create account
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-dark-text">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-cyan-blue"
      />
    </label>
  )
}
