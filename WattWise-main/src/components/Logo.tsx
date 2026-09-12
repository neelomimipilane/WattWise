interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
}

export function Logo({ className = '', showText = true, size = 40 }: LogoProps) {
  if (showText) {
    return (
      <img
        src="/watt-wise-logo.png"
        alt="Watt-Wise — Know Your Power"
        className={`object-contain bg-transparent ${className}`}
        style={{ height: Math.round(size * 2.4), width: 'auto' }}
      />
    )
  }

  return (
    <img
      src="/watt-wise-logo.png"
      alt="Watt-Wise"
      width={size}
      height={size}
      className={`shrink-0 object-cover object-top ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
