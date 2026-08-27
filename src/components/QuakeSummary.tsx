import { Link } from 'react-router-dom'
import {
  formatMag,
  formatRelativeTime,
  sumMagAtLeast,
  type QuakeFeature,
  type QuakeStats,
} from '../api/geonet'
import { brandIcon } from '../brand'

export function QuakeSummary({
  stats,
  feltReports,
  latest,
}: {
  stats: QuakeStats | null
  feltReports: number
  latest?: QuakeFeature
}) {
  const total = stats ? sumMagAtLeast(stats.days7, -1) : '—'
  const m5 = stats ? sumMagAtLeast(stats.days7, 5) : '—'

  return (
    <section className="card side-card">
      <h3 className="section-title">
        <img src={brandIcon('earthquake.svg')} alt="" />
        Earthquake summary
      </h3>
      <p className="muted side-meta">Last 7 days · GeoNet catalogue stats</p>
      <div className="stat-row">
        <div className="stat">
          <strong>{total}</strong>
          <span>Earthquakes</span>
        </div>
        <div className="stat">
          <strong>{m5}</strong>
          <span>M5.0+</span>
        </div>
        <div className="stat">
          <strong>{feltReports}</strong>
          <span>Felt reports</span>
        </div>
      </div>
      {latest && (
        <p className="latest-quake">
          Latest: <strong>{formatMag(latest.properties.magnitude)}</strong> {latest.properties.locality} ·{' '}
          {formatRelativeTime(latest.properties.time)} · {latest.properties.depth.toFixed(0)} km deep
        </p>
      )}
      <Link to="/earthquakes" className="link-arrow">
        View all earthquakes <img src={brandIcon('right-arrow.svg')} alt="" />
      </Link>
    </section>
  )
}
