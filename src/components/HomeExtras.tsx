import { Link } from 'react-router-dom'
import { sumMagAtLeast, type NewsItem, type QuakeStats } from '../api/geonet'
import { brandIcon } from '../brand'
import './HomeExtras.css'

const copy = {
  en: {
    title: 'Our dynamic land, in focus',
    blurb:
      'Hundreds of sensors listen to Aotearoa every second — shakes, volcanoes, magnets and the sea. This kiosk shows the same live GeoNet data scientists use.',
    felt: 'Help our scientists by reporting what you felt.',
    report: 'Felt It?',
  },
  mi: {
    title: 'Tō tātou whenua hihiri, kei te arotahi',
    blurb:
      'E rongo ana ngā pūoko i Aotearoa i ia hekona — rū whenua, puia, autō me te moana. Ko ngā raraunga ora o GeoNet tēnei.',
    felt: 'Āwhina i ā mātou kaipūtaiao mā te pūrongo i tāu i rongo ai.',
    report: 'I rongo koe?',
  },
} as const

export function Hero({
  teReo,
  stats,
  sensorCount,
  unrestCount,
  news,
}: {
  teReo: boolean
  stats: QuakeStats | null
  sensorCount: number
  unrestCount: number
  news?: NewsItem
}) {
  const t = teReo ? copy.mi : copy.en
  const quakes = stats ? sumMagAtLeast(stats.days7, -1) : '—'
  return (
    <div className="hero">
      <div className="hero-copy">
        <h1>{t.title}</h1>
        <p>{t.blurb}</p>
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
        {news && <p className="hero-news muted">{news.title.trim()}</p>}
      </div>
    </div>
  )
}

export function FeltItBanner({ teReo, onReport }: { teReo: boolean; onReport: () => void }) {
  const t = teReo ? copy.mi : copy.en
  return (
    <div className="felt-banner card">
      <div className="felt-icon" aria-hidden="true">
        <img src={brandIcon('earthquake.svg')} alt="" />
      </div>
      <p>{t.felt}</p>
      <button type="button" className="touch-btn primary" onClick={onReport}>
        {t.report} <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

const categories = [
  {
    to: '/earthquakes',
    icon: brandIcon('earthquake.svg'),
    title: 'Earthquakes',
    titleMi: 'Rū whenua',
    desc: 'Recent shakes and where they were felt.',
  },
  {
    to: '/volcanoes',
    icon: brandIcon('volcano.svg'),
    title: 'Volcanoes',
    titleMi: 'Ngā puia',
    desc: 'Alert levels and unrest around Aotearoa.',
  },
  {
    to: '/tsunami',
    icon: brandIcon('tsunami.svg'),
    title: 'Tsunami',
    titleMi: 'Tsunami',
    desc: 'How GeoNet watches the ocean.',
  },
  {
    to: '/sensors',
    icon: brandIcon('layers.svg'),
    title: 'Sensor network',
    titleMi: 'Te whatunga pūoko',
    desc: 'Seismic, geomagnetic and cameras.',
  },
  {
    to: '/about',
    icon: brandIcon('info.svg'),
    title: 'How GeoNet works',
    titleMi: 'Pēhea te mahi a GeoNet',
    desc: 'Science for kids and curious explorers.',
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
