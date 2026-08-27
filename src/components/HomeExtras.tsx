import { Link } from 'react-router-dom'
import { sumMagAtLeast, type QuakeStats } from '../api/geonet'
import { brandIcon } from '../brand'
import './HomeExtras.css'

const copy = {
  en: {
    title: 'Our dynamic land, in focus',
    blurb:
      'Hundreds of sensors listen to Aotearoa every second — shakes, volcanoes, magnets and the sea. This kiosk shows the same live GeoNet data scientists use.',
  },
  mi: {
    title: 'Tō tātou whenua hihiri, kei te arotahi',
    blurb:
      'E rongo ana ngā pūoko i Aotearoa i ia hekona — rū whenua, puia, autō me te moana. Ko ngā raraunga ora o GeoNet tēnei.',
  },
} as const

export function Hero({
  teReo,
  stats,
  sensorCount,
  unrestCount,
}: {
  teReo: boolean
  stats: QuakeStats | null
  sensorCount: number
  unrestCount: number
}) {
  const t = teReo ? copy.mi : copy.en
  const quakes = stats ? sumMagAtLeast(stats.days7, -1) : '—'
  return (
    <div className="hero">
      <div className="hero-copy">
        <div className="hero-text card">
          <h1>{t.title}</h1>
          <p>{t.blurb}</p>
        </div>
        <div className="hero-facts">
          <span>
            <strong>{quakes}</strong> quakes · 7 days
          </span>
          <span>
            <strong>{sensorCount || '—'}</strong> sensors listening
          </span>
          <span>
            <strong>{unrestCount}</strong> {unrestCount === 1 ? 'volcano' : 'volcanoes'} unrest
          </span>
        </div>
      </div>
    </div>
  )
}

const categories = [
  {
    to: '/earthquakes',
    icon: brandIcon('earthquake.svg'),
    title: 'Earthquakes',
    titleMi: 'Rū whenua',
    desc: 'Live catalogue, magnitude and intensity.',
  },
  {
    to: '/volcanoes',
    icon: brandIcon('volcano.svg'),
    title: 'Volcanoes',
    titleMi: 'Ngā puia',
    desc: 'Alert levels, gas, cameras and tremor.',
  },
  {
    to: '/tsunami',
    icon: brandIcon('tsunami.svg'),
    title: 'Tsunami',
    titleMi: 'Tsunami',
    desc: 'DART buoys and coastal sea gauges.',
  },
  {
    to: '/landslide',
    icon: brandIcon('landslide.svg'),
    title: 'Landslides',
    titleMi: 'Horo whenua',
    desc: 'How slopes are watched after a trigger.',
  },
  {
    to: '/sensors',
    icon: brandIcon('layers.svg'),
    title: 'Sensor network',
    titleMi: 'Te whatunga pūoko',
    desc: 'Every station operating today.',
  },
] as const

export function CategoryGrid({ teReo }: { teReo: boolean }) {
  return (
    <div className="category-grid">
      {categories.map((c) => (
        <Link key={c.to} to={c.to} className="category-tile card">
          <img src={c.icon} alt="" />
          <h3>{teReo ? c.titleMi : c.title}</h3>
          <p className="muted">{c.desc}</p>
          <span className="tile-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ))}
    </div>
  )
}

export function StatusBar({
  updatedAt,
  loading,
  clock,
}: {
  updatedAt: number
  loading: boolean
  clock: string
}) {
  const label = !updatedAt
    ? 'Connecting to GeoNet…'
    : loading
      ? 'Refreshing live feeds…'
      : `Data updated ${new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  return (
    <footer className="status-bar">
      <div className="status-left">
        <img src={brandIcon('earthquake.svg')} alt="" />
        <span>Monitoring 24/7 to keep Aotearoa informed and safe.</span>
      </div>
      <div className="status-right">
        <span className="kiosk-clock">{clock}</span>
        <span>{label}</span>
        <span className="live-dot" aria-hidden="true" />
        <strong>system live</strong>
      </div>
    </footer>
  )
}
