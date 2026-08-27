import { useMemo, useState } from 'react'
import {
  SENSOR_TYPE_NAMES,
  stationSensorTypes,
  type SensorTypeName,
  type StationPoint,
} from '../api/geonet'
import { brandIcon } from '../brand'
import { PeriodPicker, type ChartPeriod } from '../components/PeriodPicker'
import { QuakeMap } from '../components/QuakeMap'
import { PageHero, ThemeFrame } from '../components/science/ThemeKit'
import { SensorTypeIcon } from '../components/SensorTypeIcon'
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

type SensorFilter = 'all' | SensorTypeName

function stationMatchesFilter(station: StationPoint, filter: SensorFilter): boolean {
  if (filter === 'all') return true
  return stationSensorTypes(station).includes(filter)
}

export function SensorsPage({ data }: { data: GeoNetBundle }) {
  const [selected, setSelected] = useState<StationPoint | null>(null)
  const [filter, setFilter] = useState<SensorFilter>('all')
  const [period, setPeriod] = useState<ChartPeriod>('1d')

  const typeCounts = useMemo(() => {
    const counts = new Map<SensorTypeName, number>()
    for (const station of data.stations) {
      for (const type of stationSensorTypes(station)) {
        counts.set(type, (counts.get(type) ?? 0) + 1)
      }
    }
    return counts
  }, [data.stations])

  const typeRows = useMemo(
    () => SENSOR_TYPE_NAMES.filter((type) => (typeCounts.get(type) ?? 0) > 0),
    [typeCounts],
  )

  const filtered = useMemo(
    () =>
      data.stations
        .filter((s) => stationMatchesFilter(s, filter))
        .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code)),
    [data.stations, filter],
  )

  return (
    <div className="page section-page sensor-page">
      <div className="sensor-hero">
        <PageHero
          title="Sensor network"
          blurb="Same type symbols as GeoNet’s sensor search. Touch a type to show only those instruments, then touch a symbol or a station name."
          icon={brandIcon('layers.svg')}
        />
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>

      <div className="sensor-explore">
        <section className="card station-browser">
          <div className="sensor-type-list" role="tablist" aria-label="Sensor type">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`sensor-type-row${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="sensor-type-all" aria-hidden />
              <span className="sensor-type-name">All sensor types</span>
              <span className="sensor-type-count">{data.stations.length}</span>
            </button>
            {typeRows.map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={filter === type}
                className={`sensor-type-row${filter === type ? ' active' : ''}`}
                onClick={() => setFilter(type)}
              >
                <SensorTypeIcon type={type} size={22} />
                <span className="sensor-type-name">{type}</span>
                <span className="sensor-type-count">{typeCounts.get(type) ?? 0}</span>
              </button>
            ))}
          </div>
          <p className="muted station-count">{filtered.length} currently operating · tap a row</p>
          <ul className="station-list">
            {filtered.map((s) => {
              const types = stationSensorTypes(s)
              return (
                <li key={s.code}>
                  <button type="button" className="station-row" onClick={() => setSelected(s)}>
                    <span className="station-row-icons">
                      {types.map((type) => (
                        <SensorTypeIcon key={type} type={type} size={18} title={type} />
                      ))}
                    </span>
                    <span className="station-row-code">{s.code}</span>
                    <span className="station-row-name">{s.name}</span>
                    <span className="station-row-kind">{types.join(' · ')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="map-page-frame card sensor-map">
          <QuakeMap
            quakes={[]}
            stations={data.stations}
            showStations
            showAllStations
            showFullLink={false}
            legend="types"
            onSelectStation={setSelected}
            selectedCode={selected?.code}
            focusStation={selected}
            stationFilter={(s) => stationMatchesFilter(s, filter)}
            sensorTypeFilter={filter}
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
