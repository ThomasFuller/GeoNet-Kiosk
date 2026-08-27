import { brandIcon } from '../brand'
import { QuakeMap } from '../components/QuakeMap'
import { Methods, Note, PageHero, StatChips, Steps } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function TsunamiPage({ data }: { data: GeoNetBundle }) {
  const ocean = data.stations.filter((s) => s.kinds.includes('dart') || s.kinds.includes('coastal'))
  const dart = ocean.filter((s) => s.kinds.includes('dart'))
  const coastal = ocean.filter((s) => s.kinds.includes('coastal'))
  const listed = [...ocean].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="theme-page">
      <div className="theme-head">
        <PageHero
          title="Tsunami"
          blurb="GeoNet does not issue tsunami warnings. It collects the earthquake and sea-level evidence that Civil Defence / NEMA and Pacific partners use — DART buoys in deep water, and gauges around the coast."
          icon={brandIcon('tsunami.svg')}
        />
        <StatChips
          items={[
            { value: dart.length, label: 'DART buoys' },
            { value: coastal.length, label: 'Coastal gauges' },
            { value: ocean.length, label: 'Ocean sensors live' },
          ]}
        />
      </div>

      <div className="theme-live">
        <div className="map-page-frame card">
          <QuakeMap
            quakes={[]}
            stations={ocean}
            showStations
            showAllStations
            showFullLink={false}
            legend="stations"
          />
        </div>
        <div className="card list-panel">
          <h2 className="section-title">Currently operating sea sensors</h2>
          <ul className="quake-list station-mini">
            {listed.map((s) => (
              <li key={s.code}>
                <span className={`kind-dot kind-${s.kinds.includes('dart') ? 'dart' : 'coastal'}`} />
                <div>
                  <strong>
                    {s.code} · {s.name}
                  </strong>
                  <p className="muted">{s.kinds.includes('dart') ? 'DART bottom pressure' : 'Coastal sea-level gauge'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Steps
        title="From seafloor to a sea-level trace"
        steps={[
          {
            title: 'The quake',
            body: 'Long-period seismometers flag offshore earthquakes that may have shoved the seafloor. That is the first clue a wave might exist.',
          },
          {
            title: 'Deep ocean',
            body: 'A DART sits on the seafloor and feels the extra water weight of a tsunami as a pressure bump — long before the wave reaches land.',
          },
          {
            title: 'The coast',
            body: 'Gauges in harbours and on the open coast record the actual sea. Tides dominate the picture; a tsunami is a longer extra wiggle.',
          },
          {
            title: 'People decide',
            body: 'NEMA issues official New Zealand notifications, with GNS Science advice, and watches Pacific Tsunami Warning Center messages.',
          },
        ]}
      />

      <div className="pair-grid">
        <article className="card">
          <h2>DART has two heartbeats</h2>
          <p className="muted">
            In quiet weather a buoy reports a water-height every 15 minutes, in a packet every six hours. If the bottom
            pressure recorder feels a tsunami, it jumps to event mode: 15-second samples for up to three hours. The
            National Geohazards Monitoring Centre can also trigger a buoy by hand.
          </p>
        </article>
        <article className="card">
          <h2>Gauges still see the tide</h2>
          <p className="muted">
            The obvious pattern on a coastal chart is the daily tide — about 12 hours between highs. Scientists subtract a
            tide model (de-tide) so a tsunami is easier to spot. Sheltered harbours look calmer; open-coast sites show
            more wind chop in the grey min–max band.
          </p>
        </article>
      </div>

      <Methods
        title="What this network cannot do"
        items={[
          {
            title: 'Local tsunami',
            body: 'A wave born just offshore can reach the beach before a siren. Long or strong coastal shaking is the natural warning to move to high ground.',
          },
          {
            title: 'Distant tsunami',
            body: 'DARTs and gauges come into their own for waves that still have hours to travel — confirmation, timing and size for emergency partners.',
          },
          {
            title: 'This kiosk',
            body: 'Use it to understand the instruments. Never wait on a display if the ground at the coast shakes for a long time.',
          },
        ]}
      />

      <Note>
        Official tsunami notifications in Aotearoa come from Civil Defence / NEMA, not GeoNet and not this kiosk.
      </Note>
    </div>
  )
}
