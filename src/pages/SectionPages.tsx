import { useMemo, useState } from 'react'
import {
  kindLabel,
  primaryKind,
  type StationKind,
  type StationPoint,
} from '../api/geonet'
import { brandIcon } from '../brand'
import { PeriodPicker, type ChartPeriod } from '../components/PeriodPicker'
import { QuakeMap } from '../components/QuakeMap'
import { PageHero, ThemeFrame } from '../components/science/ThemeKit'
import { StationSheet } from '../components/StationSheet'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function MapPage({ data }: { data: GeoNetBundle }) {
  return (
    <ThemeFrame
      head={
        <PageHero
          title="Live hazard map"
          blurb="Filled circles are recent earthquakes — bigger and darker means a larger magnitude. Hollow rings are currently operating GeoNet sensors."
          icon={brandIcon('layers.svg')}
        />
      }
      main={
        <div className="map-page-frame card">
          <QuakeMap quakes={data.quakes} stations={data.stations} showFullLink={false} />
        </div>
      }
    />
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
          blurb="Currently operating stations from GeoNet’s sensor search — seismometers, GNSS pins, magnets, DART and coastal gauges. Touch a glowing dot or a name, then stretch the live charts."
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
          <p className="muted station-count">{listed.length} currently operating · tap a row</p>
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
