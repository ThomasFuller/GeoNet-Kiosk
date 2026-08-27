import { sumMagAtLeast } from '../api/geonet'
import { brandIcon } from '../brand'
import { QuakeMap } from '../components/QuakeMap'
import {
  Methods,
  Note,
  PageHero,
  QuakeRow,
  Scale,
  StatChips,
  Steps,
  ThemeFrame,
} from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

const MMI = [
  { mark: '1–2', label: 'Unnoticeable', hint: 'Barely sensed, if at all.', tone: '#efebe1' },
  { mark: '3', label: 'Weak', hint: 'Light indoor vibration. Hanging objects may swing.', tone: '#f5d7c4' },
  { mark: '4', label: 'Light', hint: 'Noticed indoors. Windows and crockery may rattle.', tone: '#f3b184' },
  { mark: '5', label: 'Moderate', hint: 'Felt outside. Small objects shift. Sleepers wake.', tone: '#ff7424', ink: '#fff' },
  { mark: '6', label: 'Strong', hint: 'Everyone feels it. Walking is hard. Objects fall.', tone: '#e83b00', ink: '#fff' },
  { mark: '7+', label: 'Severe+', hint: 'Standing is difficult. Weak buildings can be damaged.', tone: '#c62828', ink: '#fff' },
]

export function EarthquakesPage({ data }: { data: GeoNetBundle }) {
  const list = [...data.quakes].sort(
    (a, b) => +new Date(b.properties.time) - +new Date(a.properties.time),
  )
  const total = data.stats ? sumMagAtLeast(data.stats.days7, -1) : list.length
  const m4 = data.stats ? sumMagAtLeast(data.stats.days7, 4) : list.filter((q) => q.properties.magnitude >= 4).length
  const month = data.stats ? sumMagAtLeast(data.stats.days28, -1) : '—'

  return (
    <ThemeFrame
      head={
        <>
          <PageHero
            title="Earthquakes"
            blurb="Aotearoa sits on a plate boundary. This is the live GeoNet catalogue — locations and magnitudes as more stations report in."
            icon={brandIcon('earthquake.svg')}
          />
          <StatChips
            items={[
              { value: total, label: 'Last 7 days' },
              { value: month, label: 'Last 28 days' },
              { value: m4, label: 'M4.0+ this week' },
            ]}
          />
        </>
      }
      main={
        <div className="map-page-frame card">
          <QuakeMap quakes={list} stations={data.stations} showStations={false} showFullLink={false} />
        </div>
      }
      aside={
        <>
          <div className="card list-panel">
            <h2 className="section-title">Latest in the catalogue</h2>
            <ul className="quake-list">
              {list.slice(0, 10).map((q) => (
                <QuakeRow key={q.properties.publicID} quake={q} />
              ))}
            </ul>
          </div>
          <Scale
            title="Modified Mercalli intensity"
            intro="Magnitude is energy at the source. Intensity is shaking where you are — the New Zealand MMI scale."
            items={MMI}
          />
          <Steps
            title="How a quake gets onto this map"
            steps={[
              {
                title: 'Listen',
                body: 'Seismometers turn ground motion into a current. Digitisers stream it to GeoNet all day.',
              },
              {
                title: 'Detect',
                body: 'Computers ignore weather and trucks. About ten stations agreeing in space and time makes an event.',
              },
              {
                title: 'Locate',
                body: 'P waves arrive first, S waves later. Arrival times plus a rock-speed model give lat, lon and depth.',
              },
              {
                title: 'Refine',
                body: 'Automatic numbers go public in minutes. Analysts tighten larger quakes by hand.',
              },
            ]}
          />
          <Methods
            title="Two kinds of ground sensor"
            items={[
              {
                title: 'Seismometers',
                body: 'Very sensitive. They hear small local quakes and faint rumbles from the other side of the planet.',
              },
              {
                title: 'Strong motion',
                body: 'Deliberately insensitive. They keep recording up to about 4 g, which would clip a seismometer.',
              },
            ]}
          />
          <Note>
            Science data, not a warning. Long or strong shaking: Drop, Cover and Hold, then follow Civil Defence / NEMA.
          </Note>
        </>
      }
    />
  )
}
