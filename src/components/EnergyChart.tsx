interface EnergyChartProps {
  data: { name: string; kwh: number }[]
}

export function EnergyChart({ data }: EnergyChartProps) {
  const top = data.slice(0, 6)
  const max = Math.max(...top.map((item) => item.kwh), 0.01)

  if (top.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-light-bg text-sm text-dark-text/55">
        Add appliances to see consumption share
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {top.map((item, index) => {
        const width = Math.max(6, (item.kwh / max) * 100)
        const color = index % 3 === 0 ? 'bg-deep-blue' : index % 3 === 1 ? 'bg-bright-cyan' : 'bg-gold-yellow'
        return (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-dark-text">{item.name}</span>
              <span className="shrink-0 font-semibold text-deep-blue">{item.kwh.toFixed(2)} kWh</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-light-bg">
              <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface DonutChartProps {
  items: { label: string; value: number }[]
}

const DONUT_COLORS = ['#155A91', '#28B7E8', '#FF6B18', '#F9B719', '#2167A8', '#159BD3', '#18324A', '#7EB6D9', '#DCE8F1']

export function DonutChart({ items }: DonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border bg-light-bg text-sm text-dark-text/55">
        Complete sizing to view cost mix
      </div>
    )
  }

  let cumulative = 0
  const segments = items.map((item, index) => {
    const start = cumulative / total
    cumulative += item.value
    const end = cumulative / total
    return { ...item, start, end, color: DONUT_COLORS[index % DONUT_COLORS.length] }
  })

  const toCoord = (fraction: number) => {
    const angle = fraction * Math.PI * 2 - Math.PI / 2
    return { x: 50 + 36 * Math.cos(angle), y: 50 + 36 * Math.sin(angle) }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
      <svg viewBox="0 0 100 100" className="mx-auto size-40">
        {segments.map((segment) => {
          const largeArc = segment.end - segment.start > 0.5 ? 1 : 0
          const start = toCoord(segment.start)
          const end = toCoord(segment.end)
          const d = `M 50 50 L ${start.x} ${start.y} A 36 36 0 ${largeArc} 1 ${end.x} ${end.y} Z`
          return <path key={segment.label} d={d} fill={segment.color} />
        })}
        <circle cx="50" cy="50" r="20" fill="#FFFFFF" />
      </svg>
      <ul className="space-y-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-dark-text">
              <span className="size-2.5 rounded-full" style={{ background: segment.color }} />
              {segment.label}
            </span>
            <span className="font-semibold text-deep-blue">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
