import { Link } from 'react-router-dom'
import { sumMagAtLeast, type QuakeStats } from '../api/geonet'

export function QuakeSummary({
  stats,
  feltReports,
}: {
  stats: QuakeStats | null
  feltReports: number
}) {
  const total = stats ? sumMagAtLeast(stats.days7, -1) : '—'
  const m5 = stats ? sumMagAtLeast(stats.days7, 5) : '—'

  return (
    <section className="card side-card">
      <h3 className="section-title">
        <img src="/brand/icons/earthquake.svg" alt="" />
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
      <Link to="/earthquakes" className="link-arrow">
        View all earthquakes <img src="/brand/icons/right-arrow.svg" alt="" />
      </Link>
    </section>
  )
}
