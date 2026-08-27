import type { TildeSeries } from '../api/geonet'
import './Sparkline.css'

export function Sparkline({
  series,
  height = 120,
  label,
}: {
  series: TildeSeries | null
  height?: number
  label?: string
}) {
  if (!series?.data?.length) {
    return <div className="sparkline empty">Geomagnetic data unavailable</div>
  }

  const values = series.data.map((d) => d.val)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 1)
  const w = 320
  const h = height
  const pad = 8
  const points = values
    .map((v, i) => {
      const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2)
      const y = pad + (1 - (v - min) / span) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  const latest = values[values.length - 1]

  return (
    <div className="sparkline">
      <div className="sparkline-head">
        <div>
          <strong>{label ?? `${series.series.station} total field`}</strong>
          <p className="muted">
            Tilde · {series.series.aspect} · {series.valueUnit ?? 'nT'}
          </p>
        </div>
        <div className="sparkline-value">
          {latest.toFixed(1)}
          <span>{series.valueUnit ?? 'nT'}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Geomagnetic field sparkline">
        <polyline fill="none" stroke="#e83b00" strokeWidth="2.5" points={points} />
      </svg>
    </div>
  )
}
