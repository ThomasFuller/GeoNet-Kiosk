import { formatRelativeTime } from '../api/geonet'
import './AnnotatedChart.css'

export type ChartPoint = { t: number; v: number }

export function AnnotatedChart({
  title,
  points,
  unit,
  yCaption,
  xCaption,
  annotation,
  updatedMs,
  loading,
  empty,
  color = '#e83b00',
  accent = 'puia',
}: {
  title: string
  points: ChartPoint[]
  unit: string
  yCaption: string
  xCaption: string
  annotation: string
  updatedMs?: number
  loading?: boolean
  empty?: string
  color?: string
  accent?: 'puia' | 'val' | 'wai' | 'whenua'
}) {
  if (loading) {
    return (
      <section className={`anno-chart card accent-${accent}`}>
        <header>
          <h3>{title}</h3>
          <span className="muted">Listening…</span>
        </header>
        <div className="anno-empty">Fetching a live wiggle from GeoNet…</div>
      </section>
    )
  }

  if (!points.length) {
    return (
      <section className={`anno-chart card accent-${accent}`}>
        <header>
          <h3>{title}</h3>
        </header>
        <div className="anno-empty">{empty ?? 'Nothing to plot right now — try another sensor.'}</div>
      </section>
    )
  }

  const w = 720
  const h = 220
  const padL = 58
  const padR = 16
  const padT = 18
  const padB = 36
  const values = points.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, Math.abs(max) * 0.02, 1e-9)
  const t0 = points[0].t
  const t1 = points[points.length - 1].t
  const tSpan = Math.max(t1 - t0, 1)

  const xy = (p: ChartPoint) => {
    const x = padL + ((p.t - t0) / tSpan) * (w - padL - padR)
    const y = padT + (1 - (p.v - min) / span) * (h - padT - padB)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xy(p)}`).join(' ')
  const yTicks = [max, (max + min) / 2, min]
  const fmt = (n: number) => {
    const a = Math.abs(n)
    if (a >= 100) return n.toFixed(0)
    if (a >= 10) return n.toFixed(1)
    if (a >= 1) return n.toFixed(2)
    return n.toFixed(3)
  }

  const spanSec = tSpan / 1000
  const xLeft = spanSec >= 90 ? `${Math.round(spanSec / 60)} min ago` : `${Math.round(spanSec)} s ago`

  return (
    <section className={`anno-chart card accent-${accent}`}>
      <header>
        <div>
          <h3>{title}</h3>
          <p className="muted">{yCaption}</p>
        </div>
        <div className="anno-meta">
          <span className="live-dot" />
          <span>{updatedMs ? `Updated ${formatRelativeTime(new Date(updatedMs).toISOString())}` : 'Live'}</span>
        </div>
      </header>
      <p className="anno-bubble">{annotation}</p>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title}>
        {yTicks.map((tick, i) => {
          const y = padT + (i / 2) * (h - padT - padB)
          return (
            <g key={i}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} className="grid" />
              <text x={padL - 8} y={y + 4} className="tick" textAnchor="end">
                {fmt(tick)}
              </text>
            </g>
          )
        })}
        <text x={12} y={h / 2} className="axis-unit" transform={`rotate(-90 12 ${h / 2})`}>
          {unit}
        </text>
        <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <text x={padL} y={h - 8} className="tick">
          {xLeft}
        </text>
        <text x={w - padR} y={h - 8} className="tick" textAnchor="end">
          now
        </text>
      </svg>
      <p className="anno-x muted">{xCaption}</p>
    </section>
  )
}
