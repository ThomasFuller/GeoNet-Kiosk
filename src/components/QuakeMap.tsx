import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import {
  formatMag,
  formatRelativeTime,
  magnitudeColor,
  magnitudeRadius,
  mapLongitude,
  primaryKind,
  primarySensorType,
  SENSOR_TYPE_NAMES,
  type QuakeFeature,
  type SensorTypeName,
  type StationPoint,
} from '../api/geonet'
import { brandIcon } from '../brand'
import { sensorTypeSvg, SensorTypeIcon } from './SensorTypeIcon'
import './QuakeMap.css'

const NZ_CENTER: [number, number] = [-41.15, 173.6]
const NZ_BOUNDS: L.LatLngBoundsExpression = [
  [-48.2, 165.2],
  [-28.8, 185.2],
]

function FitNZ() {
  const map = useMap()
  useEffect(() => {
    let fitted = false
    const apply = () => {
      map.invalidateSize()
      const size = map.getSize()
      if (size.x > 120 && size.y > 120) {
        map.fitBounds(NZ_BOUNDS, { padding: [24, 24], maxZoom: 6 })
        fitted = true
      }
    }
    apply()
    const ro = new ResizeObserver(() => {
      if (!fitted) apply()
      else map.invalidateSize()
    })
    ro.observe(map.getContainer())
    const id = window.setTimeout(apply, 180)
    return () => {
      ro.disconnect()
      window.clearTimeout(id)
    }
  }, [map])
  return null
}

function FocusStation({ station }: { station: StationPoint | null }) {
  const map = useMap()
  useEffect(() => {
    if (!station) return
    map.flyTo([station.lat, mapLongitude(station.lon)], 8, { duration: 0.55 })
  }, [map, station])
  return null
}

const stationIcon = L.divIcon({
  className: 'station-dot',
  html: '<span></span>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const sensorIconCache = new Map<string, L.DivIcon>()

function leafletSensorIcon(type: SensorTypeName, selected: boolean): L.DivIcon {
  const key = `${type}:${selected ? 1 : 0}`
  const cached = sensorIconCache.get(key)
  if (cached) return cached
  const glyph = selected ? 28 : 22
  const size = selected ? 36 : 32
  const icon = L.divIcon({
    className: `sensor-type-marker${selected ? ' is-selected' : ''}`,
    html: `<span class="sensor-type-hit">${sensorTypeSvg(type, glyph)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
  sensorIconCache.set(key, icon)
  return icon
}

const KIND_COLOR: Record<string, string> = {
  seismic: '#320719',
  geomag: '#832c82',
  gnss: '#b38c65',
  dart: '#1d4e89',
  coastal: '#1d4e89',
  envirosensor: '#954990',
  scandoas: '#954990',
}

type Props = {
  quakes: QuakeFeature[]
  stations?: StationPoint[]
  compact?: boolean
  showStations?: boolean
  showFullLink?: boolean
  showAllStations?: boolean
  onSelectStation?: (station: StationPoint) => void
  selectedCode?: string | null
  focusStation?: StationPoint | null
  stationFilter?: (station: StationPoint) => boolean
  legend?: 'quakes' | 'stations' | 'types' | 'none'
  sensorTypeFilter?: SensorTypeName | 'all'
}

export function QuakeMap({
  quakes,
  stations = [],
  compact,
  showStations = true,
  showFullLink = true,
  showAllStations = false,
  onSelectStation,
  selectedCode,
  focusStation = null,
  stationFilter,
  legend = 'quakes',
  sensorTypeFilter = 'all',
}: Props) {
  const visibleStations = useMemo(() => {
    if (!showStations) return []
    const filtered = stationFilter ? stations.filter(stationFilter) : stations
    if (showAllStations) return filtered
    return filtered.filter((_, i) => i % 5 === 0).slice(0, 180)
  }, [stations, showStations, showAllStations, stationFilter])

  const visibleTypes = useMemo(() => {
    const present = new Set(visibleStations.map((s) => primarySensorType(s, sensorTypeFilter)))
    return SENSOR_TYPE_NAMES.filter((type) => present.has(type))
  }, [visibleStations, sensorTypeFilter])

  const touchStations = Boolean(onSelectStation)

  return (
    <div className={`quake-map card${compact ? ' compact' : ''}${touchStations ? ' touch-stations' : ''}`}>
      <MapContainer
        center={NZ_CENTER}
        zoom={5}
        minZoom={5}
        maxZoom={12}
        maxBounds={[
          [-52, 158],
          [-25, 192],
        ]}
        maxBoundsViscosity={0.85}
        scrollWheelZoom
        touchZoom
        dragging
        className="quake-map-canvas"
        attributionControl={false}
        zoomControl
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        <FitNZ />
        <FocusStation station={focusStation} />

        {visibleStations.map((s) => {
          const kind = primaryKind(s)
          const color = KIND_COLOR[kind] ?? '#320719'
          const selected = s.code === selectedCode
          if (legend === 'types') {
            const type = primarySensorType(s, sensorTypeFilter)
            return (
              <Marker
                key={s.code}
                position={[s.lat, mapLongitude(s.lon)]}
                icon={leafletSensorIcon(type, selected)}
                zIndexOffset={selected ? 1000 : 0}
                eventHandlers={
                  onSelectStation
                    ? {
                        click: () => onSelectStation(s),
                      }
                    : undefined
                }
              >
                {!touchStations && (
                  <Popup>
                    <strong>{s.code}</strong>
                    <div>{s.name}</div>
                    <div>{type}</div>
                  </Popup>
                )}
              </Marker>
            )
          }
          if (touchStations) {
            return (
              <CircleMarker
                key={s.code}
                center={[s.lat, mapLongitude(s.lon)]}
                radius={selected ? 18 : 12}
                pathOptions={{
                  color: selected ? '#e83b00' : color,
                  weight: selected ? 4 : 2.4,
                  fillColor: selected ? '#ff7424' : '#fffdf8',
                  fillOpacity: selected ? 0.95 : 0.15,
                }}
                eventHandlers={{
                  click: () => onSelectStation?.(s),
                }}
              />
            )
          }
          return (
            <Marker key={s.code} position={[s.lat, mapLongitude(s.lon)]} icon={stationIcon}>
              <Popup>
                <strong>{s.code}</strong>
                <div>{s.name}</div>
              </Popup>
            </Marker>
          )
        })}

        {quakes.map((q) => {
          const [lon, lat] = q.geometry.coordinates
          const m = q.properties.magnitude
          return (
            <CircleMarker
              key={q.properties.publicID}
              center={[lat, mapLongitude(lon)]}
              radius={magnitudeRadius(m)}
              pathOptions={{
                color: '#fff',
                weight: 1.4,
                fillColor: magnitudeColor(m),
                fillOpacity: 0.82,
              }}
            >
              <Popup>
                <strong>{formatMag(m)}</strong>
                <div>{q.properties.locality}</div>
                <div>{formatRelativeTime(q.properties.time)}</div>
                <div>{q.properties.depth.toFixed(0)} km deep</div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {legend !== 'none' && (
      <div className={`map-legend${legend === 'types' ? ' sensor-legend' : ''}`}>
        {legend === 'types' ? (
          <>
            <div className="legend-title">Sensor types</div>
            {visibleTypes.slice(0, 6).map((type) => (
              <div className="legend-row" key={type}>
                <SensorTypeIcon type={type} size={16} />
                {type}
              </div>
            ))}
            {visibleTypes.length > 6 && (
              <div className="legend-row">Use the list to pick a type</div>
            )}
          </>
        ) : legend === 'stations' ? (
          <>
            <div className="legend-title">Touch a sensor</div>
            <div className="legend-row">
              <span className="leg-station" /> Ground shaker
            </div>
            <div className="legend-row">
              <span className="leg-station mag" /> Earth magnet
            </div>
            <div className="legend-row">
              <span className="leg-station gps" /> GPS pin
            </div>
            <div className="legend-row">
              <span className="leg-station ocean" /> Ocean
            </div>
          </>
        ) : (
          <>
            <div className="legend-title">Recent earthquakes</div>
            <div className="legend-row">
              <span className="leg-dot lg" /> M 5.0+
            </div>
            <div className="legend-row">
              <span className="leg-dot md" /> M 4.0–4.9
            </div>
            <div className="legend-row">
              <span className="leg-dot sm" /> M 3.0–3.9
            </div>
            {showStations && (
              <div className="legend-row">
                <span className="leg-station" /> Sensor
              </div>
            )}
          </>
        )}
        {showFullLink && (
          <Link to="/map" className="link-arrow map-full">
            View full map <img src={brandIcon('right-arrow.svg')} alt="" />
          </Link>
        )}
      </div>
      )}
    </div>
  )
}
