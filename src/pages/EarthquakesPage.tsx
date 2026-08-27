import { sumMagAtLeast } from '../api/geonet'
import { brandIcon } from '../brand'
import { QuakeMap } from '../components/QuakeMap'
import { Methods, Note, PageHero, QuakeRow, Scale, StatChips, Steps } from '../components/science/ThemeKit'
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
    <div className="theme-page">
      <div className="theme-head">
        <PageHero
          title="Earthquakes"
          blurb="Aotearoa sits on a plate boundary, so the ground is always talking. This screen is the live catalogue — the same locations and magnitudes GeoNet publishes as more stations report in."
          icon={brandIcon('earthquake.svg')}
        />
        <StatChips
          items={[
            { value: total, label: 'Last 7 days' },
            { value: month, label: 'Last 28 days' },
            { value: m4, label: 'M4.0+ this week' },
            { value: data.feltReports, label: 'Felt reports' },
          ]}
        />
      </div>

      <div className="theme-live">
        <div className="map-page-frame card">
          <QuakeMap quakes={list} stations={data.stations} showStations={false} showFullLink={false} />
        </div>
        <div className="card list-panel">
          <h2 className="section-title">Latest in the catalogue</h2>
          <ul className="quake-list">
            {list.slice(0, 12).map((q) => (
              <QuakeRow key={q.properties.publicID} quake={q} />
            ))}
          </ul>
        </div>
      </div>

      <div className="pair-grid">
        <article className="card">
          <h2>Magnitude is energy at the source</h2>
          <p className="muted">
            Magnitude is a single number for the whole earthquake — how much energy was released where the fault slipped.
            GeoNet measures the biggest swing on each seismograph, corrects for distance and the instrument, then averages
            stations to get one magnitude.
          </p>
        </article>
        <article className="card">
          <h2>Intensity is shaking where you are</h2>
          <p className="muted">
            New Zealand quakes happen from the surface down past 600 km. A big deep quake can be barely felt. That is why
            GeoNet also uses the Modified Mercalli scale: what people and buildings actually experienced at a place.
          </p>
        </article>
      </div>

      <Scale
        title="Modified Mercalli intensity"
        intro="A simplified New Zealand MMI scale. Felt reports from the public help scientists map these colours across the country."
        items={MMI}
      />

      <Steps
        title="How a quake gets onto this map"
        steps={[
          {
            title: 'Listen',
            body: 'Seismometers turn ground motion into a tiny electrical current. Digitisers send that stream, all day, to GeoNet’s data centres.',
          },
          {
            title: 'Detect',
            body: 'Computers look for shaking that is not weather or trucks. Once about ten stations agree in space and time, it becomes an event.',
          },
          {
            title: 'Locate',
            body: 'P waves arrive first, S waves later. Those arrival times plus a model of rock speeds give latitude, longitude and depth.',
          },
          {
            title: 'Refine',
            body: 'Automatic numbers go public in minutes. For larger quakes, 24/7 GeoHazards Analysts check and tighten the origin by hand.',
          },
        ]}
      />

      <Methods
        title="Two kinds of ground sensor"
        items={[
          {
            title: 'Seismometers',
            body: 'Very sensitive. They hear small local quakes and the faint rumble of big earthquakes on the other side of the planet.',
          },
          {
            title: 'Strong motion',
            body: 'Deliberately insensitive. They keep recording when the ground leaps — up to about 4 g — which would clip a seismometer.',
          },
          {
            title: 'Felt reports',
            body: 'People are sensors too. “Felt it?” answers train the intensity map: who noticed it, and how strongly.',
          },
          {
            title: 'Open traces',
            body: 'Waveforms and origins are shared worldwide through FDSN — the same pipes researchers and this kiosk drink from.',
          },
        ]}
      />

      <Note>
        This kiosk shows science data, not official warnings. If you feel long or strong shaking, Drop, Cover and Hold —
        then follow Civil Defence / NEMA advice, not a screen.
      </Note>
    </div>
  )
}
