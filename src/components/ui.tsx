import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  hint?: string
  accent?: 'blue' | 'cyan' | 'orange' | 'gold'
}

const ACCENTS = {
  blue: 'border-l-deep-blue',
  cyan: 'border-l-bright-cyan',
  orange: 'border-l-orange',
  gold: 'border-l-gold-yellow',
}

export function MetricCard({ label, value, hint, accent = 'blue' }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border border-border border-l-4 bg-white p-4 shadow-sm ${ACCENTS[accent]}`}>
      <p className="text-xs font-semibold tracking-wide text-dark-text/55 uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-deep-blue">{value}</p>
      {hint && <p className="mt-1 text-xs text-dark-text/60">{hint}</p>}
    </div>
  )
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
  id,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="rounded-2xl border border-border bg-white p-5 shadow-sm animate-fade-up">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-deep-blue">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-dark-text/65">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  disabled?: boolean
  className?: string
}) {
  const styles = {
    primary: 'bg-deep-blue text-white hover:bg-primary-blue',
    secondary: 'bg-bright-cyan text-white hover:bg-cyan-blue',
    accent: 'bg-orange text-white hover:brightness-95',
    ghost: 'border border-border bg-white text-dark-text hover:bg-light-bg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
