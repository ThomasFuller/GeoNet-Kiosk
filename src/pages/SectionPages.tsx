import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  cameraImageUrl,
  formatMag,
  formatRelativeTime,
  kindLabel,
  primaryKind,
  sumMagAtLeast,
  volcanoDisplayName,
  type CameraFeature,
  type QuakeFeature,
  type StationKind,
  type StationPoint,
} from '../api/geonet'
import { brandIcon } from '../brand'
import { PeriodPicker, type ChartPeriod } from '../components/PeriodPicker'
import { QuakeMap } from '../components/QuakeMap'
import { StationSheet } from '../components/StationSheet'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

function PageHero({ title, blurb, icon }: { title: string; blurb: string; icon: string }) {
  return (
    <div className="page-hero">
      <Link to="/" className="link-arrow back">
        ← Home
      </Link>
      <h1>
        <img src={icon} alt="" />
        {title}
      </h1>
      <p className="muted">{blurb}</p>
    </div>
  )
}

export function MapPage({ data }: { data: GeoNetBundle }) {
  return (
    <div className="page section-page">
      <PageHero
        title="Live hazard map"
        blurb="Touch a circle to learn about a recent earthquake. Hollow rings are GeoNet sensors listening across Aotearoa."
        icon={brandIcon('layers.svg')}
      />
      <div className="map-page-frame card">
        <QuakeMap quakes={data.quakes} stations={data.stations} showFullLink={false} />
      </div>
    </div>
  )
}

export function EarthquakesPage({ data }: { data: GeoNetBundle }) {
  const list = [...data.quakes].sort(
    (a, b) => +new Date(b.properties.time) - +new Date(a.properties.time),
  )
  const total = data.stats ? sumMagAtLeast(data.stats.days7, -1) : list.length
  const m4 = data.stats ? sumMagAtLeast(data.stats.days7, 4) : list.filter((q) => q.properties.magnitude >= 4).length

  return (
    <div className="page section-page">
      <PageHero
        title="Earthquakes"
        blurb="The map shows the latest events in the GeoNet catalogue. Bigger, darker circles mean stronger magnitudes."
        icon={brandIcon('earthquake.svg')}
      />
      <div className="split-layout">
        <div className="map-page-frame card">
          <QuakeMap quakes={list} stations={data.stations} showStations={false} showFullLink={false} />
        </div>
        <div className="card list-panel">
          <div className="stat-row">
            <div className="stat">
              <strong>{total}</strong>
              <span>Last 7 days</span>
            </div>
            <div className="stat">
              <strong>{m4}</strong>
              <span>M4.0+</span>
            </div>
            <div className="stat">
              <strong>{data.feltReports}</strong>
              <span>Felt reports</span>
            </div>
          </div>
          <ul className="quake-list">
            {list.slice(0, 14).map((q) => (
              <QuakeRow key={q.properties.publicID} quake={q} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function QuakeRow({ quake }: { quake: QuakeFeature }) {
  return (
    <li>
      <span className="mag">{formatMag(quake.properties.magnitude)}</span>
      <div>
        <strong>{quake.properties.locality}</strong>
        <p className="muted">
          {formatRelativeTime(quake.properties.time)} · {quake.properties.depth.toFixed(0)} km deep
        </p>
      </div>
    </li>
  )
}

export function VolcanoesPage({ data }: { data: GeoNetBundle }) {
  const sorted = [...data.volcanoes].sort((a, b) => b.properties.level - a.properties.level)
  return (
    <div className="page section-page">
      <PageHero
        title="Volcanoes"
        blurb="Volcanic Alert Levels tell us how restless a volcano is — from quiet (0) to eruption hazards (5). Colours match the GeoNet scale."
        icon={brandIcon('volcano.svg')}
      />
      <div className="tile-board">
        {sorted.map((v) => (
          <article key={v.properties.volcanoID} className="card volcano-tile">
            <span className={`val-badge val-${v.properties.level}`}>{v.properties.level}</span>
            <div>
              <h3>{volcanoDisplayName(v.properties.volcanoTitle)}</h3>
              <p className="muted">{v.properties.activity}</p>
              <p className="acc">Aviation colour: {v.properties.acc || '—'}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function CamerasPage({ data }: { data: GeoNetBundle }) {
  return (
    <div className="page section-page">
      <PageHero
        title="Volcano cameras"
        blurb="These cameras refresh about every 10 minutes so scientists (and you!) can watch steam, snow and crater lakes."
        icon={brandIcon('volcano.svg')}
      />
      <div className="camera-grid">
        {data.cameras.slice(0, 12).map((cam, i) => (
          <CameraCard key={`${cam.id}-${cam.properties.title}-${i}`} cam={cam} bust={data.updatedAt} />
        ))}
      </div>
    </div>
  )
}

function CameraCard({ cam, bust }: { cam: CameraFeature; bust: number }) {
  return (
    <article className="card camera-tile">
      <img
        src={cameraImageUrl(cam.properties['latest-image-medium'] || cam.properties['latest-image-thumb'], bust)}
        alt={cam.properties.title}
      />
      <div>
        <strong>{cam.properties.title}</strong>
        <p className="muted">{cam.properties['latest-timestamp']}</p>
      </div>
    </article>
  )
}

const SENSOR_FILTERS: Array<{ id: 'all' | 'seismic' | 'gnss' | 'geomag' | 'ocean'; label: string }> = [
  { id: 'all', label: 'All sensors' },
  { id: 'seismic', label: 'Ground shakers' },
  { id: 'gnss', label: 'GPS pins' },
  { id: 'geomag', label: 'Earth magnets' },
  { id: 'ocean', label: 'Ocean' },
]

const FEATURED_CODES = ['WEL', 'EYWM', 'AUCK', 'NZE', 'GIST', 'WGTN']

function stationMatchesFilter(station: StationPoint, filter: (typeof SENSOR_FILTERS)[number]['id']): boolean {
  if (filter === 'all') return true
  if (filter === 'ocean') return station.kinds.includes('dart') || station.kinds.includes('coastal')
  return station.kinds.includes(filter)
}

export function SensorsPage({ data }: { data: GeoNetBundle }) {
  const [selected, setSelected] = useState<StationPoint | null>(null)
  const [filter, setFilter] = useState<(typeof SENSOR_FILTERS)[number]['id']>('all')
  const [letter, setLetter] = useState<string | null>(null)
  const [period, setPeriod] = useState<ChartPeriod>('1d')

  const filtered = useMemo(
    () =>
      data.stations
        .filter((s) => stationMatchesFilter(s, filter))
        .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code)),
    [data.stations, filter],
  )

  const letters = useMemo(() => {
    const set = new Set(filtered.map((s) => s.code[0]?.toUpperCase()).filter(Boolean))
    return [...set].sort()
  }, [filtered])

  const listed = useMemo(
    () => (letter ? filtered.filter((s) => s.code[0]?.toUpperCase() === letter) : filtered),
    [filtered, letter],
  )

  const featured = useMemo(
    () => FEATURED_CODES.map((code) => data.stations.find((s) => s.code === code)).filter(Boolean) as StationPoint[],
    [data.stations],
  )

  return (
    <div className="page section-page sensor-page">
      <div className="sensor-hero">
        <PageHero
          title="Sensor playground"
          blurb="These are the sensors GeoNet is running right now. Touch a glowing dot or a name, then pick 24 hours, 7 days or 30 days."
          icon={brandIcon('layers.svg')}
        />
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="sensor-explore">
        <section className="card station-browser">
          <div className="sensor-filters" role="tablist" aria-label="Sensor type">
            {SENSOR_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`filter-chip${filter === f.id ? ' active' : ''}`}
                onClick={() => {
                  setFilter(f.id)
                  setLetter(null)
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {featured.length > 0 && filter === 'all' && !letter && (
            <div className="featured-row">
              <span className="featured-label">Try these</span>
              {featured.map((s) => (
                <button key={s.code} type="button" className="featured-chip" onClick={() => setSelected(s)}>
                  {s.code}
                </button>
              ))}
            </div>
          )}
          <div className="letter-bar" aria-label="Jump to letter">
            {letters.map((L) => (
              <button
                key={L}
                type="button"
                className={`letter-chip${letter === L ? ' active' : ''}`}
                onClick={() => setLetter((cur) => (cur === L ? null : L))}
              >
                {L}
              </button>
            ))}
          </div>
          <p className="muted station-count">
            {listed.length} currently operating · tap a row
          </p>
          <ul className="station-list">
            {listed.map((s) => (
              <li key={s.code}>
                <button type="button" className="station-row" onClick={() => setSelected(s)}>
                  <span className={`kind-dot kind-${primaryKind(s)}`} />
                  <span className="station-row-code">{s.code}</span>
                  <span className="station-row-name">{s.name}</span>
                  <span className="station-row-kind">{s.kinds.map((k) => kindLabel(k as StationKind)).join(' · ')}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="map-page-frame card sensor-map">
          <QuakeMap
            quakes={[]}
            stations={data.stations}
            showStations
            showAllStations
            showFullLink={false}
            legend="stations"
            onSelectStation={setSelected}
            selectedCode={selected?.code}
            focusStation={selected}
            stationFilter={(s) => stationMatchesFilter(s, filter)}
          />
        </div>
      </div>

      {selected && (
        <StationSheet
          station={selected}
          catalog={data.tildeByStation}
          cameras={data.cameras}
          quakes={data.quakes}
          period={period}
          onPeriodChange={setPeriod}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export function TsunamiPage() {
  return (
    <div className="page section-page">
      <PageHero
        title="Tsunami watch"
        blurb="If a big undersea earthquake happens, GeoNet and emergency partners check gauges and DART buoys for unusual sea-level changes."
        icon={brandIcon('tsunami.svg')}
      />
      <div className="card kids-panel">
        <h3>Kid-friendly facts</h3>
        <ul>
          <li>Tsunami waves can travel as fast as a jet plane in deep water.</li>
          <li>If the ground shakes strongly near the coast — move to higher ground.</li>
          <li>Official warnings come from Civil Defence / NEMA, not this kiosk.</li>
        </ul>
        <p className="muted">
          GeoNet’s DART and coastal-gauge time series live on Tilde. This screen is for learning —
          never wait on a kiosk if you feel long or strong shaking at the coast.
        </p>
      </div>
    </div>
  )
}

export function AlertsPage({ data }: { data: GeoNetBundle }) {
  const active = data.volcanoes.filter((v) => v.properties.level > 0)
  const big = data.quakes.filter((q) => q.properties.magnitude >= 4)

  return (
    <div className="page section-page">
      <PageHero
        title="Alerts & unrest"
        blurb="Volcanoes above alert level 0, plus the larger recent earthquakes in the live catalogue."
        icon={brandIcon('alert.svg')}
      />
      <div className="split-layout">
        <section className="card list-panel">
          <h3>Volcanoes with unrest</h3>
          {active.length === 0 ? (
            <p className="muted">All monitored volcanoes are at alert level 0 right now.</p>
          ) : (
            <ul className="quake-list">
              {active.map((v) => (
                <li key={v.properties.volcanoID}>
                  <span className={`val-badge val-${v.properties.level}`}>{v.properties.level}</span>
                  <div>
                    <strong>{volcanoDisplayName(v.properties.volcanoTitle)}</strong>
                    <p className="muted">{v.properties.activity}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card list-panel">
          <h3>Larger quakes (M4+)</h3>
          <ul className="quake-list">
            {big.slice(0, 10).map((q) => (
              <QuakeRow key={q.properties.publicID} quake={q} />
            ))}
            {big.length === 0 && <p className="muted">No M4+ events in the current catalogue window.</p>}
          </ul>
        </section>
      </div>
    </div>
  )
}

export function AboutPage({ teReo }: { teReo: boolean }) {
  return (
    <div className="page section-page">
      <PageHero
        title={teReo ? 'Mō GeoNet' : 'How GeoNet works'}
        blurb="GeoNet is Aotearoa New Zealand’s geological hazard monitoring system — built for science, safety and curiosity."
        icon={brandIcon('info.svg')}
      />
      <div className="about-grid">
        <article className="card kids-panel">
          <h3>1. Listen</h3>
          <p>Sensors feel shakes, smell gases, see cameras and measure Earth’s magnetic field.</p>
        </article>
        <article className="card kids-panel">
          <h3>2. Understand</h3>
          <p>Scientists turn signals into magnitudes, alert levels and maps you can explore.</p>
        </article>
        <article className="card kids-panel">
          <h3>3. Share</h3>
          <p>Data is open. Apps, schools, researchers and this kiosk all drink from the same well.</p>
        </article>
      </div>
      <p className="muted about-note">
        Brand, type and icons follow beta.geonet.org.nz. Not an official emergency alerting product —
        always follow Civil Defence advice.
      </p>
    </div>
  )
}
