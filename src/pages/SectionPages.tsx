import { useMemo, useState } from 'react'
import {
  SENSOR_TYPE_NAMES,
  stationSensorTypes,
  type SensorTypeName,
  type StationPoint,
} from '../api/geonet'
import { brandIcon } from '../brand'
import { type ChartPeriod } from '../components/PeriodPicker'
import { QuakeMap } from '../components/QuakeMap'
import { PageHero, ThemeFrame } from '../components/science/ThemeKit'
import { SENSOR_TYPE_BLURB, SensorTypeIcon } from '../components/SensorTypeIcon'
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

export function SensorsPage({ data }: { data: GeoNetBundle }) {
  const [selected, setSelected] = useState<StationPoint | null>(null)
  const [filter, setFilter] = useState<SensorTypeName | null>(null)
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

  const listed = useMemo(() => {
    if (!filter) return []
    return data.stations
      .filter((s) => stationSensorTypes(s).includes(filter))
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
  }, [data.stations, filter])

  function pickType(type: SensorTypeName) {
    setSelected(null)
    setFilter((cur) => (cur === type ? null : type))
  }

  return (
    <div className="page section-page sensor-page">
      <div className="sensor-hero">
        <PageHero
          title="Sensor network"
          blurb="Choose a data type. The map then shows those instruments — same symbols as GeoNet’s sensor search."
          icon={brandIcon('sensor.svg')}
        />
      </div>

      <div className="sensor-explore">
        <section className={`card station-browser${filter ? '' : ' picking'}`}>
          <p className="sensor-type-heading">{filter ? 'Change type' : 'Choose a data type'}</p>
          <div className="sensor-type-list" role="listbox" aria-label="Sensor type">
            {typeRows.map((type) => (
              <button
                key={type}
                type="button"
                role="option"
                aria-selected={filter === type}
                className={`sensor-type-row${filter === type ? ' active' : ''}`}
                onClick={() => pickType(type)}
              >
                <SensorTypeIcon type={type} size={26} />
                <span className="sensor-type-copy">
                  <span className="sensor-type-name">{type}</span>
                  {!filter && <span className="sensor-type-blurb">{SENSOR_TYPE_BLURB[type]}</span>}
                </span>
                <span className="sensor-type-count">{typeCounts.get(type) ?? 0}</span>
              </button>
            ))}
          </div>
          {filter && (
            <>
              <p className="muted station-count">
                {listed.length} currently operating · tap a station
              </p>
              <ul className="station-list">
                {listed.map((s) => (
                  <li key={s.code}>
                    <button type="button" className="station-row" onClick={() => setSelected(s)}>
                      <span className="station-row-icons">
                        <SensorTypeIcon type={filter} size={18} title={filter} />
                      </span>
                      <span className="station-row-code">{s.code}</span>
                      <span className="station-row-name">{s.name}</span>
                      <span className="station-row-kind">{filter}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="map-page-frame card sensor-map">
          <QuakeMap
            quakes={[]}
            stations={filter ? data.stations : []}
            showStations
            showAllStations
            showFullLink={false}
            legend={filter ? 'types' : 'none'}
            onSelectStation={setSelected}
            selectedCode={selected?.code}
            focusStation={selected}
            stationFilter={filter ? (s) => stationSensorTypes(s).includes(filter) : undefined}
            sensorTypeFilter={filter ?? 'all'}
          />
          {!filter && (
            <div className="sensor-map-prompt">
              <p>Touch a data type on the left to place those sensors on the map.</p>
            </div>
          )}
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
